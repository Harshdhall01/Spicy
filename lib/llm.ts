import { AgentSpec, DEFAULT_GUARDRAILS } from "./schema";
const SYSTEM = `You design voice agents for Indian small businesses. Reply with ONLY a JSON object, no markdown:
{agent_name, persona, first_message, system_prompt, language (en|hi|ta|bn|mr|te), voice_style, guardrails[], tools[], knowledge_suggestions[], test_scenarios[]}.
Rules: Hindi/Hinglish/English must work; keep spoken sentences short; system_prompt must contain role, tone, flow, and guardrails. Never invent prices.
Language rules: if the description mentions Hindi or Hinglish, or the business is Indian, set language to "hi". When language is "hi": write first_message in natural spoken Hindi in Devanagari script (keep English business words like appointment, booking, doctor in Latin), and in system_prompt instruct the agent to ALWAYS reply in Devanagari Hindi (never Roman script), use simple everyday words, polite "aap", and to switch to English only if the caller speaks English. Use numerals and times in a form that is easy to say aloud.`;

const PROVIDERS: { name: string; url: string; keyEnv: string; modelEnv: string; model: string }[] = [
  { name: "groq", url: "https://api.groq.com/openai/v1/chat/completions", keyEnv: "GROQ_API_KEY", modelEnv: "GROQ_MODEL", model: "openai/gpt-oss-120b" },
  { name: "gemini", url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", keyEnv: "GEMINI_API_KEY", modelEnv: "GEMINI_MODEL", model: "gemini-2.5-flash" },
  { name: "openrouter", url: "https://openrouter.ai/api/v1/chat/completions", keyEnv: "OPENROUTER_API_KEY", modelEnv: "OPENROUTER_MODEL", model: "google/gemma-4-31b-it:free" },
  { name: "xai", url: "https://api.x.ai/v1/chat/completions", keyEnv: "XAI_API_KEY", modelEnv: "XAI_MODEL", model: "grok-4.3" },
  { name: "openai", url: "https://api.openai.com/v1/chat/completions", keyEnv: "OPENAI_API_KEY", modelEnv: "OPENAI_MODEL", model: "gpt-4o" },
];

async function openaiStyle(url: string, key: string, model: string, system: string, user: string): Promise<string> {
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
    signal: AbortSignal.timeout(25000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 150)}`);
  return (await r.json()).choices[0].message.content;
}

async function anthropic(key: string, system: string, user: string): Promise<string> {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.LLM_MODEL || "claude-sonnet-4-5", max_tokens: 2500, system, messages: [{ role: "user", content: user }] }),
    signal: AbortSignal.timeout(25000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()).content[0].text;
}

async function callLLM(user: string, system: string = SYSTEM): Promise<string> {
  const chain: [string, () => Promise<string>][] = [];
  for (const p of PROVIDERS) {
    const key = process.env[p.keyEnv];
    if (key) chain.push([p.name, () => openaiStyle(p.url, key, process.env[p.modelEnv] || p.model, system, user)]);
  }
  if (process.env.ANTHROPIC_API_KEY) chain.push(["anthropic", () => anthropic(process.env.ANTHROPIC_API_KEY!, system, user)]);
  if (!chain.length) throw new Error("No LLM key set. Add GROQ_API_KEY or GEMINI_API_KEY.");
  let last: unknown;
  for (const [name, run] of chain) {
    try { return await run(); }
    catch (e) { last = e; console.error(`[Spicy] LLM ${name} failed:`, e instanceof Error ? e.message : e); }
  }
  throw last instanceof Error ? last : new Error("All LLM providers failed");
}

// Generic helper: kisi bhi system prompt ke saath free LLM chain use karo (tests/judge ke liye).
export async function complete(system: string, user: string): Promise<string> {
  return callLLM(user, system);
}

export function extractJson(s: string): string {
  const t = s.replace(/```json|```/g, "").trim();
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  return a >= 0 && b > a ? t.slice(a, b + 1) : t;
}

export async function generateSpec(description: string): Promise<AgentSpec> {
  let lastErr: unknown;
  for (let i = 0; i < 2; i++) {
    try {
      const spec = AgentSpec.parse(JSON.parse(extractJson(await callLLM(description))));
      spec.guardrails = Array.from(new Set([...DEFAULT_GUARDRAILS, ...spec.guardrails]));
      return spec;
    } catch (e) { lastErr = e; }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Could not generate agent");
}