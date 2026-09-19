import Link from "next/link";
import type { ReactNode } from "react";

const NAV = [
  { href: "/about", label: "About IITB INV.ENT" },
  { href: "/conference", label: "Conference" },
  { href: "/workshops", label: "Workshop" },
  { href: "/programme", label: "Programme" },
  { href: "/accommodation", label: "Stay" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function PublicChrome({
  children,
  crumbs,
}: {
  children: ReactNode;
  crumbs?: { href: string; label: string }[];
}) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/" className="text-lg font-semibold text-teal-deep">
            IITB INV.ENT
          </Link>
          <nav
            aria-label="Primary"
            className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold"
            data-testid="nav"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap py-2 text-ink-soft hover:text-teal-deep sm:py-0"
                data-testid={
                  item.href === "/about"
                    ? "nav-about"
                    : item.href === "/contact"
                      ? "nav-contact"
                      : item.href === "/workshops"
                        ? "nav-workshop"
                        : undefined
                }
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="py-2 text-teal-deep sm:py-0"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>
      {crumbs && crumbs.length > 0 ? (
        <nav
          aria-label="Breadcrumb"
          className="mx-auto max-w-3xl px-4 pt-6 text-sm text-mute sm:px-6"
        >
          <ol className="flex flex-wrap gap-1">
            <li>
              <Link href="/" className="hover:text-teal-deep">
                Home
              </Link>
              <span aria-hidden="true"> / </span>
            </li>
            {crumbs.map((c, i) => (
              <li key={c.href}>
                {i === crumbs.length - 1 ? (
                  <span className="text-ink">{c.label}</span>
                ) : (
                  <>
                    <Link href={c.href} className="hover:text-teal-deep">
                      {c.label}
                    </Link>
                    <span aria-hidden="true"> / </span>
                  </>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      {children}
      <footer className="mt-16 border-t border-line">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-8 text-sm text-mute sm:px-6">
          <p>
            IITB INV.ENT · entrepreneurship research and practice conference · IIT Bombay
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/about">About IITB INV.ENT</Link>
            <Link href="/conference">Conference</Link>
            <Link href="/workshops">Workshop</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/accommodation">Stay</Link>
            <Link href="/travel">Travel</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/code-of-conduct">Code of conduct</Link>
            <a href="mailto:support@iitbinvent.com">support@iitbinvent.com</a>
          </p>
          <p>
            Desai Sethi School of Entrepreneurship · DSSE Building · Powai,
            Mumbai 400076
          </p>
        </div>
      </footer>
    </div>
  );
}
