"use client";

import { useState } from "react";
import { IconLinkedIn } from "@/components/icons";

export function ConnectOnLinkedIn({
  linkedinUrl,
  note,
  label = "Connect on LinkedIn",
  variant = "button",
}: {
  linkedinUrl: string;
  note: string;
  label?: string;
  /** `icon` = LinkedIn logo only (directory cards) */
  variant?: "button" | "icon";
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

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-[#0A66C2] transition hover:bg-paper"
        title={copied ? "Note copied — LinkedIn opened" : "Copy intro note & open LinkedIn"}
        aria-label="Connect on LinkedIn"
      >
        <IconLinkedIn className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-md bg-teal-deep px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
      title="Copies a short note, then opens LinkedIn"
    >
      <IconLinkedIn className="h-3.5 w-3.5" />
      {copied ? "Note copied" : label}
    </button>
  );
}
