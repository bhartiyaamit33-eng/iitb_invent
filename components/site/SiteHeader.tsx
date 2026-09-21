"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import {
  publicNav,
  accountHrefFor,
  registerHrefFor,
} from "@/lib/site";

export function SiteHeader({
  signedInName,
  showSponsors = false,
}: {
  signedInName?: string | null;
  showSponsors?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const signedIn = Boolean(signedInName);
  const registerHref = registerHrefFor(signedIn);
  const registerLabel = signedIn ? "Dashboard" : "Register";
  const accountHref = accountHrefFor(signedIn);
  const accountLabel = signedInName ?? "Login";
  const nav = publicNav(showSponsors);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="site-header">
      <div className="site-header-bar">
        <Link href="/" className="site-wordmark" data-testid="brand-mark">
          IITB INV.ENT
        </Link>

        <nav
          className="site-nav-desktop"
          aria-label="Primary"
          data-testid="nav"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="site-nav-link"
              data-testid={item.testId}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header-end">
          <p className="site-header-meta">
            <span>30–31 JAN 2027</span>
            <span>IIT BOMBAY</span>
          </p>
          <Link
            href={registerHref}
            className="site-btn site-btn-sm"
            data-testid="nav-register"
          >
            {registerLabel} →
          </Link>
          <Link href={accountHref} className="site-account">
            {accountLabel}
          </Link>
          <button
            type="button"
            className="site-menu-toggle"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <nav
        id={menuId}
        className={`site-nav-mobile${open ? " is-open" : ""}`}
        aria-label="Primary"
        hidden={!open}
      >
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="site-nav-link"
            data-testid={`mobile-${item.testId}`}
          >
            {item.label}
          </Link>
        ))}
        <Link href={accountHref} className="site-nav-link">
          {accountLabel}
        </Link>
      </nav>
    </header>
  );
}
