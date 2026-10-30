export type LiveCall = {
  id: number;
  startedAt: number;
  durSec: number;
  who: string;
  intent: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  score: number;
  slot: string;
  summary: string;
  lines: [string, string][];
};

const KEY = "spicy.liveCalls";
const EVT = "spicy:live";

export function getLiveCalls(): LiveCall[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function save(a: LiveCall[]) {
  try { localStorage.setItem(KEY, JSON.stringify(a.slice(0, 100))); } catch {}
  window.dispatchEvent(new Event(EVT));
}
export function addLiveCall(c: LiveCall) { save([c, ...getLiveCalls()]); }
export function clearLiveCalls() { save([]); }
export function onLiveCalls(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

const INTENTS: Record<string, [number, string]> = {
  "Book appointment": [84, "booked a slot"],
  "Ask timings": [34, "asked for opening hours"],
  "Ask price": [62, "asked about fees"],
  "Reschedule": [58, "wanted to change an existing slot"],
  "Complaint": [46, "raised a complaint"],
  "Ask location": [30, "asked for the address"],
  "Callback request": [72, "asked for a human callback"],
  "General question": [40, "had a general question"],
};

function detect(userText: string, booked: boolean): string {
  const t = userText.toLowerCase();
  if (booked) return "Book appointment";
  if (/complain|shikayat|pareshan|gussa|worst|bura|wait karna/.test(t)) return "Complaint";
  if (/human|insaan|callback|call back|baat karni|real person/.test(t)) return "Callback request";
  if (/reschedul|badal|change/.test(t)) return "Reschedule";
  if (/price|fee|cost|charge|kitna|paise|rate/.test(t)) return "Ask price";
  if (/address|location|kahan|where|map/.test(t)) return "Ask location";
  if (/timing|time|khul|open|baje/.test(t)) return "Ask timings";
  if (/book|appointment|slot|schedule/.test(t)) return "Book appointment";
  return "General question";
}

// DemoCall ke transcript + naye bookings se ek Insights-compatible call banata hai.
export function buildCall(
  lines: { who: "agent" | "you"; text: string }[],
  booked: any[],
  startedAt: number
): LiveCall | null {
  const userLines = lines.filter((l) => l.who === "you");
  if (userLines.length === 0) return null; // customer ne kuch bola hi nahi
  const b = booked[booked.length - 1];
  const intent = detect(userLines.map((l) => l.text).join(" "), !!b);
  const [score, phrase] = INTENTS[intent];
  const who = b?.name || "Live caller";
  let slot = intent === "Callback request" ? "Callback requested" : "None";
  let extra = "";
  if (b) {
    const [y, m, d] = String(b.date).split("-");
    const h = Number(b.time);
    slot = `${d}/${m} at ${h > 12 ? h - 12 : h} ${h >= 12 ? "PM" : "AM"}`;
    extra = ` ${b.svc} on ${slot} (ID ${b.id}).`;
    void y;
  }
  return {
    id: startedAt,
    startedAt,
    durSec: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
    who,
    intent,
    sentiment: intent === "Complaint" ? "Negative" : "Positive",
    score,
    slot,
    summary: `${who.split(" ")[0]} ${phrase}.${extra}`,
    lines: lines.map((l) => [l.who === "agent" ? "Agent" : "Caller", l.text] as [string, string]),
  };
}

// Inbox mein add + server ko bhejo (email ke liye). Errors swallow.
export function notifyOwner(c: LiveCall) {
  addLiveCall(c);
  try {
    fetch("/api/notify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(c),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}