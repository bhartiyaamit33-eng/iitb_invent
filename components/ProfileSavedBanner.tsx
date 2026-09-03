"use client";

import { useEffect, useState } from "react";

export function ProfileSavedBanner({
  saved,
  percent,
}: {
  saved: boolean;
  percent: number;
}) {
  const [visible, setVisible] = useState(saved);

  useEffect(() => {
    if (!saved) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 6000);
    return () => window.clearTimeout(t);
  }, [saved, percent]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="mt-6 overflow-hidden rounded-xl border border-ent/40 bg-white shadow-sm"
    >
      <div className="px-4 py-3 sm:px-5">
        <p className="text-sm font-semibold text-teal-deep">Profile saved</p>
        <p className="mt-0.5 text-sm text-ink-soft">
          Your profile is <strong className="text-ink">{percent}% complete</strong>
          {percent < 100
            ? " — add LinkedIn, a photo, and a headline to reach 100%."
            : " — nice work."}
        </p>
      </div>
      <div className="h-1.5 bg-paper">
        <div
          className="h-full bg-teal transition-[width] duration-500"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}
