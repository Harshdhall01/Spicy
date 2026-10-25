import { NextResponse } from "next/server";
import { generateSpec } from "@/lib/llm";
import { createAgent } from "@/lib/elevenlabs";
import { demoSpec } from "@/lib/schema";
export const maxDuration = 60;
export async function POST(req: Request) {
  const { description } = await req.json();
  if (!description || String(description).trim().length < 8)
    return NextResponse.json({ error: "Describe your agent in a sentence or two." }, { status: 400 });
  try {
    if (process.env.DEMO_MODE === "true") return NextResponse.json({ spec: demoSpec(description), agentId: "demo", demo: true });
    const spec = await generateSpec(description);
    const agentId = await createAgent(spec);
    return NextResponse.json({ spec, agentId, demo: false });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Something went wrong." }, { status: 500 });
  }
}