export type St = { intent?: "book" | "cancel" | "cb"; svc?: string; date?: string; time?: number; pref?: string; name?: string; phone?: string; noPhone?: boolean; stage?: string; offer?: string; resched?: boolean; dishes?: [string, number, number][]; dishDone?: boolean };
export type Booking = { id: string; name: string; svc: string; date: string; time: number; phone?: string; biz: string; dishes?: string };
export const bookings: Booking[] = [];
type Svc = [string, RegExp, string, string];
type Dom = { biz: string; noun: string; open: number; close: number; closed: number[]; lunch?: number; svcAsk: string; services: Svc[]; menu?: [string, RegExp, number][]; hrs: string; loc: string; topics: string; price: string; faq: [RegExp, string, string?][]; chips: string[] };

const D: Record<string, Dom> = {
  clinic: { biz: "Smile Care Dental Clinic", noun: "appointment", open: 10, close: 19, closed: [0], lunch: 13,
    svcAsk: "Zaroor. Kis cheez ke liye aana hai: checkup, cleaning, filling, root canal, whitening, braces ya koi aur treatment?",
    hrs: "Monday se Saturday subah 10 se shaam 7 baje, 1 se 2 lunch break rehta hai, aur Sunday ko chhutti hoti hai",
    loc: "Sector 15, Faridabad, metro station ke paas, City Mall ke saamne",
    topics: "dental treatment, fees, timings aur appointment",
    price: "Consultation 300 rupaye hai. Cleaning 1200 se, filling 800 se, root canal 4500 se, whitening 6000 se aur braces 25000 se shuru hote hain",
    services: [
      ["scaling aur cleaning", /clean|scaling|polish|safai/, "Scaling aur cleaning 1200 rupaye se shuru hoti hai", "lagbhag 40 minute lagte hain"],
      ["filling", /\bfill|cavity|kida|keeda|sadan/, "Filling 800 rupaye se shuru hoti hai, per tooth", "ek sitting mein 30 minute ke andar ho jati hai"],
      ["root canal", /root ?canal|\brct\b|nerve/, "Root canal 4500 rupaye se shuru hota hai", "aam taur par 1 se 2 sitting lagti hain, har sitting 45 se 60 minute ki"],
      ["teeth whitening", /whiten|bleach|safed|chamak/, "Teeth whitening 6000 rupaye se shuru hoti hai", "ek ghante ki sitting hoti hai"],
      ["braces ya aligners", /brace|aligner|tedhe|straighten/, "Metal braces 25000 rupaye se shuru hote hain, aligners ke liye doctor pehle assess karte hain", "12 se 24 mahine lagte hain, har mahine ek visit hoti hai"],
      ["daant nikalwana", /extract|nikalwa|wisdom|daant nikal/, "Simple extraction 700 rupaye se shuru hota hai, wisdom tooth ki fees X-ray ke baad batate hain", "simple extraction 20 minute ka hota hai"],
      ["crown ya implant", /crown|\bcap\b|implant|bridge|denture/, "Crown 3500 rupaye se shuru hota hai, implant ki fees doctor X-ray ke baad batate hain", "crown 2 visit mein lagta hai, implant mein kuch mahine lagte hain"],
      ["bachon ka dental checkup", /\bkids?\b|bachch|child|baby/, "Bachon ki consultation bhi 300 rupaye hai", "lagbhag 20 minute lagte hain"],
      ["checkup aur consultation", /check ?up|consult|dikhana|dikhwana|dikhane|general/, "Consultation 300 rupaye hai, aur treatment lene par ye fees adjust ho jati hai", "lagbhag 20 se 30 minute lagte hain"],
    ],
    faq: [
      [/dard (hoga|hota)|painful|kitna dard|painless|\bdar\b|darr|anesth|injection|sunn/, "Hum local anaesthesia use karte hain, to treatment ke dauran dard nahi hota. Dar lagta ho to doctor ko pehle bata dijiye, wo aaram se karte hain."],
      [/\bpain\b|dard|toothache|swell|sujan|bleed|khoon|emergency|abscess|jabda/, "Dard, swelling ya khoon aaye to ise emergency maniye. Clinic hours mein turant aa jaiye, aise cases pehle dekhe jate hain. Dawai khud na lein.", "checkup aur consultation"],
      [/sensitiv|jhanjhan|thanda lag|garam lag/, "Thanda ya garam lagna sensitivity ya cavity ki wajah se ho sakta hai. Sahi karan doctor check karke batate hain.", "checkup aur consultation"],
      [/bad breath|badbu|muh ki|halitosis/, "Muh ki badbu aksar gums ki safai ya cavity se judi hoti hai. Scaling aur checkup se zyadatar theek ho jati hai.", "scaling aur cleaning"],
      [/\bgums?\b|masoode|masude/, "Gums se khoon ya sujan ho to scaling aur gum check zaroori hai. Der karne se problem badh sakti hai.", "scaling aur cleaning"],
      [/pregnan|garbh|diabet|sugar|\bbp\b|blood pressure|heart/, "Pregnancy, sugar, BP ya dil ki bimari ho to appointment par doctor ko zaroor batayein. Doctor uske hisaab se treatment plan karte hain."],
      [/sterili|hygiene|infection/, "Har patient ke liye instruments sterilise hote hain, aur single use gloves aur needles use hote hain."],
      [/x.?ray|\bopg\b|\bscan\b/, "Zarurat padne par digital X-ray clinic mein hi hota hai. Radiation bahut kam hota hai aur result turant mil jata hai."],
      [/\b(emi|upi|card|cash|payment|pay|installment)s?\b/, "UPI, card aur cash teeno chalte hain. Braces ya implant jaise bade treatment par EMI ka option bhi hai."],
      [/insurance|cashless|mediclaim/, "Kuch insurance ke saath cashless chalta hai. Policy ka naam bata dijiye, team confirm karke batayegi."],
      [/which doctor|kaun.*doctor|doctor.*(kaun|name)|specialist|\bdr\.? ?(mehta|kaur)/, "Dr. Mehta general dentistry aur root canal dekhte hain, aur Dr. Kaur braces aur aligners ki specialist hain. Kisse milna chahenge?"],
      [/first visit|pehli baar|kya laana|kya lana|documents|reports?\b/, "Pehli visit mein 20 se 30 minute lagte hain. Purani reports ya X-ray ho to le aaiye."],
      [/\bwait\b|intezaar|queue|bheed/, "Appointment ho to wait 10 minute se kam hota hai. Isiliye pehle se slot book karna behtar rehta hai."],
      [/parking|\bpark\b/, "Clinic ke saamne parking hai aur metro station paas hi hai."],
      [/(cancel|reschedule).*(policy|charge|fee)|refund/, "Appointment 4 ghante pehle tak free cancel ya reschedule ho sakti hai."],
      [/aftercare|treatment ke baad|kya khana|kya na khayen|kya khayen/, "Treatment ke baad kuch ghante garam khana aur chai se bachein aur doctor ki salah follow karein. Extraction ya root canal ke baad specific instructions doctor dete hain."],
      [/\bage\b|umar|kitni umar/, "Braces aur aligners aam taur par 12 saal ke baad shuru hote hain. Doctor check karke best age batate hain."],
      [/whitening.*(safe|nuksan)|safe.*whitening/, "Doctor ki nigrani mein whitening safe hoti hai. Kuch logon ko halki sensitivity ho sakti hai, jo kuch din mein theek ho jati hai."],
    ],
    chips: ["Kal shaam 5 baje cleaning ke liye appointment chahiye", "Root canal ka kharcha kitna hota hai?", "Daant mein bahut dard ho raha hai", "Kya insurance cashless chalta hai?", "Braces kitne time mein lagte hain?", "Mera appointment cancel karna hai", "Do you take UPI payments?"] },
  salon: { biz: "Glow Studio Salon", noun: "appointment", open: 10, close: 20, closed: [],
    svcAsk: "Zaroor. Kaunsi service chahiye: haircut, colour, facial ya bridal makeup?",
    hrs: "roz subah 10 se raat 8 baje", loc: "Sector 21 market, Faridabad", topics: "salon services, rates aur appointment",
    price: "Haircut 300 se, facial 800 se, colour 1500 se aur bridal makeup 12000 se shuru hote hain",
    services: [
      ["haircut", /hair ?cut|trim|\bstyle\b/, "Haircut 300 rupaye se shuru hota hai", "30 minute lagte hain"],
      ["hair colour", /colou?r|highlight|keratin|smoothing/, "Colour 1500 rupaye se aur keratin 3500 rupaye se shuru hota hai", "2 se 3 ghante lagte hain"],
      ["facial", /facial|cleanup|clean up|glow/, "Facial 800 rupaye se shuru hota hai", "45 minute lagte hain"],
      ["bridal makeup", /bridal|dulhan|shaadi|wedding/, "Bridal makeup 12000 rupaye se shuru hota hai, trial alag se hota hai", "3 se 4 ghante lagte hain"],
    ],
    faq: [[/offer|discount|deal/, "Pehli baar aane walon ke liye is mahine 15 percent off chal raha hai."], [/\b(men|ladies|women|kids|gents)\b/, "Men, women aur kids teeno ke liye services hain."], [/home service|ghar/, "Home service abhi limited areas mein hai. Area bata dijiye, team confirm karegi."]],
    chips: ["Kal shaam 5 baje haircut book karna hai", "Bridal makeup ka package kitne ka hai?", "Koi offer chal raha hai?"] },
  estate: { biz: "Sunrise Realty", noun: "site visit", open: 10, close: 19, closed: [0], svcAsk: "",
    hrs: "Monday se Saturday subah 10 se shaam 7 baje", loc: "Sector 28, Faridabad", topics: "flats, plots, rentals aur site visit",
    price: "2 BHK lagbhag 45 lakh se aur 3 BHK lagbhag 70 lakh se shuru hote hain", services: [],
    faq: [[/bhk|flat|plot|rent|villa/, "Hamare paas 2 aur 3 BHK flats, plots aur rentals hain. Budget aur area bata dijiye, main site visit book kar deti hoon."], [/loan|emi|bank/, "Loan ke liye bank partners se connect karwa dete hain. EMI ka exact hisaab team karegi."], [/rera/, "Hamare saare listed projects RERA registered hain."], [/possession|ready to move|under construction/, "Ready to move aur under construction dono options hain."]],
    chips: ["Kal 4 baje site visit book karna hai", "3 BHK ka budget kitna hoga?", "Kya projects RERA registered hain?"] },
  food: { biz: "Zaika Darbar Restaurant", noun: "table", open: 12, close: 23, closed: [], svcAsk: "",
    hrs: "roz dopahar 12 se raat 11 baje", loc: "City Centre, Faridabad", topics: "menu, dishes, timings aur table booking",
    price: "Do logon ka kharcha lagbhag 800 se 1000 rupaye aata hai", services: [],
    menu: [
      ["Margherita Pizza", /margh?erita|(?<!tikka )\bpizza\b/, 249],
      ["Paneer Tikka Pizza", /tikka/, 329],
      ["Veg Burger", /veg burger|(?<!chicken )\bburger\b/, 149],
      ["Chicken Burger", /chicken/, 199],
      ["Dal Makhani", /makhani|dal makhani/, 219],
      ["Dal Tadka", /tadka|(?<!makhani )\bdal\b(?! makhani)/, 179],
      ["Paneer Butter Masala", /butter masala|paneer butter|\bpbm\b/, 289],
      ["Kadhai Paneer", /kadhai|kadai/, 279],
      ["Aloo Gobhi", /aloo|gobhi|gobi/, 189],
      ["Butter Naan", /naan|\broti\b/, 49],
      ["Jeera Rice", /jeera|\brice\b/, 129],
      ["Gulab Jamun", /gulab|jamun|dessert|meetha/, 99],
    ],
    faq: [
      [/menu|dishes|kya kya (milta|hai)|khane (mein|me)/, "Hamare menu mein pizza, burger, dal, paneer ki sabji, naan, rice aur dessert hain. Pizza 249 se, burger 149 se, dal 179 se aur paneer sabji 279 se shuru hoti hai. Table book karun ya dishes pre-order karun?"],
      [/pizza/, "Pizza mein Margherita 249 rupaye aur Paneer Tikka Pizza 329 rupaye ka hai."],
      [/burger/, "Burger mein Veg Burger 149 rupaye aur Chicken Burger 199 rupaye ka hai."],
      [/\bdal\b|makhani|tadka/, "Dal mein Dal Makhani 219 rupaye aur Dal Tadka 179 rupaye ki hai."],
      [/paneer|sabji|sabzi|kadhai|aloo|gobhi/, "Sabji mein Paneer Butter Masala 289, Kadhai Paneer 279 aur Aloo Gobhi 189 rupaye ki hai."],
      [/naan|roti|rice|jeera/, "Butter Naan 49 rupaye ka aur Jeera Rice 129 rupaye ka hai."],
      [/dessert|meetha|gulab|jamun/, "Dessert mein Gulab Jamun 99 rupaye ka hai."],
      [/veg|jain|vegan/, "Veg, non veg aur Jain options sab available hain."], [/delivery|takeaway|parcel/, "Delivery aur takeaway dono hain."], [/parking|valet/, "Restaurant ke saamne parking hai, weekend par valet bhi milta hai."], [/birthday|anniversary|cake/, "Birthday ya anniversary ke liye hum table decorate kar dete hain."]],
    chips: ["Aaj raat 8 baje table book karna hai", "Menu mein kya kya milta hai?", "Kal 8 baje 4 logo ka table, 2 paneer butter masala aur 1 pizza bhi", "Kya Jain khana milta hai?", "Delivery hoti hai?"] },
  gen: { biz: "hamari team", noun: "appointment", open: 10, close: 19, closed: [0], svcAsk: "",
    hrs: "Monday se Saturday subah 10 se shaam 7 baje", loc: "hamare office mein", topics: "hamari services aur appointment", price: "Exact details team confirm karegi", services: [], faq: [],
    chips: ["Kal 4 baje appointment book karna hai", "Aap kitne baje tak khule ho?", "Kya main kisi insaan se baat kar sakta hoon?"] },
};
const dom = (c: string) => /clinic|dental|dentist|doctor|hospital|teeth|daant/.test(c) ? "clinic" : /salon|\bspa\b|hair|beauty/.test(c) ? "salon" : /real estate|property|flat|bhk|realty/.test(c) ? "estate" : /restaurant|cafe|menu|dining/.test(c) ? "food" : "gen";
const getD = (ctx: string) => D[dom(ctx.toLowerCase())];
export const greet = (ctx: string) => `Namaste! ${getD(ctx).biz} mein aapka swagat hai. Main aapki kaise madad kar sakti hoon?`;
export const chipsFor = (ctx: string) => getD(ctx).chips;

