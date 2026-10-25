"use client";
import { useMemo, useState } from "react";
import { reply } from "@/lib/brain";
type Call = { id: number; when: string; day: number; dur: string; who: string; sentiment: "Positive" | "Neutral" | "Negative"; score: number; intent: string; phone: string; slot: string; summary: string; lines: [string, string][] };
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const NAMES = ["Neha Verma", "Rahul Mehta", "Simran Kaur", "Aman Gupta", "Pooja Sharma", "Vikram Singh", "Anjali Rao", "Karan Malhotra", "Sneha Iyer", "Imran Khan", "Divya Nair", "Rohit Jain", "Meena Joshi", "Arjun Patel", "Kavita Reddy"];
const INTENTS: [string, number, string, string][] = [
  ["Book appointment", 84, "Kal shaam ka appointment chahiye", "booked a slot and agreed to a confirmation message"],
  ["Ask timings", 34, "Kitne baje khulte ho?", "asked for opening hours and got them"],
  ["Ask price", 62, "Price kitna lagega?", "asked about fees; agent shared the starting range and offered a callback"],
  ["Reschedule", 58, "Mujhe appointment reschedule karna hai", "wanted to change an existing slot"],
  ["Complaint", 46, "Pichli baar bahut wait karna pada", "was upset about waiting; agent apologised and arranged a human callback"],
  ["Ask location", 30, "Aapka address kahan hai?", "asked for the address and map"],
  ["Callback request", 72, "Mujhe kisi insaan se baat karni hai", "asked for a human and a callback was arranged"],
];
const DD = [0, 1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 6];
function make(): Call[] {
  return Array.from({ length: 48 }, (_, i) => {
    const [intent, base, q, sum] = INTENTS[(i * 3) % 7];
    const who = NAMES[(i * 7) % 15], day = DD[i % DD.length];
    const [a] = reply("dental clinic", q, {});
    return {
      id: i, day, who, intent, when: `${DAYS[day]}, ${9 + ((i * 3) % 10)}:${(i * 7) % 6}0`,
      dur: `${1 + ((i * 5) % 4)}:${String((i * 17) % 60).padStart(2, "0")}`,
      score: Math.max(8, Math.min(98, base + ((i * 13) % 23) - 8)),
      sentiment: intent === "Complaint" ? "Negative" : i % 4 === 0 ? "Neutral" : "Positive",
      phone: `+91 9${(i * 37) % 10}XXXX${1000 + ((i * 91) % 9000)}`,
      slot: intent === "Book appointment" ? `${DAYS[(day + 2) % 7]}, ${10 + (i % 7)}:00` : intent === "Callback request" ? "Callback requested" : "None",
      summary: `${who.split(" ")[0]} ${sum}.`,
      lines: [["Caller", q], ["Agent", a]],
    };
  });
}
export default function Insights({ demo }: { demo: boolean }) {
  const all = useMemo(make, []);
  const [f, setF] = useState("All");
  const [hot, setHot] = useState(false);
  const rows = all.filter((c) => (f === "All" || c.sentiment === f) && (!hot || c.score >= 75));
  const [sel, setSel] = useState<Call>(all[0]);
  const perDay = DAYS.map((_, d) => all.filter((c) => c.day === d).length), max = Math.max(...perDay);
  const pct = (s: string) => Math.round((all.filter((c) => c.sentiment === s).length / all.length) * 100);
  const stat = "rounded-2xl border border-neutral-200 p-4";
  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6 text-sm">
      {demo && <p className="rounded-xl bg-neutral-100 p-3 text-xs text-neutral-600">Sample data. Real calls will appear here once your ElevenLabs key is added.</p>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className={stat}><p className="text-xs text-neutral-500">Calls this week</p><p className="text-2xl font-semibold">{all.length}</p></div>
        <div className={stat}><p className="text-xs text-neutral-500">Appointments</p><p className="text-2xl font-semibold">{all.filter((c) => c.intent === "Book appointment").length}</p></div>
        <div className={stat}><p className="text-xs text-neutral-500">Hot leads (75+)</p><p className="text-2xl font-semibold">{all.filter((c) => c.score >= 75).length}</p></div>
        <div className={stat}><p className="text-xs text-neutral-500">Positive calls</p><p className="text-2xl font-semibold">{pct("Positive")}%</p></div>
      </div>
      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <div className={stat}><p className="text-xs text-neutral-500">Calls per day</p>
          <div className="mt-3 flex h-28 items-end gap-3">{perDay.map((n, i) => <div key={i} className="flex flex-1 flex-col items-center gap-1"><div className="w-full rounded-t-md bg-black" style={{ height: `${(n / max) * 100}%` }} /><span className="text-[10px] text-neutral-500">{DAYS[i]}</span></div>)}</div></div>
        <div className={stat}><p className="text-xs text-neutral-500">Sentiment</p>
          {["Positive", "Neutral", "Negative"].map((s) => <div key={s} className="mt-3"><div className="flex justify-between text-xs"><span>{s}</span><span>{pct(s)}%</span></div><div className="mt-1 h-1.5 rounded-full bg-neutral-100"><div className="h-1.5 rounded-full bg-black" style={{ width: `${pct(s)}%` }} /></div></div>)}</div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {["All", "Positive", "Neutral", "Negative"].map((s) => <button key={s} onClick={() => setF(s)} aria-pressed={f === s} className={`rounded-full border px-3 py-1 text-xs ${f === s ? "border-black bg-black text-white" : "border-neutral-200"}`}>{s}</button>)}
        <button onClick={() => setHot(!hot)} aria-pressed={hot} className={`rounded-full border px-3 py-1 text-xs ${hot ? "border-black bg-black text-white" : "border-neutral-200"}`}>Hot leads only</button>
        <span className="ml-auto text-xs text-neutral-500">{rows.length} calls</span>
      </div>
      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        <ul className="max-h-96 divide-y divide-neutral-200 overflow-y-auto rounded-2xl border border-neutral-200">
          {rows.length === 0 && <li className="p-4 text-neutral-400">No calls match this filter.</li>}
          {rows.map((c) => (
            <li key={c.id}><button onClick={() => setSel(c)} aria-current={sel.id === c.id} className={`w-full px-4 py-3 text-left ${sel.id === c.id ? "bg-neutral-100" : "hover:bg-neutral-50"}`}>
              <span className="flex justify-between"><span className="font-medium">{c.who}</span><span className="text-xs">{c.score}</span></span>
              <span className="text-xs text-neutral-500">{c.when} · {c.intent}</span></button></li>
          ))}
        </ul>
        <div className="space-y-4 rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-start justify-between gap-3"><p className="text-neutral-600">{sel.summary}</p><span className="shrink-0 rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs">{sel.sentiment}</span></div>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            {[["Name", sel.who], ["Phone", sel.phone], ["Intent", sel.intent], ["Appointment", sel.slot], ["Duration", sel.dur], ["Lead score", `${sel.score} / 100`]].map(([k, v]) => <div key={k}><dt className="text-neutral-500">{k}</dt><dd className="mt-0.5 text-sm">{v}</dd></div>)}
          </dl>
          <div className="mono space-y-1.5 rounded-xl bg-neutral-100 p-3 text-xs">{sel.lines.map(([w, t], i) => <p key={i}><b>{w}:</b> {t}</p>)}</div>
        </div>
      </div>
    </div>
  );
}