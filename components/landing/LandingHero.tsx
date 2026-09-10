"use client";

import Image from "next/image";
import Link from "next/link";
import {
  REGISTER_HREF,
  SUBMIT_HREF,
  TAGLINE,
  IMAGES,
  type HeroVariant,
} from "@/lib/landing";
import { OrbitBackdrop } from "./OrbitBackdrop";
import { Wordmark } from "./Wordmark";

const NAV = [
  { href: "#about", label: "About" },
  { href: "#day", label: "The Day" },
  { href: "/ventures", label: "Startups" },
  { href: "/programme", label: "Programme" },
  { href: "#faq", label: "FAQ" },
  { href: "#connect", label: "People" },
  { href: "#query", label: "Queries" },
];

export function LandingHero({
  variant,
  signedInName,
}: {
  variant: HeroVariant;
  signedInName: string | null;
}) {
  const accountHref = signedInName ? "/dashboard" : "/login";
  const accountLabel = signedInName ?? "Login";
  const submitHref = SUBMIT_HREF;
  const registerHref = signedInName ? "/dashboard" : REGISTER_HREF;
  const registerLabel = signedInName ? "Go to dashboard" : "Register to attend";

  return (
    <header
      className="relative isolate flex min-h-[100svh] flex-col overflow-x-hidden bg-midnight text-frost"
      id="top"
      data-testid="hero"
      data-hero={variant}
    >
      {variant === "photo" ? (
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src={IMAGES.hero.src}
            alt={IMAGES.hero.alt}
            fill
            priority
            sizes="100vw"
            data-testid="hero-building"
            className="object-cover object-[58%_40%] saturate-[0.55] contrast-[1.12] brightness-[0.42]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(7,17,31,0.88) 0%, rgba(7,17,31,0.72) 34%, rgba(7,17,31,0.38) 62%, rgba(11,30,54,0.28) 100%), linear-gradient(180deg, rgba(7,17,31,0.58) 0%, rgba(7,17,31,0.18) 30%, rgba(7,17,31,0.28) 70%, rgba(7,17,31,0.82) 100%), linear-gradient(20deg, rgba(46,143,255,0.14), transparent 42%)",
            }}
          />
        </div>
      ) : (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 52% 48% at 22% 42%, rgba(46,143,255,0.22), transparent), radial-gradient(ellipse 22% 20% at 14% 46%, rgba(200,255,61,0.08), transparent), linear-gradient(180deg, #0B1E36 0%, #08162A 55%, #07111F 100%)",
          }}
        />
      )}

      <OrbitBackdrop variant="hero" className="z-[1]" />

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
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-white/30 bg-midnight/40 px-3 py-2 text-[10px] font-semibold tracking-[0.14em] text-frost uppercase backdrop-blur-md transition hover:border-white/70 hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
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

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col justify-between px-[clamp(18px,4.6vw,72px)] pt-2 pb-[clamp(20px,3vw,36px)]">
          <div className="flex flex-1 flex-col justify-center py-3">
            <p
              className="hero-rise landing-serif mb-1 text-[clamp(28px,4.6vw,56px)] leading-none text-frost"
              style={{ animationDelay: "0.12s" }}
            >
              IIT Bombay
            </p>
            <div className="hero-rise" style={{ animationDelay: "0.36s" }}>
              <Wordmark />
            </div>
            <p
              className="hero-tagline hero-rise landing-serif mt-6 font-medium leading-none tracking-[-0.015em] text-frost"
              data-testid="hero-tagline"
              style={{ animationDelay: "0.55s" }}
            >
              {TAGLINE}
            </p>
            <ol
              className="hero-rise mt-4 flex flex-wrap gap-y-2 p-0"
              aria-label="The INV.ENT journey"
              data-testid="journey"
              style={{ animationDelay: "0.68s" }}
            >
              {["Research", "Innovation", "Entrepreneurship", "Impact"].map(
                (step, i) => (
                  <li
                    key={step}
                    className="flex items-center text-[11px] font-semibold tracking-[0.18em] text-mist uppercase"
                  >
                    {i > 0 ? (
                      <span className="mx-3 size-1.5 rounded-full bg-spark shadow-[0_0_8px_rgba(200,255,61,0.6)]" />
                    ) : null}
                    {step}
                  </li>
                ),
              )}
            </ol>
            <div className="hero-rise cta-row" data-testid="cta-hero" style={{ animationDelay: "0.8s" }}>
              <Link className="btn outline" href={submitHref}>
                Submit your abstract
              </Link>
              <Link className="btn ghost" href={registerHref}>
                {registerLabel}
              </Link>
            </div>
          </div>

          <div
            className="hero-rise grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-6 max-[860px]:grid-cols-[1fr_auto]"
            style={{ animationDelay: "0.95s" }}
          >
            <p className="text-[11px] font-semibold leading-relaxed tracking-[0.12em] text-mist uppercase">
              Desai Sethi School of Entrepreneurship{" "}
              <span className="whitespace-nowrap">· IIT Bombay</span>
            </p>
            <Link
              className="mb-1 grid size-[42px] place-items-center justify-self-center rounded-full border border-white/40 bg-midnight/35 text-frost backdrop-blur-sm max-[860px]:hidden"
              href="#about"
              aria-label="Scroll to about"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </Link>
            <div className="landing-serif justify-self-end text-right leading-none">
              <span className="block whitespace-nowrap text-[clamp(22px,3.4vw,44px)] text-frost">
                Jan 30–Jan 31
              </span>
              <span className="block text-[clamp(16px,2vw,26px)] text-mist">2027</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
