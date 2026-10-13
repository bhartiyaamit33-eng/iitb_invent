import Image from "next/image";
import type { SiteOrg } from "@/lib/site-content";

function Plate({ org, logosOnly }: { org: SiteOrg; logosOnly?: boolean }) {
  const body = (
    <>
      {org.logo ? (
        <Image
          src={org.logo}
          alt={org.name}
          width={480}
          height={160}
          sizes="200px"
        />
      ) : (
        <span className="logo-type">{org.name}</span>
      )}
      {logosOnly ? null : <span className="logo-role">{org.role}</span>}
    </>
  );

  const className = logosOnly ? "logo-plate is-mark" : "logo-plate";

  if (org.href) {
    return (
      <a
        className={className}
        data-tier={org.tier}
        data-testid={`logo-${org.id}`}
        href={org.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {body}
      </a>
    );
  }

  return (
    <div
      className={className}
      data-tier={org.tier}
      data-testid={`logo-${org.id}`}
    >
      {body}
    </div>
  );
}

/**
 * Sponsor and partner plates. A plate with a `logo` renders the artwork; one
 * without renders the name as a serif wordmark, so adding a logo later is a
 * one-line change in lib/site-content.ts and never leaves a hole in the grid.
 *
 * An empty roster renders a "coming soon" plate instead of collapsing, so a
 * heading is never left hanging over blank space while MoUs are unsigned.
 */
export function LogoWall({
  orgs,
  testId,
  emptyLabel = "Coming soon",
  logosOnly = false,
}: {
  orgs: SiteOrg[];
  testId?: string;
  emptyLabel?: string;
  /** Artwork only — no role line under the mark. */
  logosOnly?: boolean;
}) {
  return (
    <div className={logosOnly ? "logo-wall is-marks" : "logo-wall"} data-testid={testId}>
      {orgs.length === 0 ? (
        <p className="logo-plate is-empty" data-testid={`${testId ?? "logo-wall"}-empty`}>
          <span className="logo-role">{emptyLabel}</span>
        </p>
      ) : (
        orgs.map((org) => <Plate key={org.id} org={org} logosOnly={logosOnly} />)
      )}
    </div>
  );
}

function ReelSet({ orgs, hidden }: { orgs: SiteOrg[]; hidden?: boolean }) {
  return (
    <ul className="partner-reel-set" aria-hidden={hidden || undefined}>
      {orgs.map((org) => (
        <li key={`${hidden ? "dup" : "src"}-${org.id}`}>
          {org.logo ? (
            <Image src={org.logo} alt={hidden ? "" : org.name} width={320} height={80} />
          ) : (
            <span>{org.name}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Slow logo strip. The roster is the signed partners until a longer institute list arrives. */
export function LogoReel({ orgs }: { orgs: SiteOrg[] }) {
  if (orgs.length === 0) return null;
  return (
    <div className="partner-reel" aria-label="Partner institutes" data-testid="partner-reel">
      <div className="partner-reel-track">
        <ReelSet orgs={orgs} />
        <ReelSet orgs={orgs} hidden />
      </div>
    </div>
  );
}
