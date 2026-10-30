'use client';
import type { RefObject } from 'react';
import ThemeToggle from './ThemeToggle';
import '../app/landing.css';

const ICONS: Record<string, React.ReactNode> = {
  mic: <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" /></>,
  arrow: <path d="M5 12h14M12 5l7 7-7 7" />,
  home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>,
  cal: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8" /></>,
  tooth: <path d="M7 3C4.5 3 3 5 3 7.5c0 3 1.5 4.5 2 7 .4 2 .8 6.5 2.5 6.5 1.5 0 1.5-4 3.5-4s2 4 3.5 4c1.7 0 2.1-4.5 2.5-6.5.5-2.5 2-4 2-7C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z" />,
  cap: <><path d="M22 10L12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></>,
};
const Icon = ({ n }: { n: string }) => <svg className="sp-i" viewBox="0 0 24 24" aria-hidden="true">{ICONS[n]}</svg>;

// Photos: put files in /public/templates and set img: '/templates/dental.jpg'
const TEMPLATES = [
  { icon: 'tooth', title: 'Dental Clinic Receptionist', desc: 'Book appointments, answer FAQs, share timings, handle cancellations.', img: '', text: 'A receptionist for my dental clinic. Books appointments, shares timings, never gives medical advice. Speaks Hinglish and English.' },
  { icon: 'home', title: 'Real Estate Lead Qualifier', desc: 'Qualify leads, collect details, schedule site visits.', img: '', text: 'A lead qualifier for my real estate firm. Asks budget, location and timeline, then books a site visit. Speaks Hinglish and English.' },
  { icon: 'cal', title: 'Restaurant Booking', desc: 'Take reservations, answer menu questions, manage cancellations.', img: '', text: 'A table booking agent for my restaurant. Takes party size, time and name, and answers menu and timing questions. Speaks Hinglish.' },
  { icon: 'cap', title: 'College Club Helpdesk', desc: 'Answer event questions, handle registrations, provide updates.', img: '', text: 'A helpdesk for our college club. Answers about events, membership and deadlines in a friendly tone. Speaks Hinglish and English.' },
  { icon: 'heart', title: 'NGO Donor Outreach', desc: 'Talk to potential donors, explain impact, collect interest.', img: '', text: 'A donor outreach agent for our NGO. Thanks donors, explains our work, and never pressures anyone. Speaks Hindi and English.' },
  { icon: 'file', title: 'Collections Reminder Agent', desc: 'Friendly payment reminders, handle objections, escalate to human.', img: '', text: 'A polite payment reminder agent. Reminds about dues, offers a callback, never threatens. Speaks Hindi and English.' },
];
const CHIPS = [
  ['tooth', 'Dental clinic receptionist'], ['home', 'Real estate lead qualifier'], ['cal', 'Restaurant booking'],
  ['cap', 'College club helpdesk'], ['heart', 'NGO donor outreach'], ['file', 'Collections reminder agent'],
];

type Props = {
  text: string;
  setText: (v: string) => void;
  onBuild: () => void;
  onDictate: () => void;
  onTemplate: (t: string) => void;
  listening: boolean;
  err: string;
  inputRef: RefObject<HTMLInputElement | null>;
};

export default function Landing({ text, setText, onBuild, onDictate, onTemplate, listening, err, inputRef }: Props) {
  const tooShort = text.trim().length < 8;
  return (
    <div className="sp-root">
      <nav className="sp-nav">
        <div className="sp-logo">Spicy</div>
        <div className="sp-links">
          <a href="#how">Product</a><a href="#templates">Templates</a><a href="#">Pricing</a><a href="#">Blog</a>
        </div>
        <div className="sp-right">
          <ThemeToggle />
          <a className="sp-login" href="#">Log in</a>
          <button className="sp-btn" onClick={() => inputRef.current?.focus()}>Get started</button>
        </div>
      </nav>

      <main>
        <section className="sp-hero">
          <div className="sp-word">Spicy</div>
          <h1>Describe it. Talk to it. Ship it.</h1>
          <p className="sp-sub">Build powerful voice AI agents for your business, in minutes.</p>

          <div className="sp-prompt">
            <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !tooShort && onBuild()}
              placeholder="Describe your voice assistant..." aria-label="Describe your voice agent" />
            <button className={`sp-mic ${listening ? 'on' : ''}`} onClick={onDictate} aria-pressed={listening} aria-label="Speak your idea"><Icon n="mic" /></button>
            <button className="sp-btn sp-build" onClick={onBuild} disabled={tooShort} style={{ opacity: tooShort ? 0.35 : 1, cursor: tooShort ? 'not-allowed' : 'pointer' }}>
              Build <Icon n="arrow" />
            </button>
          </div>

          {err ? <p role="alert" className="sp-hint" style={{ color: 'var(--fg)' }}>{err}</p> : <p className="sp-hint">{listening ? 'Listening... tap the mic to stop' : 'Try an example or speak instead'}</p>}
          <div className="sp-chips">
            {CHIPS.map(([ic, c]) => (
              <button key={c} className="sp-chip" onClick={() => { setText(`A voice agent for: ${c}. Speaks Hinglish and English.`); inputRef.current?.focus(); }}>
                <Icon n={ic} />{c}
              </button>
            ))}
          </div>
        </section>

        <section className="sp-how" id="how">
          <h2>How it works</h2>
          <div className="sp-steps">
            <div className="sp-step"><span className="sp-num">1</span><div><b>Describe your agent</b><p>Tell Spicy what you want in plain language (type or speak).</p></div></div>
            <div className="sp-step"><span className="sp-num">2</span><div><b>Spicy builds it</b><p>We generate, configure and test your voice agent using ElevenLabs.</p></div></div>
            <div className="sp-step"><span className="sp-num">3</span><div><b>Talk, refine and ship</b><p>Try it, make changes, and deploy in minutes.</p></div></div>
          </div>
        </section>

        <section className="sp-tpl" id="templates">
          <div className="sp-tpl-head">
            <div><h3>Popular templates (India)</h3><p>Start with a template and customize it for your business.</p></div>
          </div>
          <div className="sp-grid">
            {TEMPLATES.map((t) => (
              <div className="sp-card" key={t.title}>
                <div className="sp-tile">{t.img ? <img src={t.img} alt={t.title} /> : <Icon n={t.icon} />}</div>
                <div className="sp-cb">
                  <b>{t.title}</b><p>{t.desc}</p>
                  <button className="sp-use" onClick={() => onTemplate(t.text)}>Use template <Icon n="arrow" /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}