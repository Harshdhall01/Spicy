import "./globals.css";
export const metadata = { title: "Spicy - Describe it. Talk to it. Ship it." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}