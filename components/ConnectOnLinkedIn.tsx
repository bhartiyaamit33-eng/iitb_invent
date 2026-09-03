"use client";

import { useState } from "react";

export function ConnectOnLinkedIn({
  linkedinUrl,
  note,
  label = "Connect on LinkedIn",
}: {
  linkedinUrl: string;
  note: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(note);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard may be blocked */
    }
    window.open(linkedinUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-md bg-teal-deep px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
      title="Copies a short note, then opens LinkedIn"
    >
      {copied ? "Note copied · LinkedIn" : label}
    </button>
  );
}
