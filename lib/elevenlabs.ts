import { AgentSpec } from "./schema";
const BASE = "https://api.elevenlabs.io";
const key = () => { const k = process.env.ELEVENLABS_API_KEY; if (!k) throw new Error("ELEVENLABS_API_KEY is missing."); return k; };

async function el(path: string, init?: RequestInit) {
  const r = await fetch(BASE + path, { ...init, headers: { "xi-api-key": key(), "content-type": "application/json", ...(init?.headers || {}) } });
  if (!r.ok) {
    if (r.status === 401) throw new Error("ElevenLabs rejected the API key.");
    if (r.status === 429) throw new Error("ElevenLabs rate limit hit. Wait a moment and retry.");
    if (r.status === 402 || r.status === 403) throw new Error("ElevenLabs credits or plan limit reached.");
    throw new Error(`ElevenLabs error ${r.status}: ${(await r.text()).slice(0, 300)}`);
  }
  return r.json();
}

function buildConfig(spec: AgentSpec) {
  const lang = process.env.AGENT_LANGUAGE || spec.language;
  const prompt: Record<string, unknown> = {
    prompt: `${spec.system_prompt}\n\nGuardrails:\n- ${spec.guardrails.join("\n- ")}`,
  };
  if (process.env.AGENT_LLM) prompt.llm = process.env.AGENT_LLM; // optional, e.g. gemini-2.0-flash
  const tts: Record<string, unknown> = {
    // non-English agents ko v2_5 model chahiye, English ko v2
    model_id: process.env.AGENT_TTS_MODEL || (lang === "en" ? "eleven_flash_v2" : "eleven_flash_v2_5"),
  };
  if (process.env.ELEVENLABS_VOICE_ID) tts.voice_id = process.env.ELEVENLABS_VOICE_ID;
  return { agent: { first_message: spec.first_message, language: lang, prompt }, tts };
}

// ELEVENLABS_AGENT_ID set hai to wahi agent update hota hai (fixed agent), warna naya banta hai.
export async function createAgent(spec: AgentSpec): Promise<string> {
  const conversation_config = buildConfig(spec);
  const fixed = process.env.ELEVENLABS_AGENT_ID;
  if (fixed) {
    await el(`/v1/convai/agents/${encodeURIComponent(fixed)}`, {
      method: "PATCH",
      body: JSON.stringify({ name: spec.agent_name, conversation_config }),
    });
    return fixed;
  }
  const data = await el("/v1/convai/agents/create", {
    method: "POST",
    body: JSON.stringify({ name: spec.agent_name, conversation_config }),
  });
  return data.agent_id;
}

export async function getSignedUrl(agentId: string): Promise<string> {
  const data = await el(`/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`);
  return data.signed_url;
}