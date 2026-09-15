"use client";

import Image from "next/image";
import Link from "next/link";
import {
  REGISTER_HREF,
  SUBMIT_HREF,
  TAGLINE_LEAD,
  TAGLINE_REST,
  IMAGES,
  type HeroVariant,
  type LandingThemeName,
} from "@/lib/landing";
import { OrbitBackdrop } from "./OrbitBackdrop";
import { ThemeToggle } from "./ThemeToggle";
import { Wordmark } from "./Wordmark";

export function LandingHero({
  variant,
  signedInName,
  theme,
  onThemeChange,
}: {
  variant: HeroVariant;
  signedInName: string | null;
  theme: LandingThemeName;
  onThemeChange: (theme: LandingThemeName) => void;
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
          <div className="hero-photo-veil absolute inset-0" />
        </div>
      ) : (
        <div className="hero-plain-veil pointer-events-none absolute inset-0 z-0" />
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
          <Link
            className="btn shrink-0 !px-4 !py-2 !text-[10px]"
            href={submitHref}
            data-testid="nav-submit"
          >
            Submit your Abstract
          </Link>
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
              className="hero-tagline hero-rise landing-serif mt-6 font-medium tracking-[-0.015em]"
              data-testid="hero-tagline"
              style={{ animationDelay: "0.55s" }}
            >
              <span className="hero-tagline-lead">{TAGLINE_LEAD}</span>{" "}
              <span className="hero-tagline-rest">{TAGLINE_REST}</span>
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
                      <span className="mx-3 size-1.5 rounded-full bg-spark shadow-[0_0_8px_rgba(0,126,67,0.6)]" />
                    ) : null}
                    {step}
                  </li>
                ),
              )}
            </ol>
            <div className="hero-rise cta-row" data-testid="cta-hero" style={{ animationDelay: "0.8s" }}>
              <Link className="btn outline" href={submitHref}>
                Submit your Abstract
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
            <div className="flex flex-col items-start gap-3">
              <p className="text-[11px] font-semibold leading-relaxed tracking-[0.12em] text-mist uppercase">
                Desai Sethi School of Entrepreneurship{" "}
                <span className="whitespace-nowrap">· IIT Bombay</span>
              </p>
              <ThemeToggle theme={theme} onThemeChange={onThemeChange} testid />
            </div>
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
                30-31 January
              </span>
              <span className="block text-[clamp(16px,2vw,26px)] text-mist">2027</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
