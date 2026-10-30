import { AgentSpec, DEFAULT_GUARDRAILS } from "./schema";
const SYSTEM = `You design voice agents for Indian small businesses. Reply with ONLY a JSON object, no markdown:
{agent_name, persona, first_message, system_prompt, language (en|hi|ta|bn|mr|te), voice_style, guardrails[], tools[], knowledge_suggestions[], test_scenarios[]}.
Rules: Hindi/Hinglish/English must work; keep spoken sentences short; system_prompt must contain role, tone, flow, and guardrails. Never invent prices.
Language rules: if the description mentions Hindi or Hinglish, or the business is Indian, set language to "hi". When language is "hi": write first_message in natural spoken Hindi in Devanagari script (keep English business words like appointment, booking, doctor in Latin), and in system_prompt instruct the agent to ALWAYS reply in Devanagari Hindi (never Roman script), use simple everyday words, polite "aap", and to switch to English only if the caller speaks English. Use numerals and times in a form that is easy to say aloud.`;

async function openaiStyle(url: string, key: string, model: string, user: string, json: boolean): Promise<string> {
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      ...(json ? { response_format: { type: "json_object" } } : {}),
      messages: [{ role: "system", content: SYSTEM }, { role: "user", content: user }],
    }),
    signal: AbortSignal.timeout(25000),
  });
  if (!r.ok) throw new Error(`LLM error ${r.status}`);
  return (await r.json()).choices[0].message.content;
}

async function anthropic(key: string, user: string): Promise<string> {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.LLM_MODEL || "claude-sonnet-4-5", max_tokens: 2500, system: SYSTEM, messages: [{ role: "user", content: user }] }),
    signal: AbortSignal.timeout(25000),
  });
  if (!r.ok) throw new Error(`LLM error ${r.status}`);
  return (await r.json()).content[0].text;
}

// Order: Grok -> Claude -> OpenAI. Jo key set hai wahi try hoga; ek fail ho to agla.
async function callLLM(user: string): Promise<string> {
  const chain: [string, () => Promise<string>][] = [];
  if (process.env.XAI_API_KEY)
    chain.push(["xai", () => openaiStyle("https://api.x.ai/v1/chat/completions", process.env.XAI_API_KEY!, process.env.XAI_MODEL || "grok-4.3", user, false)]);
  if (process.env.ANTHROPIC_API_KEY) chain.push(["anthropic", () => anthropic(process.env.ANTHROPIC_API_KEY!, user)]);
  if (process.env.OPENAI_API_KEY)
    chain.push(["openai", () => openaiStyle("https://api.openai.com/v1/chat/completions", process.env.OPENAI_API_KEY!, process.env.OPENAI_MODEL || "gpt-4o", user, true)]);
  if (!chain.length) throw new Error("No LLM key set. Add XAI_API_KEY (or ANTHROPIC/OPENAI), or enable DEMO_MODE.");
  let last: unknown;
  for (const [name, run] of chain) {
    try { return await run(); }
    catch (e) { last = e; console.error(`[Spicy] LLM ${name} failed:`, e instanceof Error ? e.message : e); }
  }
  throw last instanceof Error ? last : new Error("All LLM providers failed");
}

function extractJson(s: string): string {
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