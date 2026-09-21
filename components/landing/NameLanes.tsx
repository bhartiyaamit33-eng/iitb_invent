import type { PublicOrg } from "@/lib/orgs-public";
import { cx } from "./cx";

function pad(items: readonly PublicOrg[], min = 8): PublicOrg[] {
  if (items.length === 0) return [];
  const out: PublicOrg[] = [];
  while (out.length < min) out.push(...items);
  return out;
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="name-lane-logo" src={item.logoUrl} alt="" />
          <span>{item.name}</span>
        </li>
      ))}
    </ul>
  );
}

function Lane({
  items,
  reverse,
  label,
}: {
  items: readonly PublicOrg[];
  reverse?: boolean;
  label: string;
}) {
  if (items.length === 0) return null;
  const padded = pad(items);
  return (
    <div className={cx("name-lane", reverse && "is-reverse")}>
      <p className="sr-only">{label}</p>
      <div className="name-lane-track">
        <LaneSet items={padded} />
        <LaneSet items={padded} inert />
      </div>
    </div>
  );
}

export function NameLanes({
  sponsors,
  partners,
}: {
  sponsors: readonly PublicOrg[];
  partners: readonly PublicOrg[];
}) {
  if (sponsors.length === 0 && partners.length === 0) return null;
  return (
    <div className="name-lanes" data-testid="partner-lanes">
      <Lane items={sponsors} label="Sponsors" />
      <Lane items={partners} reverse label="Partners" />
    </div>
  );
}
