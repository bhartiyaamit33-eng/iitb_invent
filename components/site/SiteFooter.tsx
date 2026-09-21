import Image from "next/image";
import Link from "next/link";
import { InventMark } from "./InventMark";
import {
  EVENT_DATES,
  EVENT_VENUE,
  FOOTER_POLICY_NAV,
  SITE_NAV,
  SUPPORT_EMAIL,
  VENUE_LINES,
} from "@/lib/site-content";

export function SiteFooter() {
  return (
    <footer className="site-footer" id="site-footer" data-testid="site-footer">
      <div className="site-shell site-footer-grid">
        <div>
          <p className="site-wordmark" style={{ margin: 0 }}>
            <InventMark style={{ fontSize: 38 }} />
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              margin: "18px 0 20px",
            }}
          >
            <Image
              src="/assets/iitb-logo.png"
              alt="IIT Bombay"
              width={1024}
              height={998}
              style={{ height: 36, width: "auto", display: "block" }}
            />
            <span
              aria-hidden="true"
              style={{
                display: "block",
                width: 1,
                height: 30,
                background: "rgba(11,37,69,0.16)",
              }}
            />
            <Image
              src="/assets/dsse-logo.png"
              alt="Desai Sethi School of Entrepreneurship"
              width={1477}
              height={254}
              style={{ height: 30, width: "auto", display: "block" }}
            />
          </div>
          <p className="site-kicker site-footer-date">
            {EVENT_DATES}
            <br />
            {EVENT_VENUE}
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="site-kicker">Navigate</p>
          <ul>
            {SITE_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="site-kicker">Write</p>
          <p style={{ margin: 0 }}>
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
          <p className="site-footer-address">
            {VENUE_LINES.map((line) => (
              <span key={line} style={{ display: "block" }}>
                {line}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="site-shell site-footer-meta">
        <nav aria-label="Policies">
          {FOOTER_POLICY_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
