"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ABSTRACT_EXTENSION_NOTE } from "@/lib/landing";

const SEEN_KEY = "invent-deadline-notice-25oct";
const SPLASH_KEY = "invent-splash-seen";

/**
 * Small landing-page notice for the extended abstract deadline. It waits out
 * the first-visit splash, then stays until the visitor closes it.
 */
export function DeadlineNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen = false;
    let splashSeen = false;
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === "1";
      splashSeen = window.sessionStorage.getItem(SPLASH_KEY) === "1";
    } catch {
      /* private mode: still show the notice */
    }
    if (seen) return;
    const delay = splashSeen ? 400 : 2800;
    const timer = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  if (!open) return null;

  return (
    <aside
      className="deadline-pop"
      role="dialog"
      aria-modal="false"
      aria-labelledby="deadline-pop-title"
      data-testid="deadline-popup"
    >
      <p className="site-kicker is-blue" id="deadline-pop-title">
        Deadline extended
      </p>
      <p>{ABSTRACT_EXTENSION_NOTE}</p>
      <div className="deadline-pop-actions">
        <Link className="site-btn site-btn-sm" href="/research" data-testid="deadline-popup-cfp">
          Call for papers
        </Link>
        <button
          type="button"
          className="deadline-pop-close"
          onClick={close}
          data-testid="deadline-popup-close"
        >
          Close
        </button>
      </div>
    </aside>
  );
}
