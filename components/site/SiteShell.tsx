import Link from "next/link";
import type { ReactNode } from "react";
import { publicFontClass } from "@/app/landing-preview-fonts";
import { getPublishedOrgs } from "@/lib/orgs-public";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { SiteTheme } from "./SiteTheme";

export async function SiteShell({
  children,
  signedInName,
  crumbs,
}: {
  children: ReactNode;
  signedInName?: string | null;
  crumbs?: { href: string; label: string }[];
}) {
  const { sponsors, partners } = await getPublishedOrgs();
  const showSponsors = sponsors.length + partners.length > 0;

  return (
    <div className={`site ${publicFontClass}`}>
      <SiteTheme />
      <a href="#main" className="site-skip">
        Skip to content
      </a>
      <SiteHeader signedInName={signedInName} showSponsors={showSponsors} />
      {crumbs && crumbs.length > 0 ? (
        <nav aria-label="Breadcrumb" className="site-shell site-crumbs">
          <ol>
            <li>
              <Link href="/">Home</Link>
              <span aria-hidden="true"> / </span>
            </li>
            {crumbs.map((c, i) => (
              <li key={c.href}>
                {i === crumbs.length - 1 ? (
                  <span>{c.label}</span>
                ) : (
                  <>
                    <Link href={c.href}>{c.label}</Link>
                    <span aria-hidden="true"> / </span>
                  </>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      {children}
      <SiteFooter showSponsors={showSponsors} />
    </div>
  );
}
