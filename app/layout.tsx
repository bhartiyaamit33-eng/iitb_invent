import { ReticleDev } from './reticle-dev';
import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "Inv.ent 2027 · Entrepreneurship Research & Practice Conference · IIT Bombay",
  description:
    "Where rigorous entrepreneurship research meets venture practice. 30–31 January 2027 at IIT Bombay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} antialiased`}>{process.env.NODE_ENV === 'development' ? <ReticleDev /> : null}{children}</body>
    </html>
  );
}
