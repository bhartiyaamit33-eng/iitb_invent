"use client";

import { useState } from "react";

const PREVIEW_LEN = 120;

export function ShowBio({ bio }: { bio: string }) {
  const text = bio.trim();
  if (!text) return null;

  const needsExpand = text.length > PREVIEW_LEN;
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <p className="text-sm leading-relaxed text-ink-soft whitespace-pre-wrap">
        {open || !needsExpand
          ? text
          : `${text.slice(0, PREVIEW_LEN).trimEnd()}…`}
      </p>
      {needsExpand ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-teal-deep underline-offset-2 hover:underline"
          aria-expanded={open}
        >
          {open ? "Hide bio" : "Show bio"}
        </button>
      ) : null}
    </div>
  );
}
