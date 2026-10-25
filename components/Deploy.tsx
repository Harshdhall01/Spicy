"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

function Copy({ text, label }: { text: string; label: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={async () => { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); } catch {} }}
      className="rounded-xl border border-neutral-200 px-3 py-1.5 text-sm">{ok ? "Copied" : label}</button>
  );
}

export default function Deploy({ agentId, demo }: { agentId: string; demo: boolean }) {
  const [origin, setOrigin] = useState("");
  const [qr, setQr] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const link = `${origin}/a/${agentId}`;
  useEffect(() => {
    if (origin) QRCode.toDataURL(link, { margin: 1, width: 176, color: { dark: "#0A0A0A", light: "#FFFFFF" } }).then(setQr).catch(() => {});
  }, [link, origin]);
  const snippet = `<elevenlabs-convai agent-id="${agentId}"></elevenlabs-convai>\n<script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>`;
  const card = "rounded-2xl border border-neutral-200 p-5";
  return (
    <div className="mx-auto max-w-2xl space-y-5 p-6 text-sm">
      {demo && <p className="rounded-xl bg-neutral-100 p-3 text-xs text-neutral-600">Demo mode: this link opens your agent page, but live calls start only after you add your ElevenLabs key.</p>}
      <section className={card}>
        <p className="font-medium">Public link</p>
        <p className="mt-1 text-neutral-500">Anyone with this link can talk to your agent.</p>
        <div className="mt-3 flex gap-2">
          <input readOnly value={link} aria-label="Public link" className="mono flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-xs" />
          <Copy text={link} label="Copy" />
          <a href={link} target="_blank" rel="noreferrer" className="rounded-xl bg-black px-3 py-1.5 text-white">Open</a>
        </div>
        <div className="mt-4 flex items-center gap-4">
          {qr ? <img src={qr} alt="QR code for the public link" width={88} height={88} className="rounded-lg border border-neutral-200" /> : <div className="h-[88px] w-[88px] rounded-lg border border-neutral-200" />}
          <div><p>QR code</p><p className="text-xs text-neutral-500">Print it for your counter, flyer or visiting card.</p>
            {qr && <a href={qr} download="spicy-agent-qr.png" className="mt-1 inline-block text-xs underline">Download PNG</a>}</div>
        </div>
      </section>
      <section className={card}>
        <p className="font-medium">Website widget</p>
        <p className="mt-1 text-neutral-500">Paste this just before the closing body tag of your site.</p>
        <pre className="mono mt-3 overflow-x-auto rounded-xl bg-neutral-100 p-3 text-xs">{snippet}</pre>
        <div className="mt-3"><Copy text={snippet} label="Copy snippet" /></div>
      </section>
      <section className={card}>
        <p className="font-medium">Phone number</p>
        <p className="mt-1 text-neutral-500">Not connected yet. To get a real number for your agent:</p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-neutral-600">
          <li>Add your ElevenLabs API key to Spicy.</li>
          <li>Create a Twilio account and buy a number, or use your SIP trunk details.</li>
          <li>In ElevenLabs, open Agents, then Phone Numbers, and import the number.</li>
          <li>Assign it to this agent. Calls to that number will reach your agent.</li>
        </ol>
        <p className="mt-3 text-xs text-neutral-500">Indian numbers may need KYC from your provider. Spicy will automate these steps in a later update.</p>
      </section>
    </div>
  );
}