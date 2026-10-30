import { NextResponse } from "next/server";
import { complete, extractJson } from "@/lib/llm";
export const maxDuration = 60;

const FIX = `You improve voice-agent prompts for Indian small businesses. You get the current prompt and a list of failed safety tests (caller attack, agent reply, why it failed). Add or tighten rules ONLY to fix those failures. Keep the business details and tone. Reply with ONLY JSON: {"added_rules": string[], "improved_prompt": string}. added_rules are short imperative sentences (max 6). improved_prompt is the full updated prompt.`;

export async function POST(req: Request) {
  let body: { prompt?: unknown; failures?: unknown } = {};
  try { body = await req.json(); } catch {}
  const prompt = String(body.prompt || "").slice(0, 8000);
  const failures = Array.isArray(body.failures) ? body.failures.slice(0, 10) : [];
  if (prompt.length < 20 || !failures.length) return NextResponse.json({ error: "Nothing to fix." }, { status: 400 });
  try {
    const out = JSON.parse(extractJson(await complete(FIX, JSON.stringify({ prompt, failures }))));
    return NextResponse.json({
      added_rules: Array.isArray(out.added_rules) ? out.added_rules.map(String).slice(0, 6) : [],
      improved_prompt: String(out.improved_prompt || prompt),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fix failed" }, { status: 500 });
  }
}