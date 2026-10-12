"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/base-path";

type NavItem = { href: string; label: string; count?: number; countLabel?: string };

export function AdminSidebar({
  editionName,
  userName,
  userEmail,
  awaitingDecision,
  unconfirmedPayments,
}: {
  editionName: string | null;
  userName: string;
  userEmail: string;
  awaitingDecision: number;
  unconfirmedPayments: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer after navigating, and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const groups: { label?: string; items: NavItem[] }[] = [
    { items: [{ href: "/admin", label: "Overview" }] },
    {
      label: "Registrations",
      items: [
        {
          href: "/admin/applications",
          label: "Applications",
          count: awaitingDecision,
          countLabel: "awaiting a decision",
        },
        {
          href: "/admin/payments",
          label: "Payments",
          count: unconfirmedPayments,
          countLabel: "payments not confirmed",
        },
        { href: "/admin/users", label: "Users" },
      ],
    },
    {
      label: "Programme",
      items: [
        { href: "/admin/sessions", label: "Sessions" },
        { href: "/admin/speakers", label: "Speakers" },
        { href: "/admin/checkin", label: "Check-in" },
      ],
    },
    {
      label: "Website",
      items: [
        { href: "/admin/pages", label: "Pages" },
        { href: "/admin/faqs", label: "FAQs" },
        { href: "/admin/stats", label: "Homepage figures" },
      ],
    },
    { label: "Setup", items: [{ href: "/admin/editions", label: "Editions" }] },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <div className="adm-topbar">
        <Link href="/admin" className="adm-brand-name" style={{ fontSize: 18, textDecoration: "none" }}>
          INV<span>.</span>ENT admin
        </Link>
        <button
          type="button"
          className="adm-btn is-small"
          aria-expanded={open}
          aria-controls="adm-side"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <aside id="adm-side" className="adm-side" data-open={open} aria-label="Admin navigation">
        <Link href="/admin" className="adm-brand">
          <span className="adm-brand-name">
            INV<span>.</span>ENT
          </span>
          <span className="adm-brand-sub">
            Admin{editionName ? ` for ${editionName}` : ""}
          </span>
        </Link>

        <nav className="adm-nav">
          {groups.map((group, i) => (
            <div key={group.label ?? i} className="adm-nav-group">
              {group.label ? <span className="adm-nav-label">{group.label}</span> : null}
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                  {item.count ? (
                    <span className="adm-nav-count" title={`${item.count} ${item.countLabel}`}>
                      {item.count}
                      <span className="sr-only"> {item.countLabel}</span>
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="adm-side-foot">
          <span className="adm-user">
            <strong>{userName}</strong>
            {userEmail}
          </span>
          <div className="adm-side-links">
            <Link href="/">View website</Link>
            <form action={withBasePath("/logout")} method="post">
              <button type="submit" data-testid="sign-out">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
