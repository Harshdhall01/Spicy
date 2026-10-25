import { NextResponse } from "next/server";
const cache = new Map<string, ArrayBuffer>();
export async function POST(req: Request) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return NextResponse.json({ error: "No key" }, { status: 503 });
  const { text } = await req.json();
  const t = String(text || "").slice(0, 600);
  if (!t) return NextResponse.json({ error: "Empty" }, { status: 400 });
  const hit = cache.get(t);
  if (hit) return new NextResponse(hit, { headers: { "content-type": "audio/mpeg" } });
  const voice = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: "POST",
    headers: { "xi-api-key": key, "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({ text: t, model_id: "eleven_multilingual_v2" }),
  });
  if (!r.ok) return NextResponse.json({ error: "TTS failed", detail: (await r.text()).slice(0, 400) }, { status: r.status });
  const buf = await r.arrayBuffer();
  cache.set(t, buf);
  return new NextResponse(buf, { headers: { "content-type": "audio/mpeg" } });
}