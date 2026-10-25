"use client";
import { useState } from "react";
const TOOLS = [
  { id: "book", name: "Appointment booking", note: "Checks free slots and books into the built-in calendar." },
  { id: "lead", name: "Lead capture", note: "Saves name, phone and intent after the caller agrees." },
  { id: "msg", name: "SMS / WhatsApp confirmation", note: "Sends a confirmation message. Needs a provider key." },
  { id: "hook", name: "Custom webhook", note: "Calls your own URL with the conversation data." },
];
export default function Tools() {
  const [on, setOn] = useState<Record<string, boolean>>({ book: true, lead: true });
  const [hook, setHook] = useState("");
  return (
    <div className="text-sm">
      <p>Tools</p>
      <ul className="mt-2 divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
        {TOOLS.map((t) => (
          <li key={t.id} className="px-4 py-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={!!on[t.id]} onChange={() => setOn({ ...on, [t.id]: !on[t.id] })} className="mt-1 accent-black" />
              <span><span className="block">{t.name}</span><span className="text-xs text-neutral-500">{t.note}</span></span>
            </label>
            {t.id === "hook" && on.hook && <input value={hook} onChange={(e) => setHook(e.target.value)} placeholder="https://your-server.com/webhook" aria-label="Webhook URL" className="mt-2 w-full rounded-xl border border-neutral-200 p-2 text-sm outline-none focus:border-black" />}
          </li>
        ))}
      </ul>
    </div>
  );
}