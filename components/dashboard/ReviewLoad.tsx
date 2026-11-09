import Link from "next/link";
import type { ReviewCounts } from "@/lib/review-load";

export function ReviewLoad({
  editionName,
  allotted,
  done,
  pending,
  inProgress,
  showLink = false,
}: ReviewCounts & { editionName: string | null; showLink?: boolean }) {
  const cards = [
    {
      key: "allotted",
      label: "Allotted",
      value: allotted,
      hint: "applications assigned to you",
    },
    {
      key: "done",
      label: "Done",
      value: done,
      hint: "recommendations submitted",
    },
    {
      key: "pending",
      label: "Pending",
      value: pending,
      hint: inProgress > 0 ? `${inProgress} saved as a draft` : "still to submit",
    },
  ];

  return (
    <section className="mt-8" aria-label="Your review load" data-testid="review-load">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mute">
        Your reviews{editionName ? ` · ${editionName}` : ""}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.key} className="rounded-xl border border-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mute">{card.label}</p>
            <p
              className="mt-2 text-3xl font-semibold text-teal-deep"
              data-testid={`review-load-${card.key}`}
            >
              {card.value.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-sm text-ink-soft">{card.hint}</p>
          </div>
        ))}
      </div>
      {showLink ? (
        <Link
          href="/dashboard/reviews"
          className="mt-3 inline-block text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
        >
          Open assigned reviews →
        </Link>
      ) : null}
    </section>
  );
}
