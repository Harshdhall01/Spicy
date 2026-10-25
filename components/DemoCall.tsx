"use client";
import { useEffect, useRef, useState } from "react";
import { reply, greet, chipsFor, slotsFor, bookings, type St } from "@/lib/brain";
type L = { who: "agent" | "you"; text: string };
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
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [lines]);
  useEffect(() => () => { onRef.current = false; window.speechSynthesis?.cancel(); rec.current?.abort?.(); }, []);

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
  async function say(t: string) {
    busy.current = true; recOn.current = false; rec.current?.abort?.(); setListen(false);
    setLines((l) => [...l, { who: "agent", text: t }]);
    const id = ++utt.current;
    const done = () => { if (id !== utt.current) return; setSpeaking(false); busy.current = false; hear(); };
    if (ttsOk.current) {
      try {
        const r = await fetch("/api/tts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: t }) });
        if (!r.ok) throw new Error("no tts");
        const url = URL.createObjectURL(await r.blob());
        if (id !== utt.current) return;
        const a = new Audio(url); a.volume = 1;
        a.onplay = () => setSpeaking(true); a.onended = done; a.onerror = done;
        await a.play();
        return;
      } catch { ttsOk.current = false; }
    }
    if (!("speechSynthesis" in window)) return done();
    const synth = window.speechSynthesis; synth.cancel();
    const parts = t.match(/[^.!?]+[.!?]*/g) || [t];
    const v = pickVoice();
    let fin = false;
    const finish = () => { if (fin) return; fin = true; done(); };
    parts.forEach((p, i) => {
      const u = new SpeechSynthesisUtterance(p.trim());
      u.lang = v?.lang || "en-IN"; if (v) u.voice = v;
      u.volume = 1; u.rate = 0.95; u.pitch = 1.05;
      if (i === 0) u.onstart = () => setSpeaking(true);
      if (i === parts.length - 1) u.onend = finish;
      u.onerror = finish;
      synth.speak(u);
    });
  }
  function send(t: string) {
    if (!t.trim()) return;
    busy.current = true; recOn.current = false; rec.current?.abort?.(); setListen(false);
    setLines((l) => [...l, { who: "you", text: t }]);
    const [a, n] = reply(context, t, st.current); st.current = n; setView(n);
    setTimeout(() => say(a), 450);
  }
  function start() {
    setErr(""); fatal.current = false; onRef.current = true; setOn(true); st.current = {}; setView({}); setLines([]);
    if (!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) setErr("Is browser mein mic input nahi chalta. Chrome ya Edge use karein, ya neeche type karein.");
    say(greet(context));
  }
  function stop() { onRef.current = false; setOn(false); setListen(false); setSpeaking(false); busy.current = false; utt.current++; window.speechSynthesis?.cancel(); rec.current?.abort?.(); }
  function ask(q: string) { if (!onRef.current) { fatal.current = false; onRef.current = true; setOn(true); } send(q); }

  const g = view.date ? slotsFor(context, view.date) : null;
  const last = bookings[bookings.length - 1];
  return (
    <div className="flex h-full flex-col items-center gap-4 p-6">
      <p className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500">Demo mode: sample clinic data + browser voice. Natural voice comes with ElevenLabs.</p>
      <button onClick={on ? stop : start} aria-label={on ? "End call" : "Talk to your agent"} className="relative grid h-32 w-32 place-items-center rounded-full border border-neutral-200">
        <span className="absolute inset-0 rounded-full bg-neutral-100 transition-transform duration-300" style={{ transform: on ? `scale(${speaking ? 1.12 : 0.92})` : "scale(0.8)" }} />
        <span className="relative flex h-10 items-end gap-1" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => <i key={i} className="w-1.5 rounded-full bg-black transition-all duration-200" style={{ height: speaking ? 12 + ((i * 17) % 28) : listen ? 10 : 6 }} />)}
        </span>
      </button>
      <p className="text-sm text-neutral-500">{!on ? "Tap the orb to start a call" : speaking ? "Agent is speaking" : listen ? "Listening, go ahead" : "Type below or tap a question"}</p>
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
      <div className="mono h-48 w-full max-w-xl space-y-1.5 overflow-y-auto rounded-2xl border border-neutral-200 p-4 text-xs leading-relaxed">
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