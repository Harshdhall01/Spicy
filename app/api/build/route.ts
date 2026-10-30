import { NextResponse } from "next/server";
import { generateSpec } from "@/lib/llm";
import { createAgent } from "@/lib/elevenlabs";
import { demoSpec } from "@/lib/schema";
export const maxDuration = 60;
export async function POST(req: Request) {
  const { description } = await req.json();
  if (!description || String(description).trim().length < 8)
    return NextResponse.json({ error: "Describe your agent in a sentence or two." }, { status: 400 });
  const demo = (warning?: string) =>
    NextResponse.json({ spec: demoSpec(description), agentId: "demo", demo: true, ...(warning ? { warning } : {}) });
  if (process.env.DEMO_MODE === "true") return demo();
  let spec;
  try {
    spec = await generateSpec(description);
  } catch (e) {
    console.error("[Spicy] generateSpec failed, demo fallback:", e instanceof Error ? e.message : e);
    return demo("AI service unavailable, running in demo mode.");
  }
  try {
    const agentId = await createAgent(spec);
    return NextResponse.json({ spec, agentId, demo: false });
  } catch (e) {
    console.error("[Spicy] createAgent failed, demo fallback:", e instanceof Error ? e.message : e);
    return NextResponse.json({ spec, agentId: "demo", demo: true, warning: "Live agent failed, running in demo mode." });
  }
}