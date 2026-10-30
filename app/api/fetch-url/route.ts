import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PRIVATE = /^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)/i;

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const u = new URL(String(url));
    if (!/^https?:$/.test(u.protocol) || PRIVATE.test(u.hostname)) return NextResponse.json({ error: "Ye URL allowed nahi hai." }, { status: 400 });
    const r = await fetch(u, { signal: AbortSignal.timeout(8000), headers: { "user-agent": "SpicyBot/1.0" } });
    if (!r.ok) return NextResponse.json({ error: `Page ne ${r.status} diya.` }, { status: 400 });
    const html = (await r.text()).slice(0, 2_000_000);
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim().slice(0, 80) || u.hostname;
    const text = html
      .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<\/(p|div|li|h[1-6]|tr|br)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
      .replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
    if (text.length < 20) return NextResponse.json({ error: "Page me padhne layak text nahi mila." }, { status: 400 });
    return NextResponse.json({ title, text });
  } catch {
    return NextResponse.json({ error: "Page fetch nahi ho paya." }, { status: 400 });
  }
}