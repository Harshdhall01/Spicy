import { NextResponse } from "next/server";
import { getSignedUrl } from "@/lib/elevenlabs";
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("agentId");
  if (!id || id === "demo") return NextResponse.json({ error: "Demo mode: live calls are disabled." }, { status: 400 });
  try { return NextResponse.json({ signedUrl: await getSignedUrl(id) }); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 }); }
}