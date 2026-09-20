import Link from "next/link";
import {
  CONTACT_EMAIL,
  FOOTER_META_NAV,
  FOOTER_NAV,
} from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell site-footer-grid">
        <div>
          <p className="site-wordmark">IITB INV.ENT</p>
          <p className="site-footer-org">
            Desai Sethi School of Entrepreneurship
            <br />
            IIT Bombay
          </p>
          <p className="site-kicker site-footer-date">
            30–31 January 2027
            <br />
            IIT Bombay
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="site-kicker">Navigate</p>
          <ul>
            {FOOTER_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="site-kicker">Write</p>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
          <p className="site-footer-address">
            Desai Sethi School of Entrepreneurship
            <br />
            DSSE Building
            <br />
            IIT Bombay
            <br />
            Powai, Mumbai 400076
          </p>
        </div>
      </div>
      <div className="site-shell site-footer-meta">
        <nav aria-label="Policies">
          {FOOTER_META_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
