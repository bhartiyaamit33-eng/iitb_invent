import { PARTNERS, SPONSORS, type OrgMention } from "@/lib/site";
import { cx } from "./cx";

function pad(items: readonly OrgMention[], min = 8): OrgMention[] {
  if (items.length === 0) return [];
  const out: OrgMention[] = [];
  while (out.length < min) out.push(...items);
  return out;
}

function LaneSet({
  items,
  inert,
}: {
  items: readonly OrgMention[];
  inert?: boolean;
}) {
  return (
    <ul className="name-lane-set" aria-hidden={inert || undefined}>
      {items.map((item, i) => (
        <li key={`${inert ? "dup" : "src"}-${item.name}-${i}`}>
          <span>{item.name}</span>
          {item.status === "in-conversation" ? (
            <em>In conversation</em>
          ) : item.note ? (
            <em>{item.note}</em>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function Lane({
  items,
  reverse,
}: {
  items: readonly OrgMention[];
  reverse?: boolean;
}) {
  const padded = pad(items);
  if (padded.length === 0) return null;
  return (
    <div className={cx("name-lane", reverse && "is-reverse")}>
      <div className="name-lane-track">
        <LaneSet items={padded} />
        <LaneSet items={padded} inert />
      </div>
    </div>
  );
}

export function NameLanes() {
  return (
    <div className="name-lanes" data-testid="partner-lanes" aria-hidden="true">
      <Lane items={SPONSORS} />
      <Lane items={PARTNERS} reverse />
    </div>
  );
}
