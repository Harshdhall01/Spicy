"use client";
import { useState } from "react";
type Item = { id: number; kind: "FAQ" | "URL" | "File"; title: string };
export default function Knowledge() {
  const [items, setItems] = useState<Item[]>([]);
  const [faq, setFaq] = useState("");
  const [url, setUrl] = useState("");
  const add = (kind: Item["kind"], title: string) => setItems((l) => [...l, { id: Date.now() + Math.random(), kind, title }]);
  const box = "w-full rounded-xl border border-neutral-200 bg-transparent p-3 text-sm outline-none focus:border-black";
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <p className="text-sm text-neutral-500">Add what your agent should know: timings, prices, policies, FAQs. It will answer only from this.</p>
      <div className="space-y-2">
        <textarea rows={4} value={faq} onChange={(e) => setFaq(e.target.value)} placeholder="Paste FAQs or notes here" aria-label="Paste FAQs" className={box} />
        <button disabled={faq.trim().length < 5} onClick={() => { add("FAQ", faq.trim().slice(0, 48)); setFaq(""); }} className="rounded-xl bg-black px-4 py-1.5 text-sm text-white disabled:opacity-30">Add text</button>
      </div>
      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-website.com/faq" aria-label="Website URL" className={box} />
        <button disabled={!/^https?:\/\//.test(url)} onClick={() => { add("URL", url); setUrl(""); }} className="rounded-xl border border-neutral-200 px-4 text-sm disabled:opacity-30">Add URL</button>
      </div>
      <label className="block cursor-pointer rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 hover:bg-neutral-50">
        Upload PDF or text file
        <input type="file" accept=".pdf,.txt,.md" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) add("File", f.name); e.target.value = ""; }} />
      </label>
      {items.length === 0 ? <p className="text-center text-sm text-neutral-400">Nothing added yet.</p> : (
        <ul className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="truncate"><span className="mr-2 rounded-full border border-neutral-200 px-2 py-0.5 text-xs text-neutral-500">{i.kind}</span>{i.title}</span>
              <span className="flex items-center gap-3 text-xs text-neutral-500">Ready (demo)<button onClick={() => setItems((l) => l.filter((x) => x.id !== i.id))} aria-label="Remove" className="text-black">Remove</button></span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-neutral-500">In demo mode files stay in your browser. With your ElevenLabs key they will go to the agent knowledge base.</p>
    </div>
  );
}