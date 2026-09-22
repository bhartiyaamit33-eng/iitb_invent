"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "start" | "mid" | "end";

const WIDTHS: Record<Phase, string> = {
  idle: "0%",
  start: "8%",
  mid: "72%",
  end: "100%",
};

/**
 * Thin progress bar for client-side navigation. App Router has no navigation
 * events, so a capture-phase click on an in-app link starts the bar and the
 * pathname/query change finishes it.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<number[]>([]);

  function clearTimers() {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same document, only a hash change: nothing loads.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash
      ) {
        return;
      }

      clearTimers();
      setPhase("start");
      timers.current.push(
        window.setTimeout(() => setPhase("mid"), 60),
        // Safety net: a navigation that never resolves still clears the bar.
        window.setTimeout(() => setPhase("idle"), 8000),
      );
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimers();
    };
  }, []);

  useEffect(() => {
    setPhase((current) => {
      if (current === "idle") return current;
      clearTimers();
      timers.current.push(window.setTimeout(() => setPhase("idle"), 420));
      return "end";
    });
    // Route identity, not the setter, is what finishes the bar.
  }, [pathname, searchParams]);

  if (phase === "idle") return null;

  return (
    <div className="site-routebar" aria-hidden="true" data-testid="site-routebar">
      <div style={{ width: WIDTHS[phase], opacity: phase === "end" ? 0 : 1 }} />
    </div>
  );
}
