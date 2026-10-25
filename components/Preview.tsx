"use client";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useState } from "react";
import DemoCall from "./DemoCall";

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
    <div className="flex h-full flex-col items-center justify-between gap-6 p-6">
      {demo && <p className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500">Demo mode: live calls are off</p>}
      <div className="flex flex-col items-center gap-5">
        <button onClick={live ? () => conv.endSession() : start} disabled={demo}
          aria-label={live ? "End call" : "Talk to your agent"}
          className="relative grid h-40 w-40 place-items-center rounded-full border border-neutral-200 transition disabled:opacity-40">
          <span className="absolute inset-0 rounded-full bg-neutral-100 transition-transform duration-300"
            style={{ transform: live ? `scale(${conv.isSpeaking ? 1.12 : 0.92})` : "scale(0.8)" }} />
          <span className="relative flex h-10 items-end gap-1" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <i key={i} className="w-1.5 rounded-full bg-black transition-all duration-200"
                style={{ height: live && conv.isSpeaking ? 12 + ((i * 17) % 28) : 6 }} />
            ))}
          </span>
        </button>
        <p className="text-sm text-neutral-500">
          {live ? (conv.isSpeaking ? "Agent is speaking" : "Listening") : "Tap to talk to your agent"}
        </p>
        {live && <button onClick={() => setMuted(!muted)} className="rounded-xl border border-neutral-200 px-4 py-1.5 text-sm">{muted ? "Unmute" : "Mute"}</button>}
        {err && <p role="alert" className="max-w-xs text-center text-sm">{err}</p>}
      </div>
      <div className="mono h-48 w-full max-w-md overflow-y-auto rounded-2xl border border-neutral-200 p-4 text-xs leading-relaxed">
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
