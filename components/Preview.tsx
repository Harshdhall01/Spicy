"use client";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useState } from "react";
import DemoCall from "./DemoCall";
import Orb from "./Orb";

type Line = { role: "agent" | "you"; text: string };

function PreviewInner({ agentId, demo }: { agentId: string; demo: boolean }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [err, setErr] = useState("");
  const [muted, setMuted] = useState(false);
  const conv = useConversation({
    micMuted: muted,
    onMessage: (m: { source: string; message: string }) =>
      setLines((l) => [...l, { role: m.source === "ai" ? "agent" : "you", text: m.message }]),
    onError: (e: unknown) => setErr(typeof e === "string" ? e : "Connection problem. Try again."),
  } as never);
  const live = conv.status === "connected";

  async function start() {
    setErr("");
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch { return setErr("Microphone blocked. Allow mic access in your browser and retry."); }
    const r = await fetch(`/api/signed-url?agentId=${agentId}`);
    const j = await r.json();
    if (!r.ok) return setErr(j.error);
    await conv.startSession({ signedUrl: j.signedUrl });
  }

  return (
    <div className="flex min-h-full flex-col items-center gap-5 p-6">
      {demo && <p className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500">Demo mode: live calls are off</p>}
      <div className="flex flex-col items-center gap-3">
        <Orb compact live={live} speaking={conv.isSpeaking} muted={muted} disabled={demo}
          onToggle={live ? () => conv.endSession() : start} onMute={() => setMuted(!muted)} />
        {err && <p role="alert" className="max-w-xs text-center text-sm">{err}</p>}
      </div>
      <div className="mono h-64 w-full max-w-md shrink-0 overflow-y-auto rounded-2xl border border-neutral-200 p-4 text-xs leading-relaxed">
        {lines.length === 0 && <span className="text-neutral-400">The transcript appears here.</span>}
        {lines.map((l, i) => <p key={i}><b>{l.role === "agent" ? "Agent" : "You"}:</b> {l.text}</p>)}
      </div>
    </div>
  );
}

export default function Preview(props: { agentId: string; demo: boolean; context?: string }) {
  if (props.demo) return <DemoCall context={props.context || ""} />;
  return (
    <ConversationProvider>
      <PreviewInner {...props} />
    </ConversationProvider>
  );
}