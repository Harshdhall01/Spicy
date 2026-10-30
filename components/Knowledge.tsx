"use client";
import { useEffect, useState } from "react";
import { addItem, getItems, removeItem, subscribe, type KItem } from "@/lib/knowledge";

const LABEL: Record<KItem["kind"], string> = { text: "FAQ", url: "URL", file: "File" };

export default function Knowledge() {
  const [items, setItems] = useState<KItem[]>([]);
  const [faq, setFaq] = useState("");
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setItems([...getItems()]);
    return subscribe(() => setItems([...getItems()]));
  }, []);

  async function addUrl() {
    setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/fetch-url", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Page nahi khul paya.");
      addItem("url", j.title || url, j.text);
      setUrl("");
    } catch (e) { setMsg(e instanceof Error ? e.message : "Page nahi khul paya."); }
    setBusy(false);
  }

  async function addFile(f: File) {
    if (/\.pdf$/i.test(f.name)) return setMsg("PDF abhi support nahi hai. Uska text copy karke paste karo, ya .txt/.md upload karo.");
    if (!/\.(txt|md|csv|json)$/i.test(f.name)) return setMsg("Sirf .txt, .md, .csv, .json chalte hain.");
    setMsg("");
    addItem("file", f.name, await f.text());
  }

  const box = "w-full rounded-xl border border-neutral-200 bg-transparent p-3 text-sm outline-none focus:border-black";
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <p className="text-sm text-neutral-500">Add what your agent should know: timings, prices, policies, FAQs. It will answer from this first.</p>
      <div className="space-y-2">
        <textarea rows={4} value={faq} onChange={(e) => setFaq(e.target.value)} placeholder="Paste FAQs or notes here (Q: ... A: ... format best chalta hai)" aria-label="Paste FAQs" className={box} />
        <button disabled={faq.trim().length < 5} onClick={() => { addItem("text", faq.trim().slice(0, 48), faq); setFaq(""); }} className="rounded-xl bg-black px-4 py-1.5 text-sm text-white disabled:opacity-30">Add text</button>
      </div>
      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-website.com/faq" aria-label="Website URL" className={box} />
        <button disabled={!/^https?:\/\//.test(url) || busy} onClick={addUrl} className="rounded-xl border border-neutral-200 px-4 text-sm disabled:opacity-30">{busy ? "..." : "Add URL"}</button>
      </div>
      <label className="block cursor-pointer rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 hover:bg-neutral-50">
        Upload text file (.txt, .md, .csv, .json)
        <input type="file" accept=".txt,.md,.csv,.json,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) addFile(f); e.target.value = ""; }} />
      </label>
      {msg && <p role="alert" className="text-sm">{msg}</p>}
      {items.length === 0 ? <p className="text-center text-sm text-neutral-400">Nothing added yet.</p> : (
        <ul className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="truncate"><span className="mr-2 rounded-full border border-neutral-200 px-2 py-0.5 text-xs text-neutral-500">{LABEL[i.kind]}</span>{i.title}</span>
              <span className="flex items-center gap-3 text-xs text-neutral-500">Ready (demo)<button onClick={() => removeItem(i.id)} aria-label="Remove" className="text-black">Remove</button></span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-neutral-500">In demo mode data stays in your browser. With your ElevenLabs key it needs to go to the agent knowledge base separately.</p>
    </div>
  );
}