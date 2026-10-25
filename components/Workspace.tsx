"use client";
import { useState } from "react";
import Preview from "./Preview";
import Knowledge from "./Knowledge";
import Tools from "./Tools";
import Deploy from "./Deploy";
import Insights from "./Insights";
import Tests from "./Tests";
import { applyRefine } from "@/lib/demo";
import type { AgentSpec } from "@/lib/schema";

const TABS = ["Preview", "Config", "Knowledge", "Tests", "Deploy", "Insights"] as const;
const SOON: Record<string, string> = {

};
const VOICES = ["Priya (Hindi + English, female)", "Meera (Hinglish, female)", "Arjun (Hindi + English, male)", "Rohan (English, male)"];
type Msg = { who: "you" | "spicy"; text: string };
type Ver = { spec: AgentSpec; label: string };

export default function Workspace({ prompt, spec, agentId, demo, onNew }: { prompt: string; spec: AgentSpec; agentId: string; demo: boolean; onNew: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Preview");
  const [versions, setVersions] = useState<Ver[]>([{ spec, label: "Initial build" }]);
  const [cur, setCur] = useState(0);
  const [draft, setDraft] = useState<AgentSpec>(spec);
  const [name, setName] = useState("Untitled agent");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { who: "you", text: prompt },
    { who: "spicy", text: `Built "${spec.agent_name}". Try it in Preview, or tell me what to change: "make it friendlier", "switch to Hindi", "never discuss pricing".` },
  ]);
  const [saved, setSaved] = useState(true);

  const push = (s: AgentSpec, label: string) => {
    const next = [...versions, { spec: s, label }];
    setVersions(next); setCur(next.length - 1); setDraft(s); setSaved(true);
  };
  function send() {
    if (!input.trim()) return;
    const r = applyRefine(versions[cur].spec, input);
    push(r.spec, input.slice(0, 40));
    setMsgs((m) => [...m, { who: "you", text: input }, { who: "spicy", text: `${r.note} Saved as version ${versions.length + 1}.` }]);
    setInput("");
  }
  const restore = (i: number) => {
    push(versions[i].spec, `Restored v${i + 1}`);
    setMsgs((m) => [...m, { who: "spicy", text: `Restored version ${i + 1} as version ${versions.length + 1}.` }]);
  };
  const set = (k: keyof AgentSpec, v: string) => { setDraft({ ...draft, [k]: v }); setSaved(false); };
  const field = "mt-1 w-full rounded-xl border border-neutral-200 bg-transparent p-3 text-sm outline-none focus:border-black";

  return (
    <div className="flex h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3">
        <div className="flex items-center gap-4">
          <span className="wordmark text-xl">Spicy</span>
          <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Project name" className="w-44 rounded-lg bg-transparent px-2 py-1 text-sm outline-none hover:bg-neutral-100 focus:bg-neutral-100" />
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          {demo && <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-xs">Demo mode</span>}
          <span className="flex items-center gap-2"><i className={`h-2 w-2 rounded-full bg-black ${saved ? "" : "live-dot"}`} />{saved ? "Saved" : "Unsaved"}</span>
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-xl border border-neutral-200 px-3 py-1.5 text-black">v{cur + 1} ▾</summary>
            <ul className="absolute right-0 z-10 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
              {versions.map((v, i) => (
                <li key={i}><button onClick={() => restore(i)} disabled={i === cur} className="flex w-full justify-between rounded-lg px-3 py-2 text-left text-black hover:bg-neutral-100 disabled:opacity-40"><span className="truncate">v{i + 1} {v.label}</span><span className="text-xs text-neutral-500">{i === cur ? "current" : "restore"}</span></button></li>
              ))}
            </ul>
          </details>
          <button disabled title="Coming soon" className="rounded-xl border border-neutral-200 px-3 py-1.5 opacity-40">Share</button>
        </div>
      </header>
      <div className="grid min-h-0 flex-1 grid-rows-[38%_62%] md:grid-rows-1 md:grid-cols-[380px_1fr]">
        <aside className="flex min-h-0 flex-col border-b border-neutral-200 md:border-b-0 md:border-r">
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {msgs.map((m, i) => (
              <p key={i} className={`rounded-2xl p-3 text-sm ${m.who === "you" ? "bg-neutral-100" : "border border-neutral-200"}`}>{m.text}</p>
            ))}
          </div>
          <div className="border-t border-neutral-200 p-3">
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Tell Spicy what to change" aria-label="Refine your agent" className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-black" />
              <button onClick={send} disabled={!input.trim()} className="rounded-xl bg-black px-4 text-sm text-white disabled:opacity-30">Send</button>
            </div>
            <button onClick={onNew} className="mt-2 text-xs text-neutral-500 underline">Start a new agent</button>
          </div>
        </aside>
        <section className="flex min-h-0 flex-col">
          <nav className="flex gap-1 overflow-x-auto border-b border-neutral-200 px-3" role="tablist">
            {TABS.map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`border-b-2 px-3 py-3 text-sm ${tab === t ? "border-black font-medium" : "border-transparent text-neutral-500"}`}>{t}</button>
            ))}
          </nav>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === "Preview" && <Preview agentId={agentId} demo={demo} context={versions[cur].spec.system_prompt + " " + versions[cur].spec.guardrails.join(" ")} />}
            {tab === "Knowledge" && <Knowledge />}
{tab === "Deploy" && <Deploy agentId={agentId} demo={demo} />}
{tab === "Insights" && <Insights demo={demo} />}
{tab === "Tests" && <Tests spec={versions[cur].spec} onFix={(rules) => { const s = versions[cur].spec; push({ ...s, system_prompt: s.system_prompt + "\n" + rules.join("\n"), guardrails: [...s.guardrails, ...rules] }, "Fix with Spicy"); setMsgs((m) => [...m, { who: "spicy", text: `Patched ${rules.length} gaps found by tests. Saved as version ${versions.length + 1}. Run the tests again.` }]); }} />}
{tab === "Config" && (
              <div className="mx-auto max-w-2xl space-y-5 p-6">
                <label className="block text-sm">Agent name<input className={field} value={draft.agent_name} onChange={(e) => set("agent_name", e.target.value)} /></label>
                <label className="block text-sm">First message<input className={field} value={draft.first_message} onChange={(e) => set("first_message", e.target.value)} /></label>
                <label className="block text-sm">System prompt<textarea rows={9} className={`${field} mono text-xs`} value={draft.system_prompt} onChange={(e) => set("system_prompt", e.target.value)} /></label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">Language
                    <select className={field} value={draft.language} onChange={(e) => set("language", e.target.value)}>
                      <option value="en">English</option><option value="hi">Hindi / Hinglish</option><option value="ta">Tamil</option><option value="bn">Bengali</option><option value="mr">Marathi</option><option value="te">Telugu</option>
                    </select></label>
                  <label className="block text-sm">Voice
                    <select className={field} value={draft.voice_style} onChange={(e) => set("voice_style", e.target.value)}>
                      {VOICES.map((v) => <option key={v}>{v}</option>)}
                    </select></label>
                </div>
                <p className="text-xs text-neutral-500">Voice preview needs your ElevenLabs key. Voices shown here are samples until then.</p>
                <Tools /><div className="text-sm"><p>Guardrails</p><ul className="mt-1 list-disc space-y-1 pl-5 text-neutral-500">{draft.guardrails.map((g) => <li key={g}>{g}</li>)}</ul></div>
                <button onClick={() => { push(draft, "Manual edit"); setMsgs((m) => [...m, { who: "spicy", text: `Saved your edits as version ${versions.length + 1}.` }]); }} disabled={saved} className="rounded-xl bg-black px-5 py-2 text-sm text-white disabled:opacity-30">Save changes</button>
              </div>
            )}
            {SOON[tab] && (
              <div className="grid h-full place-items-center p-10 text-center"><div><p className="font-medium">{tab}</p><p className="mt-1 text-sm text-neutral-500">{SOON[tab]}</p><p className="mt-3 inline-block rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500">Coming soon</p></div></div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}