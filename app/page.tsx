"use client";
import { useRef, useState } from "react";
import Workspace from "@/components/Workspace";
import type { AgentSpec } from "@/lib/schema";

const CHIPS = ["Dental clinic receptionist", "Real estate lead qualifier", "Restaurant booking", "College club helpdesk", "NGO donor outreach", "Collections reminder agent"];
const STEPS = ["Understanding your request", "Designing persona & tone", "Writing system prompt", "Choosing voice & language", "Adding guardrails", "Creating agent on ElevenLabs", "Ready"];
const TEMPLATES = [
  { name: "Clinic", text: "A receptionist for my clinic. Books appointments, shares timings, never gives medical advice. Speaks Hinglish and English." },
  { name: "Salon", text: "A booking assistant for my salon. Shows services, books slots, confirms by WhatsApp. Speaks Hinglish." },
  { name: "Real estate", text: "A lead qualifier for my real estate firm. Asks budget, location and timeline, then books a site visit. Speaks Hinglish and English." },
  { name: "Restaurant", text: "A table booking agent for my restaurant. Takes party size, time and name, and answers menu and timing questions. Speaks Hinglish." },
  { name: "College club", text: "A helpdesk for our college club. Answers about events, membership and deadlines in a friendly tone. Speaks Hinglish and English." },
  { name: "NGO", text: "A donor outreach agent for our NGO. Thanks donors, explains our work, and never pressures anyone. Speaks Hindi and English." },
  { name: "Kirana / D2C", text: "An order assistant for my kirana store. Takes orders, confirms address and delivery time. Speaks Hinglish." },
  { name: "Collections", text: "A polite payment reminder agent. Reminds about dues, offers a callback, never threatens. Speaks Hindi and English." },
];
const HOW = [
  ["Describe it", "Type or speak what your assistant should do, in Hindi, Hinglish or English."],
  ["Talk to it", "Spicy builds the agent. Test it with your own voice and refine it by chatting."],
  ["Ship it", "Share a link, add it to your website, or print the QR code."],
];

export default function Home() {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"landing" | "building" | "ready">("landing");
  const [step, setStep] = useState(0);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<{ spec: AgentSpec; agentId: string; demo: boolean } | null>(null);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

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
    <div>
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="wordmark text-7xl sm:text-8xl">Spicy</h1>
        <p className="mt-4 text-lg text-neutral-500">Describe it. Talk to it. Ship it.</p>
        <div className="mt-10 w-full rounded-2xl border border-neutral-200 p-3 text-left">
          <textarea ref={taRef} value={text} onChange={(e) => setText(e.target.value)} rows={4} aria-label="Describe your voice agent"
            placeholder="e.g. A receptionist for my dental clinic in Faridabad. Speaks Hinglish, books appointments, never gives medical advice."
            className="w-full resize-none bg-transparent p-2 text-base outline-none placeholder:text-neutral-400" />
          <div className="flex items-center justify-between">
            <button onClick={dictate} aria-pressed={listening} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm">{listening ? "Listening... tap to stop" : "Speak"}</button>
            <button onClick={build} disabled={text.trim().length < 8} className="rounded-xl bg-black px-6 py-2 text-sm font-medium text-white disabled:opacity-30">Build</button>
          </div>
        </div>
        {err && <p role="alert" className="mt-3 text-sm">{err}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {CHIPS.map((c) => <button key={c} onClick={() => setText(`A voice agent for: ${c}. Speaks Hinglish and English.`)} className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100">{c}</button>)}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {HOW.map(([t, d], i) => (
            <div key={t} className="rounded-2xl border border-neutral-200 p-6">
              <p className="text-sm text-neutral-500">Step {i + 1}</p>
              <p className="mt-2 text-lg font-medium">{t}</p>
              <p className="mt-2 text-sm text-neutral-500">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="text-2xl font-semibold tracking-tight">Start from a template</h2>
        <p className="mt-2 text-sm text-neutral-500">One click fills the prompt. Edit it, then build.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((t) => (
            <button key={t.name} onClick={() => useTemplate(t.text)} className="rounded-2xl border border-neutral-200 p-5 text-left transition hover:bg-neutral-50">
              <span className="block font-medium">{t.name}</span>
              <span className="mt-2 block text-sm text-neutral-500">{t.text.split(".")[0]}.</span>
            </button>
          ))}
        </div>
      </section>

      <footer className="border-t border-neutral-200 px-6 py-8 text-center text-sm text-neutral-500">
        <span className="wordmark text-black">Spicy</span> · Voice agents for Bharat
      </footer>
    </div>
  );
}