"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

export function ReviewSubmitButtons({ reviewId }: { reviewId: string }) {
  const { pending } = useFormStatus();
  const [busy, setBusy] = useState<"draft" | "submit" | null>(null);

  useEffect(() => {
    if (!pending) setBusy(null);
  }, [pending]);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="submit"
        name="intent"
        value="draft"
        disabled={pending}
        onClick={() => setBusy("draft")}
        className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-teal-deep disabled:opacity-60"
      >
        {pending && busy === "draft" ? "Saving draft…" : "Save draft"}
      </button>
      <button
        type="submit"
        name="intent"
        value="submit"
        disabled={pending}
        onClick={() => setBusy("submit")}
        className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        data-testid={`submit-review-${reviewId}`}
      >
        {pending && busy === "submit" ? "Submitting…" : "Submit decision"}
      </button>
    </div>
  );
}
