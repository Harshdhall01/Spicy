"use client";
import { useEffect, useState } from "react";
import "../app/orb.css";

const BARS = [10, 16, 22, 14, 30, 20, 38, 26, 34, 18, 28, 14, 22, 10];

function Bars({ side }: { side: "l" | "r" }) {
  return (
    <div className={`orb-bars ${side}`} aria-hidden="true">
      {BARS.map((h, i) => <i key={i} style={{ height: h, animationDelay: `${(i % 7) * 90}ms` }} />)}
    </div>
  );
}
const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const Mic = () => <Svg><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" /></Svg>;
const MicOff = () => <Svg><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8M1 1l22 22" /></Svg>;
const Hang = () => <Svg><path transform="rotate(135 12 12)" d="M10.7 13.3a16 16 0 0 0 2.6 2l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1z" /></Svg>;

type Props = {
  live: boolean;          // call is on
  speaking?: boolean;     // agent is talking
  muted?: boolean;
  disabled?: boolean;
  onToggle: () => void;   // tap the orb: start or end the call
  onMute?: () => void;    // shows Mute + End buttons while live
  idleHint?: string;
  compact?: boolean;      // smaller orb, leaves more room for the transcript
};

export default function Orb({ live, speaking = false, muted = false, disabled = false, onToggle, onMute, idleHint = "Click the mic to start a conversation", compact = false }: Props) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!live) { setSecs(0); return; }
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [live]);
  const mode = !live ? "idle" : speaking ? "speaking" : "listening";
  const timer = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

  return (
    <div className={`orb ${compact ? "compact" : ""}`} data-mode={mode}>
      <div className="orb-row">
        <Bars side="l" />
        <div className="orb-wrap">
          <div className="orb-halo" />
          <button className="orb-btn" onClick={onToggle} disabled={disabled} aria-label={live ? "End call" : "Talk to your agent"}>
            {live ? <span className="orb-stop" /> : <Mic />}
          </button>
        </div>
        <Bars side="r" />
      </div>
      <div className="orb-title">{mode === "idle" ? "Talk to your agent" : mode === "speaking" ? "Agent is speaking" : "Listening..."}</div>
      <div className="orb-sub">{live ? timer : idleHint}</div>
      {live && onMute && (
        <div className="orb-ctrls">
          <button className={`orb-cbtn ${muted ? "off" : ""}`} onClick={onMute}><span className="c">{muted ? <MicOff /> : <Mic />}</span>{muted ? "Unmute" : "Mute"}</button>
          <button className="orb-cbtn end" onClick={onToggle}><span className="c"><Hang /></span>End</button>
        </div>
      )}
    </div>
  );
}