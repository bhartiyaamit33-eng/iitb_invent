import Link from "next/link";
import { BrandInline } from "./Wordmark";

export function LandingFooter() {
  return (
    <footer className="mx-auto flex max-w-[1220px] flex-col gap-4 border-t border-white/10 px-[clamp(18px,4vw,40px)] pt-7 pb-16 text-xs text-haze">
      <div className="flex flex-wrap justify-between gap-4 max-[860px]:flex-col">
        <div>
          <BrandInline /> · DSSE Day · 31 January 2027 · IIT Bombay
        </div>
        <div>Desai Sethi School of Entrepreneurship</div>
      </div>
      <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Site">
        <Link href="/about">About INVENT</Link>
        <Link href="/dsse-day">DSSE Day</Link>
        <Link href="/conference">Call for papers</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/programme">Programme</Link>
        <Link href="/travel">Travel</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/code-of-conduct">Code of conduct</Link>
        <a href="mailto:support@iitbinvent.com">support@iitbinvent.com</a>
      </nav>
    </footer>
  );
}
