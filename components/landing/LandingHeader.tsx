import Image from "next/image";
import Link from "next/link";
import { LANDING_PAGE_NAV } from "@/lib/landing";
import { cx } from "./cx";

export function LandingHeader({
  signedInName,
  homeBase = "",
  currentPath,
}: {
  signedInName: string | null;
  homeBase?: string;
  currentPath?: string;
}) {
  const accountHref = signedInName ? "/dashboard" : "/login";
  const accountLabel = signedInName ?? "Login";

  return (
    <div className="hero-chrome relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-[clamp(18px,3.4vw,64px)] py-[18px]">
      <Link
        className="logo-dsse justify-self-start"
        href="https://www.dsse.iitb.ac.in/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Desai Sethi School of Entrepreneurship"
      >
        <Image
          src="/assets/dsse-logo.png"
          alt="DSSE"
          width={200}
          height={200}
          className="h-[clamp(56px,min(9vw,10vh),96px)] w-auto brightness-0 invert drop-shadow-[0_8px_18px_rgba(0,8,20,0.45)]"
          priority
        />
      </Link>
      <nav
        className="hero-nav flex flex-wrap justify-self-center gap-2"
        aria-label="Primary"
        data-testid="nav"
      >
        {LANDING_PAGE_NAV.map((item) => {
          const href = item.href.startsWith("#")
            ? `${homeBase}${item.href}`
            : item.href;
          const current =
            currentPath &&
            (item.href === currentPath || href === currentPath);
          return (
            <Link
              key={item.href}
              href={href}
              aria-current={current ? "page" : undefined}
              className={cx(
                "shrink-0 rounded-full border bg-midnight/40 px-3 py-2 text-[10px] font-semibold tracking-[0.14em] text-frost uppercase backdrop-blur-md transition hover:border-white/70 hover:bg-white/10",
                current
                  ? "border-spark text-spark"
                  : "border-white/30",
              )}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          className="nav-login btn shrink-0 !px-4 !py-2 !text-[10px]"
          href={accountHref}
        >
          {accountLabel}
        </Link>
      </nav>
      <Link
        className="logo-iitb flex size-[clamp(52px,8vw,80px)] items-center justify-center justify-self-end rounded-full bg-white shadow-[0_10px_28px_rgba(0,8,20,0.35)]"
        href="https://iitb.ac.in/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Indian Institute of Technology Bombay"
      >
        <Image
          src="/assets/iitb-logo.png"
          alt="IIT Bombay"
          width={1024}
          height={998}
          className="h-[82%] w-[82%] object-contain"
          priority
        />
      </Link>
    </div>
  );
}
