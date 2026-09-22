import Image from "next/image";
import type { SiteOrg } from "@/lib/site-content";

function Plate({ org }: { org: SiteOrg }) {
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
      <span className="logo-role">{org.role}</span>
    </>
  );

  if (org.href) {
    return (
      <a
        className="logo-plate"
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
    <div className="logo-plate" data-tier={org.tier} data-testid={`logo-${org.id}`}>
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
}: {
  orgs: SiteOrg[];
  testId?: string;
  emptyLabel?: string;
}) {
  return (
    <div className="logo-wall" data-testid={testId}>
      {orgs.length === 0 ? (
        <p className="logo-plate is-empty" data-testid={`${testId ?? "logo-wall"}-empty`}>
          <span className="logo-role">{emptyLabel}</span>
        </p>
      ) : (
        orgs.map((org) => <Plate key={org.id} org={org} />)
      )}
    </div>
  );
}
