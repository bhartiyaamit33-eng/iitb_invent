import type { TimelineItem } from "@/lib/landing";

/** Key dates with the current step lit from the real date, not hardcoded. */
export function KeyDates({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="site-timeline" aria-label="Key dates" data-testid="key-dates">
      {items.map((item) => (
        <li key={item.id} data-state={item.state}>
          <span className="node" aria-hidden="true" />
          <span className="kicker">{item.kicker}</span>
          <span className="date">{item.date}</span>
        </li>
      ))}
    </ol>
  );
}
