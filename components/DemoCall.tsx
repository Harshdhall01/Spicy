"use client";
import { useEffect, useRef, useState } from "react";
import Orb from "./Orb";
import { reply, greet, chipsFor, slotsFor, bookings, type St } from "@/lib/brain";
import { notifyOwner, buildCall } from "@/lib/ownerInbox";
type L = { who: "agent" | "you"; text: string };

const TTS_TIMEOUT = 1500; // ms: isse zyada lage to is sentence ko browser voice bolegi

function splitSentences(t: string): string[] {
  const raw = t.match(/[^.!?।]+[.!?।]*/g) || [t];
  const out: string[] = [];
  for (const s of raw) {
    const x = s.trim();
    if (!x) continue;
    if (out.length && out[out.length - 1].length < 15) out[out.length - 1] += " " + x;
    else out.push(x);
  }
  return out.length ? out : [t];
}

export default function DemoCall({ context }: { context: string }) {
  const [lines, setLines] = useState<L[]>([]);
  const [on, setOn] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listen, setListen] = useState(false);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [view, setView] = useState<St>({});
  const [vlist, setVlist] = useState<SpeechSynthesisVoice[]>([]);
  const [vname, setVname] = useState("");
  const ttsOk = useRef(true);
  const ttsFails = useRef(0);
  const audioCache = useRef(new Map<string, string>());
  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const load = () => setVlist(window.speechSynthesis.getVoices().filter((x) => /^(en|hi)/i.test(x.lang)));
    load(); window.speechSynthesis.onvoiceschanged = load;
  }, []);
  const st = useRef<St>({});
  const rec = useRef<any>(null);
  const recOn = useRef(false);
  const onRef = useRef(false);
  const busy = useRef(false);
  const fatal = useRef(false);
  const utt = useRef(0);
  const end = useRef<HTMLDivElement>(null);

  // Owner notification ke liye session tracking
  const linesRef = useRef<L[]>([]);
  const t0Call = useRef(0);
  const bookBase = useRef(0);
  const lineBase = useRef(0);
  useEffect(() => { linesRef.current = lines; }, [lines]);
  function beginSession() {
    if (t0Call.current) return;
    t0Call.current = Date.now(); bookBase.current = bookings.length; lineBase.current = linesRef.current.length;
  }
  function finishCall() {
    if (!t0Call.current) return;
    const c = buildCall(linesRef.current.slice(lineBase.current), bookings.slice(bookBase.current), t0Call.current);
    t0Call.current = 0;
    if (c) notifyOwner(c);
  }

  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [lines]);
  useEffect(() => () => {
    finishCall();
    onRef.current = false; utt.current++;
    abortRef.current?.abort();
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    rec.current?.abort?.();
  }, []);

  function hear() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || !onRef.current || busy.current || fatal.current || recOn.current) return;
    const r = new SR(); r.lang = "en-IN"; r.interimResults = false; r.maxAlternatives = 1;
    r.onresult = (e: any) => { recOn.current = false; send(e.results[0][0].transcript); };
    r.onerror = (e: any) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") { fatal.current = true; setErr("Mic allow nahi hai. Browser mein mic permission dein, ya neeche type karke baat karein."); }
    };
    r.onend = () => { recOn.current = false; setListen(false); if (onRef.current && !busy.current && !fatal.current) setTimeout(hear, 250); };
    rec.current = r; recOn.current = true; setListen(true);
    try { r.start(); } catch { recOn.current = false; setListen(false); }
  }
  function pickVoice() {
    const all = window.speechSynthesis.getVoices();
    const chosen = all.find((x) => x.name === vname);
    if (chosen) return chosen;
    const score = (x: SpeechSynthesisVoice) => (/natural|online/i.test(x.name) ? 5 : 0) + (/en-IN|hi-IN/i.test(x.lang) ? 3 : 0) + (/neerja|swara|heera|google|kalpana|ravi/i.test(x.name) ? 2 : 0) + (/^en/i.test(x.lang) ? 1 : 0);
    return [...all].sort((a, b) => score(b) - score(a))[0];
  }

  // ElevenLabs audio ek sentence ka: client cache -> /api/tts. Fail hone par null.
  function fetchTts(t: string, signal: AbortSignal): Promise<string | null> {
    const hit = audioCache.current.get(t);
    if (hit) return Promise.resolve(hit);
    return fetch("/api/tts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: t }), signal })
      .then(async (r) => {
        if (!r.ok) { if (r.status === 503) ttsOk.current = false; throw new Error("tts " + r.status); }
        const url = URL.createObjectURL(await r.blob());
        audioCache.current.set(t, url);
        ttsFails.current = 0;
        return url;
      })
      .catch(() => {
        if (!signal.aborted && ++ttsFails.current >= 3) ttsOk.current = false;
        return null;
      });
  }
  function playUrl(url: string): Promise<boolean> {
    return new Promise((res) => {
      const a = new Audio(url); a.volume = 1; audioRef.current = a;
      a.onplay = () => setSpeaking(true);
      a.onended = () => res(true);
      a.onerror = () => res(false);
      a.play().catch(() => res(false));
    });
  }
  function speakBrowser(p: string): Promise<void> {
    return new Promise((res) => {
      if (!("speechSynthesis" in window)) return res();
      const v = pickVoice();
      const u = new SpeechSynthesisUtterance(p.trim());
      u.lang = v?.lang || "en-IN"; if (v) u.voice = v;
      u.volume = 1; u.rate = 0.95; u.pitch = 1.05;
      u.onstart = () => setSpeaking(true);
      u.onend = () => res(); u.onerror = () => res();
      window.speechSynthesis.speak(u);
    });
  }
  function haltAudio() {
    abortRef.current?.abort();
    const a = audioRef.current;
    if (a) { a.pause(); a.dispatchEvent(new Event("ended")); audioRef.current = null; }
    window.speechSynthesis?.cancel();
  }

  async function say(t: string) {
    busy.current = true; recOn.current = false; rec.current?.abort?.(); setListen(false);
    setLines((l) => [...l, { who: "agent", text: t }]);
    const id = ++utt.current;
    haltAudio();
    const ac = new AbortController(); abortRef.current = ac;
    const parts = splitSentences(t);
    const t0 = performance.now();
    const jobs: Promise<string | null>[] = [];
    const ensure = (i: number) => {
      if (i < parts.length && !jobs[i]) jobs[i] = ttsOk.current ? fetchTts(parts[i], ac.signal) : Promise.resolve(null);
    };
    ensure(0); ensure(1);
    for (let i = 0; i < parts.length; i++) {
      if (id !== utt.current) return;
      ensure(i + 1); ensure(i + 2);
      const url = await Promise.race([jobs[i], new Promise<null>((r) => setTimeout(() => r(null), TTS_TIMEOUT))]);
      if (id !== utt.current) return;
      if (i === 0) console.log(`[Spicy] time to first audio: ${Math.round(performance.now() - t0)}ms (${url ? "elevenlabs" : "browser"})`);
      let ok = false;
      if (url) ok = await playUrl(url);
      if (id !== utt.current) return;
      if (!ok) await speakBrowser(parts[i]);
    }
    if (id !== utt.current) return;
    setSpeaking(false); busy.current = false; hear();
  }
  function send(t: string) {
    if (!t.trim()) return;
    busy.current = true; recOn.current = false; rec.current?.abort?.(); setListen(false);
    setLines((l) => [...l, { who: "you", text: t }]);
    const [a, n] = reply(context, t, st.current); st.current = n; setView(n);
    setTimeout(() => say(a), 120);
  }
  function start() {
    linesRef.current = []; beginSession();
    setErr(""); fatal.current = false; onRef.current = true; setOn(true); st.current = {}; setView({}); setLines([]);
    if (!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) setErr("Is browser mein mic input nahi chalta. Chrome ya Edge use karein, ya neeche type karein.");
    say(greet(context));
  }
  function stop() { finishCall(); onRef.current = false; setOn(false); setListen(false); setSpeaking(false); busy.current = false; utt.current++; haltAudio(); rec.current?.abort?.(); }
  function ask(q: string) { if (!onRef.current) { fatal.current = false; onRef.current = true; setOn(true); beginSession(); } send(q); }

  const g = view.date ? slotsFor(context, view.date) : null;
  const last = bookings[bookings.length - 1];
  return (
    <div className="flex min-h-full flex-col items-center gap-4 p-6">
      <p className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500">Demo mode: sample clinic data + browser voice. Natural voice comes with ElevenLabs.</p>
      <Orb live={on} speaking={speaking} onToggle={on ? stop : start} />
{on && !speaking && !listen && <p className="text-xs text-neutral-500">Type below or tap a question</p>}
      {vlist.length > 0 && (
        <label className="flex items-center gap-2 text-xs text-neutral-500">Voice
          <select value={vname} onChange={(e) => setVname(e.target.value)} className="max-w-[240px] rounded-lg border border-neutral-200 bg-transparent px-2 py-1 text-black">
            <option value="">Auto (best available)</option>
            {vlist.map((x) => <option key={x.name} value={x.name}>{x.name}</option>)}
          </select>
        </label>
      )}
      {err && <p role="alert" className="max-w-sm text-center text-xs">{err}</p>}
      <div className="flex max-w-2xl flex-wrap justify-center gap-2">
        {chipsFor(context).map((q) => <button key={q} onClick={() => ask(q)} className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-100">{q}</button>)}
      </div>
      {g && (
        <div className="w-full max-w-xl rounded-2xl border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">Availability: {g.label}{g.open ? "" : " (closed)"}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {g.slots.map((s) => <span key={s.h} className={`rounded-lg border px-2.5 py-1 text-xs ${view.time === s.h ? "border-black bg-black text-white" : s.free ? "border-black" : "border-neutral-200 text-neutral-400 line-through"}`}>{s.t}</span>)}
          </div>
        </div>
      )}
      {last && <p className="w-full max-w-xl rounded-2xl bg-neutral-100 p-3 text-xs">Booked: <b>{last.name}</b>, {last.svc}, {last.date.split("-").reverse().join("/")} at {last.time > 12 ? last.time - 12 : last.time} {last.time >= 12 ? "PM" : "AM"} · ID {last.id}</p>}
      <div className="mono h-64 w-full max-w-xl shrink-0 space-y-1.5 overflow-y-auto rounded-2xl border border-neutral-200 p-4 text-xs leading-relaxed">
        {lines.length === 0 && <span className="text-neutral-400">The transcript appears here.</span>}
        {lines.map((l, i) => <p key={i}><b>{l.who === "agent" ? "Agent" : "You"}:</b> {l.text}</p>)}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); ask(text); setText(""); }} className="flex w-full max-w-xl gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask anything, in Hindi, Hinglish or English" aria-label="Type your question" className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-black" />
        <button disabled={!text.trim()} className="rounded-xl bg-black px-4 text-sm text-white disabled:opacity-30">Send</button>
      </form>
    </div>
  );
}