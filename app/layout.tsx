import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['400', '500', '600', '700', '800', '900'], style: ['normal', 'italic'] });

export const metadata: Metadata = {
  title: 'Spicy: Describe it. Talk to it. Ship it.',
  description: 'Build powerful voice AI agents for your business, in minutes.',
};

// Runs before first paint so there is no white flash in dark mode.
const themeScript = `(function(){try{var t=localStorage.getItem('spicy-theme');
if(!t){t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}
var r=document.documentElement;r.classList.toggle('dark',t==='dark');r.setAttribute('data-theme',t)}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}