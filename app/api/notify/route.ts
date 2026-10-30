import { NextResponse } from "next/server";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

export async function POST(req: Request) {
  let c: any;
  try { c = await req.json(); } catch { return NextResponse.json({ error: "Bad JSON" }, { status: 400 }); }
  if (!c || typeof c.summary !== "string" || !Array.isArray(c.lines)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_EMAIL;
  if (!key || !to) return NextResponse.json({ ok: true, mode: "inbox-only" });

  const transcript = c.lines
    .slice(0, 60)
    .map((l: any) => `<p><b>${esc(String(l[0]))}:</b> ${esc(String(l[1]).slice(0, 500))}</p>`)
    .join("");
  const html = `<h3>${esc(String(c.summary))}</h3>
<p>Intent: ${esc(String(c.intent))} · Lead score: ${Number(c.score) || 0}/100 · Appointment: ${esc(String(c.slot))}</p>${transcript}`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: "Spicy <onboarding@resend.dev>",
        to: [to],
        subject: `New call: ${String(c.summary).slice(0, 80)}`,
        html,
      }),
    });
    return NextResponse.json({ ok: r.ok, mode: "email" });
  } catch {
    return NextResponse.json({ ok: false, mode: "email-failed" });
  }
}