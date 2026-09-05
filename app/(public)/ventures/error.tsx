"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function VenturesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        IIT Bombay · Inv.ent
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Startups &amp; projects
      </h1>
      <p className="mt-3 text-ink-soft">
        The directory failed to load. Retry, or head back to the homepage.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-teal-deep px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
        >
          Retry
        </button>
        <Link
          href="/"
          className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-teal-deep hover:bg-white"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
