"use client";
import { useRef, useState } from "react";
import Workspace from "@/components/Workspace";
import Landing from "@/components/Landing";
import type { AgentSpec } from "@/lib/schema";

const STEPS = ["Understanding your request", "Designing persona & tone", "Writing system prompt", "Choosing voice & language", "Adding guardrails", "Creating agent on ElevenLabs", "Ready"];

export default function Home() {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"landing" | "building" | "ready">("landing");
  const [step, setStep] = useState(0);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<{ spec: AgentSpec; agentId: string; demo: boolean } | null>(null);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);
  const taRef = useRef<HTMLInputElement>(null);

  function useTemplate(t: string) {
    setText(t); setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => taRef.current?.focus(), 400);
  }
  function dictate() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return setErr("Voice input isn't supported in this browser. Type instead.");
    if (listening) return recRef.current?.stop();
    const r = new SR(); r.lang = "en-IN"; r.interimResults = false;
    r.onresult = (e: any) => setText((t) => (t + " " + e.results[0][0].transcript).trim());
    r.onend = () => setListening(false);
    r.onerror = () => { setListening(false); setErr("Could not hear you. Check mic permission and try again."); };
    recRef.current = r; setListening(true); r.start();
  }
  async function build() {
    setErr(""); setPhase("building"); setStep(0);
    const tick = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 2)), 1400);
    try {
      const r = await fetch("/api/build", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ description: text }) });
      const j = await r.json();
      clearInterval(tick);
      if (!r.ok) { setErr(j.error); return setPhase("landing"); }
      setResult(j); setPhase("ready");
    } catch { clearInterval(tick); setErr("Network error. Check your connection."); setPhase("landing"); }
  }

  if (phase === "ready" && result)
    return <Workspace prompt={text} spec={result.spec} agentId={result.agentId} demo={result.demo} onNew={() => { setPhase("landing"); setResult(null); }} />;

  if (phase === "building")
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center" aria-busy="true">
        <div>
          <h1 className="wordmark text-5xl">Spicy</h1>
          <ul className="mx-auto mt-8 w-72 space-y-2.5 text-left">
            {STEPS.slice(0, -1).map((s, i) => (
              <li key={s} style={{ opacity: i <= step ? 1 : 0.25 }} className="flex items-center gap-3 text-sm transition-opacity">
                <span className={`grid h-4 w-4 place-items-center rounded-full border border-black text-[10px] ${i < step ? "bg-black text-white" : ""} ${i === step ? "live-dot" : ""}`}>{i < step ? "\u2713" : ""}</span>{s}
              </li>
            ))}
          </ul>
        </div>
      </main>
    );

  return (
    <Landing text={text} setText={setText} onBuild={build} onDictate={dictate} onTemplate={useTemplate}
      listening={listening} err={err} inputRef={taRef} />
  );
}