const key = (x: Date) => `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`;
const fromKey = (k: string) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const shift = (k: string, n: number) => { const x = fromKey(k); x.setDate(x.getDate() + n); return key(x); };
const today = () => { const x = new Date(); x.setHours(0, 0, 0, 0); return key(x); };
const label = (k: string) => { const diff = Math.round((fromKey(k).getTime() - fromKey(today()).getTime()) / 864e5); const n = fromKey(k).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" }); return diff === 0 ? `aaj (${n})` : diff === 1 ? `kal (${n})` : n; };
const hh = (h: number) => `${h > 12 ? h - 12 : h} ${h >= 12 ? "PM" : "AM"}`;
const lst = (a: number[]) => a.map(hh).join(", ").replace(/, ([^,]*)$/, " aur $1");
const hours = (d: Dom) => Array.from({ length: d.close - d.open }, (_, i) => d.open + i).filter((h) => h !== d.lunch);
const isOpen = (d: Dom, k: string) => !d.closed.includes(fromKey(k).getDay());
const hash = (s: string) => { let x = 0; for (const c of s) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x; };
const isFree = (d: Dom, k: string, h: number) => {
  if (bookings.some((b) => b.biz === d.biz && b.date === k && b.time === h)) return false;
  if (k === today() && h <= new Date().getHours()) return false;
  return (hash(k + d.biz) + h * 17) % 7 >= 2;
};
const freeHrs = (d: Dom, k: string) => (isOpen(d, k) ? hours(d).filter((h) => isFree(d, k, h)) : []);
const nextFree = (d: Dom, k: string) => { for (let i = 1; i <= 14; i++) { const n = shift(k, i); if (freeHrs(d, n).length) return n; } return k; };
export function slotsFor(ctx: string, k: string) {
  const d = getD(ctx);
  return { label: label(k), open: isOpen(d, k), slots: isOpen(d, k) ? hours(d).map((h) => ({ h, t: hh(h), free: isFree(d, k, h) })) : [] };
}

const WD = [/\b(sun(day)?|ravi(var|war)?|itwar)\b/, /\b(mon(day)?|som(var|war)?)\b/, /\b(tue(s|sday)?|mangal(var|war)?)\b/, /\b(wed(nesday)?|budh(var|war)?)\b/, /\b(thu(r|rs|rsday)?|guru(var|war)?)\b/, /\b(fri(day)?|shukra(var|war)?)\b/, /\b(sat(urday)?|shani(var|war)?)\b/];
const MON = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
function parseDate(t: string): string | undefined {
  if (/\b(aaj|today|tonight|abhi)\b/.test(t)) return today();
  if (/\b(parso|day after)\b/.test(t)) return shift(today(), 2);
  if (/\b(kal|tomorrow)\b/.test(t)) return shift(today(), 1);
  const m = t.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/);
  if (m) { const now = new Date(); let x = new Date(now.getFullYear(), MON.indexOf(m[2]), +m[1]); if (x < fromKey(today())) x = new Date(now.getFullYear() + 1, MON.indexOf(m[2]), +m[1]); return key(x); }
  for (let i = 0; i < 7; i++) if (WD[i].test(t)) return shift(today(), (i - new Date().getDay() + 7) % 7);
}
function parseTime(raw: string, loose: boolean): { h?: number; p?: string } {
  const t = raw.replace(/\b\d{1,2}(st|nd|rd|th)?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*/g, "");
  const pm = /\b(shaam|sham|evening|raat|night)\b/.test(t), am = /\b(subah|morning|savere)\b/.test(t), nn = /\b(dopahar|afternoon|noon)\b/.test(t);
  const m = t.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|baje|bje|o'?clock)?(?!\d)/);
  if (m && (m[3] || pm || am || nn || loose)) {
    const n = +m[1], mk = m[3];
    if (n > 23 || n === 0) return {};
    let h = n;
    if (n >= 13) return { h };
    if (mk === "pm" || pm) { if (n < 12) h = n + 12; } else if (mk === "am" || am) { if (n === 12) h = 0; } else if (nn) { if (n <= 6) h = n + 12; } else if (n <= 9) h = n + 12;
    return { h };
  }
  return pm ? { p: "pm" } : am ? { p: "am" } : nn ? { p: "noon" } : {};
}
const cleanName = (x: string) => {
  if (/\?|kyun|why|\b(nahi|no|nope)\b/i.test(x) || /\d/.test(x)) return "";
  const w = x.replace(/\b(mera|naam|name|my|is|main|mai|i|am|im|hai|hoon|hu|ji|sir|madam|se|bol|raha|rahi|the|its)\b/gi, " ").replace(/[^a-zA-Z\s]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (!w.length || w.length > 3) return "";
  return w.slice(0, 2).map((s) => s[0].toUpperCase() + s.slice(1).toLowerCase()).join(" ");
};

// ---- Restaurant dishes helpers ----
type Dish3 = [string, number, number];
const dishTxt = (ds: Dish3[]) => ds.map(([n, q]) => `${q} ${n}`).join(", ");
const dishTotal = (ds: Dish3[]) => ds.reduce((s, [, q, p]) => s + q * p, 0);
const menuFind = (d: Dom, t: string): Dish3[] => (d.menu || []).flatMap(([n, r, p]) => {
  if (!r.test(t)) return [];
  const q = t.match(new RegExp("(\\d{1,2})\\s*(?:x\\s*|plates?\\s*)?(?:" + r.source + ")"));
  return [[n, q ? +q[1] : 1, p] as Dish3];
});

function flow(d: Dom, st: St, pre = ""): [string, St] {
  const o = (x: string, s: St = st): [string, St] => [pre ? `${pre} ${x}` : x, s];
  if (d.services.length && !st.svc) return o(d.svcAsk, { ...st, stage: "svc" });
  if (!st.date) return o("Kaunse din aana chahenge? Aaj, kal ya koi aur din bata dijiye.", { ...st, stage: "date" });
  const none = () => { const nx = nextFree(d, st.date!); return o(`${label(st.date!)} ko ${d.biz} mein koi slot khaali nahi hai. ${label(nx)} ko ${lst(freeHrs(d, nx).slice(0, 4))} khaali hain. Kya wo din chalega?`, { ...st, date: undefined, time: undefined, offer: nx, stage: "date" }); };
  if (!isOpen(d, st.date)) { const nx = nextFree(d, st.date); return o(`${label(st.date)} ko ${d.biz} band rehta hai. ${label(nx)} ko ${lst(freeHrs(d, nx).slice(0, 4))} khaali hain. Kya wo din chalega?`, { ...st, date: undefined, time: undefined, offer: nx, stage: "date" }); }
  const fr = freeHrs(d, st.date);
  if (!fr.length) return none();
  if (st.time == null) {
    let show = fr;
    if (st.pref) show = fr.filter((h) => (st.pref === "am" ? h < 12 : st.pref === "pm" ? h >= 16 : h >= 12 && h < 16));
    if (!show.length) show = fr;
    return o(`${label(st.date)} ko ${lst(show.slice(0, 6))} khaali hain. Kaunsa time theek rahega?`, { ...st, stage: "time" });
  }
  const h = st.time;
  if (h < d.open || h >= d.close) return o(`${d.biz} ${hh(d.open)} se ${hh(d.close)} tak khula hai, aur last slot ${hh(d.close - 1)} ka hai. Koi aur time bataiye?`, { ...st, time: undefined, stage: "time" });
  if (h === d.lunch) return o(`${hh(h)} par lunch break rehta hai. ${lst(fr.slice(0, 5))} khaali hain. Inmein se kaunsa?`, { ...st, time: undefined, stage: "time" });
  if (!fr.includes(h)) {
    const alt = [...fr].sort((a, b) => Math.abs(a - h) - Math.abs(b - h)).slice(0, 3).sort((a, b) => a - b);
    return o(`${hh(h)} ka slot ${label(st.date)} ko already book hai. Sabse paas ke khaali slot ${lst(alt)} hain. Inmein se kaunsa chahenge?`, { ...st, time: undefined, stage: "time" });
  }
  const head = ["name", "phone", "confirm", "dish"].includes(st.stage || "") ? "" : `Haan, ${label(st.date)} ${hh(h)} ka slot khaali hai. `;
  if (d.menu && !st.dishDone) {
    const ds = st.dishes || [];
    return o(ds.length ? `Noted: ${dishTxt(ds)}. Aur kuch add karun, ya bas?` : `${head}Chahein to dishes bhi pre-order kar sakte hain, jaise pizza, burger, dal makhani ya paneer ki sabji. Kya order karna hai, ya sirf table chahiye?`, { ...st, stage: "dish" });
  }
  if (!st.name) return o(`${head}Booking ke liye aapka naam bata dijiye?`, { ...st, stage: "name" });
  if (!st.phone && !st.noPhone) return o(`Shukriya ${st.name}. Confirmation ke liye mobile number bata dijiye. Ye sirf aapki ijazat se save hoga, na dena ho to skip bol dijiye.`, { ...st, stage: "phone" });
  return o(`Toh main ${st.svc ? st.svc + " ke liye " : ""}${st.name} ji ki ${d.noun} ${label(st.date)} ${hh(h)} par confirm kar rahi hoon${st.phone ? `, number ke aakhri 4 digit ${st.phone.slice(-4)}` : ""}.${st.dishes?.length ? ` Pre-order: ${dishTxt(st.dishes)}, total ${dishTotal(st.dishes)} rupaye.` : ""} Sab sahi hai?`, { ...st, stage: "confirm" });
}
function finalize(d: Dom, st: St): [string, St] {
  if (st.resched) { const i = bookings.findIndex((b) => b.biz === d.biz && b.name === st.name); if (i >= 0) bookings.splice(i, 1); }
  const b: Booking = { id: `${d.biz.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}${1001 + bookings.length}`, name: st.name!, svc: st.svc || d.noun, date: st.date!, time: st.time!, phone: st.phone, biz: d.biz, dishes: st.dishes?.length ? dishTxt(st.dishes) : undefined };
  bookings.push(b);
  return [`Ho gaya! ${b.name} ji, ${st.svc ? st.svc + " ki " : ""}${d.noun} ${label(b.date)} ${hh(b.time)} ke liye pakki ho gayi. Booking ID ${b.id}.${st.dishes?.length ? ` Pre-order: ${dishTxt(st.dishes)}, total ${dishTotal(st.dishes)} rupaye.` : ""} ${b.phone ? "Confirmation message bhej diya jayega." : "Chahein to baad mein number bhi de sakte hain."} Aur kuch madad chahiye?`, {}];
}
function side(d: Dom, t: string): string {
  const svc = d.services.find(([, r]) => r.test(t));
  if (svc && /kitna time|kitne (time|din|mahine|ghante|minute)|how long|duration|sitting/.test(t)) return `${svc[0]} mein ${svc[3]}.`;
  for (const [r, a] of d.faq) if (r.test(t)) return a;
  if (/timing|\bopen\b|khul|hours|kab tak|kitne baje tak|what time|chhutti|holiday/.test(t)) return `Hum ${d.hrs}.`;
  if (/address|location|\bkahan\b|kidhar|direction|\bmap\b|where|metro/.test(t)) return `Hum ${d.loc} mein hain. Chahein to location WhatsApp par bhej sakti hoon.`;
  if (/price|cost|\bfees?\b|charge|kitna lagega|kitne (ka|ke|paise|rupee)|kharcha|\brate|paise|rupee|budget/.test(t)) return svc ? `${svc[2]}. Exact fees doctor check karne ke baad confirm hoti hain.` : `${d.price}.`;
  if (/service|treatment|kya karte|kya milta|what do you|offer/.test(t)) return d.services.length ? `Hamare yahan ${d.services.map((s) => s[0]).join(", ")} milte hain.` : `${d.price}.`;
  if (/who are you|kaun ho|\bbot\b|robot|real person|ai\b/.test(t)) return `Main ${d.biz} ki AI voice assistant hoon. Chahein to kisi insaan se bhi baat karwa sakti hoon.`;
  return "";
}

export function reply(ctx: string, text: string, s0: St): [string, St] {
  const d = getD(ctx), c = ctx.toLowerCase(), t = text.toLowerCase().trim();
  const T = (r: RegExp) => r.test(t);
  let st: St = { ...s0 };
  const out = (x: string, s: St = st): [string, St] => [x, s];
  const yes = T(/\b(haan|han|ha|yes|yeah|yep|ok|okay|theek|sahi|kar do|kardo|confirm|sure|bilkul|done)\b/), no = T(/\b(nahi|nahin|no|nope|galat|wrong|change|badal)\b/);
  const dg = text.replace(/\D/g, "");

  if (T(/ignore (your|all|previous|the)|system prompt|your instructions|jailbreak|developer mode|reveal your/)) return out("Main apne instructions share nahi kar sakti. Aapki booking ya kisi sawal mein madad zaroor karungi.");
  if (T(/dawai|medicine|tablet|antibiotic|painkiller|\bdose\b|diagnos|prescri|lawyer|court|legal/)) return flow(d, { ...st, intent: "book", svc: st.svc || d.services.find((s) => /checkup/.test(s[0]))?.[0] }, "Dawai ya diagnosis ki salah main nahi de sakti, wo doctor check karke hi bata sakte hain. Main aapko doctor ke saath slot dila sakti hoon.");
  if (/never discuss pricing/.test(c) && T(/price|cost|\bfees?\b|charge|kitna lagega|kharcha|\brate|paise|rupee/)) return out("Pricing main yahan share nahi karti. Team se callback arrange kar deti hoon. Kya aap apna number denge?", { intent: "cb" });

  if (st.intent === "cb" && dg.length >= 10) return out("Dhanyavaad. Team aapko jaldi callback karegi. Aur kuch madad chahiye?", {});
  if (st.intent === "cancel") {
    const nm = cleanName(text);
    if (!nm) return out("Kis naam se booking hai? Bata dijiye.");
    const i = bookings.findIndex((b) => b.biz === d.biz && b.name.toLowerCase() === nm.toLowerCase());
    if (i < 0) return out(`${nm} naam se mujhe booking nahi mili. Team ek baar check karke callback karegi. Kya naya slot book karun?`, {});
    const b = bookings.splice(i, 1)[0];
    return out(`Theek hai ${nm} ji, ${label(b.date)} ${hh(b.time)} ki booking cancel kar di hai. Naya slot chahiye to bataiye.`, {});
  }
  if (st.intent === "book" && T(/\b(cancel|chhod|rehne do|never ?mind|forget it)\b/)) return out("Theek hai, maine booking rok di hai. Aur kuch madad chahiye?", {});
  if (st.intent !== "book" && T(/\b(cancel|radd)\b/) && !T(/policy|charge|fee|refund/)) return out("Zaroor. Kis naam se booking hai?", { intent: "cancel" });
  if (T(/reschedule|postpone|badalna|(change|badal).*(time|date|slot|appointment)/) && st.stage !== "confirm") return out(`Zaroor, ${d.noun} badal dete hain. Pehle aapka naam bata dijiye?`, { intent: "book", resched: true, svc: st.svc, stage: "name" });

  if (st.intent === "book" && st.stage === "confirm") {
    if (yes && !no) return finalize(d, st);
    if (no) return flow(d, { ...st, date: undefined, time: undefined, pref: undefined, stage: "change" }, "Koi baat nahi, dobara dekhte hain.");
  }

  const bookW = T(/\b(book|booking|appointment|slot|reserve|schedule|milna|milne|aana|aani|visit|dikhana|dikhwana|dikhane|consult|table)\b/);
  const svcM = d.services.find(([, r]) => r.test(t));
  const noDate = st.stage === "name" || st.stage === "phone";
  const dt = noDate ? undefined : parseDate(t);
  const tm = parseTime(t, st.stage === "time" || (st.intent === "book" && !!st.date && st.time == null));
  const start = st.intent !== "book" && (bookW || (!!dt && tm.h != null) || (!!svcM && T(/karwa|karana|chahiye|lagwa/) && !T(/kitna|kya hota|price|fee/)));

  if (st.intent === "book" || start) {
    st.intent = "book";
    const prev = JSON.stringify([st.svc, st.date, st.time, st.name, st.phone, st.noPhone, st.dishes, st.dishDone]);
    if (svcM) st.svc = svcM[0];
    if (!st.date && st.offer && yes && !no) { st.date = st.offer; st.offer = undefined; }
    if (dt) { st.date = dt; st.offer = undefined; }
    if (tm.h != null) st.time = tm.h; else if (tm.p) st.pref = tm.p;
    if (d.menu && !noDate) for (const f of menuFind(d, t)) { const i = (st.dishes || []).findIndex((x) => x[0] === f[0]); st.dishes = i >= 0 ? st.dishes!.map((x, j) => (j === i ? f : x)) : [...(st.dishes || []), f]; }
    if (st.stage === "dish" && T(/\b(nahi|nahin|no|nope|bas|skip|nothing|na|itna hi)\b|that'?s all|sirf table|only table/)) st.dishDone = true;
    if (st.stage === "name" && !st.name && !dt && tm.h == null) { const n = cleanName(text); if (n) st.name = n; }
    if (!st.phone && dg.length >= 10) st.phone = dg.slice(-10);
    if (st.stage === "phone" && !st.phone && T(/\b(skip|nahi|no|nope|mat|na)\b|don'?t/)) st.noPhone = true;
    const now = JSON.stringify([st.svc, st.date, st.time, st.name, st.phone, st.noPhone, st.dishes, st.dishDone]);
    if (now !== prev || (start && !side(d, t))) return flow(d, st);
    const a = side(d, t);
    return flow(d, st, a || (st.stage === "phone" && dg.length > 0 ? "Number 10 digit ka hona chahiye." : st.stage === "phone" && T(/kyun|why|\?/) ? "Ye sirf confirmation message ke liye hai, aur aapki ijazat ke bina save nahi hoga." : `Main sirf ${d.topics} mein madad kar sakti hoon.`));
  }

  if (T(/english (mein|me|please)|speak english|in english/)) return out("Sure, I can speak English. How can I help you today?");
  if (T(/hindi (mein|me)/)) return out("Ji bilkul, ab main Hindi mein baat karti hoon. Bataiye, kya madad karun?");
  if (T(/gussa|bekar|worst|complain|shikayat|angry|pareshan|kharab|bad experience|bahut wait|pichli baar/)) return out("Mujhe afsos hai ki aapko pareshani hui. Main ise note karke senior team se callback dilwati hoon. Kya aap apna number denge?", { intent: "cb" });
  if (T(/human|insaan|manager|real person|kisi se baat|call ?back|owner|doctor se baat/)) return out("Bilkul, main team se callback arrange karti hoon. Kripya apna number bata dijiye.", { intent: "cb" });
  if (T(/thank|shukriya|dhanyavaad|thanks/)) return out("Aapka swagat hai! Aur kuch madad chahiye to bataiye.");
  if (T(/\bbye\b|alvida|that'?s all|bas itna/)) return out("Dhanyavaad! Aapka din shubh ho. Namaste.", {});
  if (T(/^(hi|hello|hey|namaste|namaskar|good (morning|evening|afternoon))\b/)) return out(greet(ctx));
  for (const [r, a, sv] of d.faq) if (r.test(t) && sv) return flow(d, { ...st, intent: "book", svc: sv }, `${a} Main aaj ya kal ka slot dekh sakti hoon.`);
  const a = side(d, t);
  if (a) return out(`${a}${/\bfees?\b|price|kharcha/.test(a) ? " Appointment book karun?" : ""}`);
  return out(`Main ${d.biz} ki assistant hoon, isliye sirf ${d.topics} se jude sawalon mein madad kar sakti hoon. ${d.noun === "table" ? "Table book karun" : "Appointment book karun"} ya kuch aur jaankari bataun?`);
}