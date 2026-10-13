"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { InventMark } from "./InventMark";
import { EVENT_DATES_SHORT, EVENT_VENUE, SITE_NAV } from "@/lib/site-content";

export function SiteHeader({
  signedInName,
  registerHref,
}: {
  signedInName: string | null;
  registerHref: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const accountHref = signedInName ? "/dashboard" : "/login";
  const accountLabel = signedInName ?? "Login";

  function isCurrent(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="site-header" data-testid="site-header">
      <div className="site-header-bar">
        <Link href="/" className="site-wordmark" data-testid="site-home-link">
          <span className="site-brand">
            <Image
              src="/assets/iitb-logo.png"
              alt="IIT Bombay"
              width={512}
              height={499}
              className="site-brand-iitb"
              priority
            />
            <Image
              src="/assets/dsse-wordmark.png"
              alt="Desai Sethi School of Entrepreneurship"
              width={1600}
              height={320}
              className="site-brand-dsse"
              priority
            />
            <span className="site-brand-rule" aria-hidden="true" />
            <InventMark style={{ fontSize: 26 }} />
          </span>
        </Link>

        <nav className="site-nav-desktop" aria-label="Primary" data-testid="nav">
          {SITE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="site-nav-link"
              aria-current={isCurrent(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header-end">
          <p className="site-header-meta">
            <span>{EVENT_DATES_SHORT}</span>
            <span>{EVENT_VENUE}</span>
          </p>
          <Link
            href={registerHref}
            className="site-btn site-btn-sm"
            data-testid="nav-register"
          >
            {signedInName ? "Dashboard →" : "Register →"}
          </Link>
          <Link href={accountHref} className="site-account" data-testid="nav-account">
            {accountLabel}
          </Link>
          <button
            type="button"
            className="site-menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-nav-mobile"
            onClick={() => setOpen((v) => !v)}
            data-testid="nav-toggle"
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <nav
        id="site-nav-mobile"
        className={open ? "site-nav-mobile is-open" : "site-nav-mobile"}
        aria-label="Primary (mobile)"
        data-testid="nav-mobile"
      >
        {SITE_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isCurrent(item.href) ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
        <Link href={accountHref}>{signedInName ? "Dashboard" : "Login"}</Link>
      </nav>
    </header>
  );
}
