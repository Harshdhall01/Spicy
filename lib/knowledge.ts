// Knowledge store: browser ki localStorage me save hota hai, koi server/DB nahi.
export type KItem = { id: string; kind: "text" | "url" | "file"; title: string; text: string };

const KEY = "spicy_knowledge";
let items: KItem[] = [];
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { items = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { items = []; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage full */ }
  subs.forEach((f) => f());
}

export const getItems = (): KItem[] => { load(); return items; };
export function addItem(kind: KItem["kind"], title: string, text: string) {
  load();
  items = [...items, { id: Math.random().toString(36).slice(2), kind, title, text: text.slice(0, 200000) }];
  save();
}
export function removeItem(id: string) { load(); items = items.filter((i) => i.id !== id); save(); }
export function subscribe(fn: () => void): () => void {
  subs.add(fn);
  return () => { subs.delete(fn); };
}

const STOP = new Set(("the is are a an of to in on at for and or do does you your what how can i me my we it this that with be have has " +
  "kya hai hain ho hoon ka ki ke ko se me mein main aap aapka aapke mera mujhe kab kaise kitna kitne kyun aur ya bhi toh to nahi na ji please tell " +
  "batao bataiye bata dijiye karo kar sakte sakta chahiye hota hoti hote wala wali wale yahan yaha kuch koi").split(" "));
const tok = (s: string) => s.toLowerCase().replace(/[^a-z0-9\u0900-\u097f\s]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
const stem = (w: string) => (w.length > 5 ? w.slice(0, 5) : w);

function chunks(text: string): string[] {
  const t = text.replace(/\n\s*(a|ans|answer)\s*[:\-]/gi, " A:");
  return t.split(/\n+|(?<=[.!?\u0964])\s+/).map((x) => x.trim()).filter((x) => x.length > 8).map((x) => x.slice(0, 400));
}

// Sabse milta-julta chunk dhundta hai. Match kamzor ho to "" deta hai, tab agent apne normal tareeke se chalta hai.
export function searchKnowledge(query: string): string {
  load();
  if (!items.length) return "";
  const qt = Array.from(new Set(tok(query).map(stem)));
  if (!qt.length) return "";
  let best = "", bestScore = 0;
  for (const it of items) {
    for (const ch of chunks(it.text)) {
      const ct = new Set(tok(ch).map(stem));
      let s = 0;
      for (const w of qt) if (ct.has(w)) s += w.length >= 5 ? 2 : 1;
      if (s > bestScore) { bestScore = s; best = ch; }
    }
  }
  if (bestScore < 2) return "";
  const i = best.indexOf(" A:");
  return (i >= 0 ? best.slice(i + 3) : best).trim();
}