import { NextResponse } from "next/server";

const cache = new Map<string, ArrayBuffer>();
const headers = { "content-type": "audio/mpeg", "cache-control": "no-store" };

export async function POST(req: Request) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return NextResponse.json({ error: "No key" }, { status: 503 });

  let body: { text?: unknown } = {};
  try { body = await req.json(); } catch {}
  const t = String(body.text || "").slice(0, 600);
  if (!t) return NextResponse.json({ error: "Empty" }, { status: 400 });

  const voice = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  const ck = `${voice}:${t}`;
  const hit = cache.get(ck);
  if (hit) return new NextResponse(hit, { headers });

  const r = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_22050_32`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "content-type": "application/json", accept: "audio/mpeg" },
      body: JSON.stringify({ text: t, model_id: "eleven_flash_v2_5" }),
    }
  );
  if (!r.ok) {
    return NextResponse.json(
      { error: "TTS failed", detail: (await r.text()).slice(0, 400) },
      { status: r.status }
    );
  }
  const buf = await r.arrayBuffer();
  if (cache.size > 200) cache.clear();
  cache.set(ck, buf);
  return new NextResponse(buf, { headers });
}