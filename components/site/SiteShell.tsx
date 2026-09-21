import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import "@/app/site.css";
import { RouteProgress } from "./RouteProgress";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { SiteSplash } from "./SiteSplash";
import { SiteTheme } from "./SiteTheme";
import { getSiteChrome } from "@/lib/site-chrome";

export type Crumb = { href: string; label: string };

/**
 * Chrome for every public page: paper theme, sticky header, route progress,
 * breadcrumbs and footer. Pass `splash` on the landing page only.
 */
export async function SiteShell({
  children,
  crumbs,
  splash,
}: {
  children: ReactNode;
  crumbs?: Crumb[];
  splash?: boolean;
}) {
  const { signedInName, registerHref } = await getSiteChrome();

  return (
    <div className="site" data-testid="site-shell">
      <SiteTheme />
      {splash ? <SiteSplash /> : null}
      <Suspense fallback={null}>
        <RouteProgress />
      </Suspense>

      <a href="#main" className="site-skip">
        Skip to content
      </a>

      <SiteHeader signedInName={signedInName} registerHref={registerHref} />

      {crumbs && crumbs.length > 0 ? (
        <nav className="site-shell site-crumbs" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">Home</Link>
              <span aria-hidden="true"> / </span>
            </li>
            {crumbs.map((crumb, i) => (
              <li key={crumb.href}>
                {i === crumbs.length - 1 ? (
                  <span style={{ color: "var(--ink)" }}>{crumb.label}</span>
                ) : (
                  <>
                    <Link href={crumb.href}>{crumb.label}</Link>
                    <span aria-hidden="true"> / </span>
                  </>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <main id="main">{children}</main>

      <SiteFooter />
    </div>
  );
}
