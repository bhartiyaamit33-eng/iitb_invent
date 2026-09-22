import Link from "next/link";
import { InventMark } from "@/components/site/InventMark";
import { SiteTheme } from "@/components/site/SiteTheme";
import { noIndex } from "@/lib/seo";
import { SITE_NAV, SUPPORT_EMAIL } from "@/lib/site-content";
import "@/app/site.css";

export const metadata = {
  title: "Page not found",
  ...noIndex,
};

/**
 * Self-contained on purpose: the global 404 is prerendered, so it must not read
 * cookies or the database the way SiteShell does.
 */
export default function NotFound() {
  return (
    <div className="site">
      <SiteTheme />
      <main className="site-auth">
        <div className="site-shell" style={{ maxWidth: 720 }}>
          <Link
            href="/"
            className="site-auth-mark"
            aria-label="IITB INV.ENT home"
          >
            <InventMark style={{ fontSize: 34 }} />
          </Link>
          <p className="site-kicker is-blue">404</p>
          <h1
            className="site-serif"
            style={{
              margin: 0,
              fontSize: "clamp(2.2rem, 6vw, 3.6rem)",
              lineHeight: 1.05,
              color: "var(--navy)",
            }}
          >
            That page isn’t here.
          </h1>
          <p className="lead" style={{ marginTop: 20 }}>
            The link may be old, or the page may have moved. The call for papers now
            lives on the Research tab.
          </p>
          <ul className="theme-list" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {SITE_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} style={{ color: "var(--blue)" }}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <Link className="site-btn" href="/">
              Back to IITB INV.ENT →
            </Link>
            <a className="site-btn site-btn-ghost" href={`mailto:${SUPPORT_EMAIL}`}>
              Report a broken link
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
