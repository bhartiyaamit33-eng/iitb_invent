"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SessionDetailError({
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
        Programme
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Session could not be loaded
      </h1>
      <p className="mt-3 text-ink-soft">
        Something went wrong opening this session. Try again, or go back to the
        programme list.
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
          href="/programme"
          className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-teal-deep hover:bg-white"
        >
          Back to programme
        </Link>
      </div>
    </main>
  );
}
