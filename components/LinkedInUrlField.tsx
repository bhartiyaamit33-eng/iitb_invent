"use client";

import { useState } from "react";
import { linkedInSlugFromUrl } from "@/lib/profile/completeness";

const PREFIX = "https://www.linkedin.com/in/";

/**
 * Prefixed LinkedIn field: edit the slug, or paste a full URL into the box.
 */
export function LinkedInUrlField({
  name = "linkedinUrl",
  defaultValue,
}: {
  name?: string;
  defaultValue?: string | null;
}) {
  const initialSlug = linkedInSlugFromUrl(defaultValue);
  const [slug, setSlug] = useState(initialSlug);
  const [hint, setHint] = useState<string | null>(null);

  function onChange(raw: string) {
    const v = raw.trim();
    if (/linkedin\.com|lnkd\.in|^https?:\/\//i.test(v) || v.includes("/")) {
      // Pasted full URL — extract slug when possible, else keep raw path handling server-side
      const extracted = linkedInSlugFromUrl(v);
      if (extracted) {
        setSlug(extracted);
        setHint("Got it — using your profile slug.");
      } else {
        setSlug(v);
        setHint("We'll normalise this when you save.");
      }
    } else {
      setSlug(raw.replace(/^\/+/, ""));
      setHint(null);
    }
  }

  const stored = slug.trim()
    ? slug.includes("linkedin.com") || slug.startsWith("http")
      ? slug.trim()
      : `${PREFIX}${slug.trim().replace(/^\/+/, "")}`
    : "";

  return (
    <div>
      <span className="text-sm font-medium">LinkedIn</span>
      <div className="mt-1.5 flex overflow-hidden rounded-md border border-line focus-within:border-teal">
        <span className="hidden shrink-0 select-none bg-paper px-3 py-2.5 text-sm text-mute sm:inline">
          linkedin.com/in/
        </span>
        <input
          type="text"
          value={slug}
          onChange={(e) => onChange(e.target.value)}
          placeholder="your-handle (or paste full URL)"
          autoComplete="url"
          className="min-w-0 flex-1 px-3 py-2.5 outline-none"
          aria-label="LinkedIn profile"
        />
      </div>
      <input type="hidden" name={name} value={stored} />
      <p className="mt-1.5 text-xs text-mute">
        {hint ??
          "Type your handle, or paste the full LinkedIn URL — either works."}
      </p>
    </div>
  );
}
