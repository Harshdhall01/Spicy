import { AgentSpec, DEFAULT_GUARDRAILS } from "./schema";
const SYSTEM = `You design voice agents for Indian small businesses. Reply with ONLY a JSON object, no markdown:
{agent_name, persona, first_message, system_prompt, language (en|hi|ta|bn|mr|te), voice_style, guardrails[], tools[], knowledge_suggestions[], test_scenarios[]}.
Rules: Hindi/Hinglish/English must work; keep spoken sentences short; system_prompt must contain role, tone, flow, and guardrails. Never invent prices.`;

async function callLLM(user: string): Promise<string> {
  if (process.env.ANTHROPIC_API_KEY) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: process.env.LLM_MODEL || "claude-sonnet-4-5", max_tokens: 2500, system: SYSTEM, messages: [{ role: "user", content: user }] }),
    });
    if (!r.ok) throw new Error(`LLM error ${r.status}`);
    return (await r.json()).content[0].text;
  }
  if (process.env.OPENAI_API_KEY) {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ model: process.env.LLM_MODEL || "gpt-4o", response_format: { type: "json_object" }, messages: [{ role: "system", content: SYSTEM }, { role: "user", content: user }] }),
    });
    if (!r.ok) throw new Error(`LLM error ${r.status}`);
    return (await r.json()).choices[0].message.content;
  }
  throw new Error("No LLM key set. Add ANTHROPIC_API_KEY or OPENAI_API_KEY, or enable DEMO_MODE.");
}

export async function generateSpec(description: string): Promise<AgentSpec> {
  let lastErr: unknown;
  for (let i = 0; i < 2; i++) {
    try {
      const raw = (await callLLM(description)).replace(/```json|```/g, "").trim();
      const spec = AgentSpec.parse(JSON.parse(raw));
      spec.guardrails = Array.from(new Set([...DEFAULT_GUARDRAILS, ...spec.guardrails]));
      return spec;
    } catch (e) { lastErr = e; }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Could not generate agent");
}