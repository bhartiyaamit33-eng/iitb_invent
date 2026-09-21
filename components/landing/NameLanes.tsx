import type { PublicOrg } from "@/lib/orgs-public";
import { cx } from "./cx";

function pad(items: readonly PublicOrg[], min = 8): PublicOrg[] {
  if (items.length === 0) return [];
  const out: PublicOrg[] = [];
  while (out.length < min) out.push(...items);
  return out;
}

function Logo({ item }: { item: PublicOrg }) {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="name-lane-logo" src={item.logoUrl} alt={item.name} />
  );
  if (!item.websiteUrl) return image;
  return (
    <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer">
      {image}
    </a>
  );
}

function LaneSet({
  items,
  inert,
}: {
  items: readonly PublicOrg[];
  inert?: boolean;
}) {
  return (
    <ul className="name-lane-set" aria-hidden={inert || undefined}>
      {items.map((item, i) => (
        <li key={`${inert ? "dup" : "src"}-${item.id}-${i}`}>
          <Logo item={item} />
        </li>
      ))}
    </ul>
  );
}

function Lane({
  items,
  reverse,
}: {
  items: readonly PublicOrg[];
  reverse?: boolean;
}) {
  const padded = pad(items);
  return (
    <div className={cx("name-lane", reverse && "is-reverse")}>
      <div className="name-lane-track">
        <LaneSet items={padded} />
        <LaneSet items={padded} inert />
      </div>
    </div>
  );
}

export function NameLanes({ orgs }: { orgs: readonly PublicOrg[] }) {
  if (orgs.length === 0) return null;
  return (
    <div className="name-lanes" data-testid="sponsor-lanes" aria-label="Sponsors">
      <Lane items={orgs} />
      <Lane items={orgs} reverse />
    </div>
  );
}
