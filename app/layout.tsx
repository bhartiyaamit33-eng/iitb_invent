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
  title: "Inv.ent · DSSE Day · 31 Jan 2027 · IIT Bombay",
  description:
    "Inv.ent is Innovation and Entrepreneurship at DSSE, IIT Bombay. Where entrepreneurship research meets venture practice. 31 January, annually.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} antialiased`}>{children}</body>
    </html>
  );
}
