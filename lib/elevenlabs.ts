import { AgentSpec } from "./schema";
const BASE = "https://api.elevenlabs.io";
const key = () => { const k = process.env.ELEVENLABS_API_KEY; if (!k) throw new Error("ELEVENLABS_API_KEY is missing."); return k; };

async function el(path: string, init?: RequestInit) {
  const r = await fetch(BASE + path, { ...init, headers: { "xi-api-key": key(), "content-type": "application/json", ...(init?.headers || {}) } });
  if (!r.ok) {
    if (r.status === 401) throw new Error("ElevenLabs rejected the API key.");
    if (r.status === 429) throw new Error("ElevenLabs rate limit hit. Wait a moment and retry.");
    if (r.status === 402 || r.status === 403) throw new Error("ElevenLabs credits or plan limit reached.");
    throw new Error(`ElevenLabs error ${r.status}: ${(await r.text()).slice(0, 200)}`);
  }
  return r.json();
}

export async function createAgent(spec: AgentSpec): Promise<string> {
  const prompt = `${spec.system_prompt}\n\nGuardrails:\n- ${spec.guardrails.join("\n- ")}`;
  const data = await el("/v1/convo-ai/agents/create", {
    method: "POST",
    body: JSON.stringify({
      name: spec.agent_name,
      conversation_config: {
        agent: { first_message: spec.first_message, language: spec.language, prompt: { prompt } },
      },
    }),
  });
  return data.agent_id;
}

export async function getSignedUrl(agentId: string): Promise<string> {
  const data = await el(`/v1/convo-ai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`);
  return data.signed_url;
}