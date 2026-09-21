"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useState } from "react";
import { InventMark } from "./InventMark";
import { EVENT_DATES } from "@/lib/site-content";

const SPLASH_MS = 2600;
const SEEN_KEY = "invent-splash-seen";

const STATUS_STEPS = [
  { at: 0, text: "Connecting to iitbinvent.com" },
  { at: 0.3, text: "Loading programme and speakers" },
  { at: 0.62, text: "Preparing the 2027 edition" },
  { at: 0.94, text: "Ready" },
] as const;

function statusAt(fraction: number): string {
  let text: string = STATUS_STEPS[0].text;
  for (const step of STATUS_STEPS) {
    if (fraction >= step.at) text = step.text;
  }
  return text;
}

/**
 * First-visit splash over the landing page. It is rendered server-side so there
 * is no flash of content before it, dismisses itself through a CSS animation
 * even without JS, and is skipped for the rest of the tab session.
 */
export function SiteSplash() {
  const [shown, setShown] = useState(true);
  const [status, setStatus] = useState<string>(STATUS_STEPS[0].text);

  // Before paint, so a repeat visit never sees the overlay flash.
  useLayoutEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* private mode / blocked storage: show the splash */
    }
    if (seen) setShown(false);
  }, []);

  useEffect(() => {
    if (!shown) return;
    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    const start = Date.now();
    const tick = window.setInterval(() => {
      setStatus(statusAt(Math.min(1, (Date.now() - start) / SPLASH_MS)));
    }, 120);
    const done = window.setTimeout(() => setShown(false), SPLASH_MS + 120);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
    };
  }, [shown]);

  if (!shown) return null;

  return (
    <div
      className="site-splash"
      role="status"
      aria-live="polite"
      aria-label="Loading IITB INV.ENT"
      data-testid="site-splash"
      style={{ ["--splash-ms" as string]: `${SPLASH_MS}ms` }}
    >
      <svg
        viewBox="0 0 1200 620"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        className="site-splash-field"
      >
        <defs>
          <pattern id="ldr-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="1200" height="620" fill="url(#ldr-grid)" opacity="0.28" />
        <g stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.45">
          <path d="M 60 48 H 100 M 60 48 V 88" />
          <path d="M 1140 48 H 1100 M 1140 48 V 88" />
          <path d="M 60 572 H 100 M 60 572 V 532" />
          <path d="M 1140 572 H 1100 M 1140 572 V 532" />
        </g>
        <line
          x1="40"
          y1="310"
          x2="1160"
          y2="310"
          stroke="rgba(20,91,239,0.28)"
          strokeWidth="0.8"
          strokeDasharray="1200"
          strokeDashoffset="1200"
          style={{ animation: "ldr-draw 1.5s cubic-bezier(0.22,1,0.36,1) forwards" }}
        />
        <circle
          cx="510"
          cy="310"
          r="232"
          fill="none"
          stroke="rgba(20,91,239,0.38)"
          strokeWidth="0.85"
          style={{ animation: "ldr-conv-l 1.4s cubic-bezier(0.22,1,0.36,1) forwards" }}
        />
        <circle
          cx="690"
          cy="310"
          r="232"
          fill="none"
          stroke="rgba(105,179,63,0.4)"
          strokeWidth="0.85"
          style={{ animation: "ldr-conv-r 1.4s cubic-bezier(0.22,1,0.36,1) forwards" }}
        />
        <circle
          cx="600"
          cy="310"
          r="146"
          fill="none"
          stroke="rgba(11,37,69,0.16)"
          strokeWidth="0.85"
          strokeDasharray="920"
          strokeDashoffset="920"
          style={{ animation: "ldr-draw 1.9s 0.5s cubic-bezier(0.22,1,0.36,1) forwards" }}
        />
        <circle cx="360" cy="310" r="5" fill="#69b33f" />
        <circle cx="840" cy="310" r="5" fill="#145bef" />
        <circle cx="905" cy="128" r="3.5" fill="#69b33f" />
        <circle cx="295" cy="492" r="3.5" fill="#145bef" />
      </svg>

      <div className="site-splash-copy">
        <div className="site-splash-logos">
          <Image
            src="/assets/iitb-logo.png"
            alt="IIT Bombay"
            width={512}
            height={499}
            priority
            style={{ height: 52 }}
          />
          <span className="sep" aria-hidden="true" />
          <Image
            src="/assets/dsse-wordmark.png"
            alt="Desai Sethi School of Entrepreneurship"
            width={1600}
            height={320}
            sizes="200px"
            priority
            style={{ height: 24 }}
          />
        </div>
        <InventMark style={{ fontSize: "clamp(2.6rem, 7vw, 4.4rem)" }} />
        <span className="site-splash-core" aria-hidden="true" />
        <p className="site-splash-date">{EVENT_DATES}</p>
        <div className="site-splash-bar" aria-hidden="true">
          <div />
        </div>
        <p className="site-splash-status" data-testid="site-splash-status">
          {status}
        </p>
      </div>
    </div>
  );
}
