"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type DashboardNotice = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationsPanel({
  notices,
}: {
  notices: DashboardNotice[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const unread = notices.filter((n) => !n.readAt).length;

  async function markRead(id?: string) {
    setPending(true);
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(id ? { id } : {}),
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (notices.length === 0) return null;

  return (
    <section
      className="mb-8 mt-6 rounded-xl border border-line bg-white p-5 shadow-sm"
      data-testid="dashboard-notifications"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mute">
          Notices{unread ? ` · ${unread} new` : ""}
        </p>
        {unread ? (
          <button
            type="button"
            onClick={() => void markRead()}
            disabled={pending}
            className="text-xs font-semibold text-teal-deep underline-offset-2 hover:underline disabled:opacity-60"
          >
            Mark all read
          </button>
        ) : null}
      </div>
      <ul className="mt-3 space-y-3">
        {notices.map((n) => (
          <li
            key={n.id}
            className={n.readAt ? "opacity-70" : ""}
            data-testid="dashboard-notice"
          >
            <p className="text-sm font-semibold text-ink">{n.title}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-ink-soft">
              {n.body}
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              {n.href ? (
                <Link
                  href={n.href}
                  onClick={() => {
                    if (!n.readAt) void markRead(n.id);
                  }}
                  className="text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
                >
                  {n.href.startsWith("/conference/pay/")
                    ? "Pay with IIT Bombay Online Pay →"
                    : "Open →"}
                </Link>
              ) : null}
              {!n.readAt ? (
                <button
                  type="button"
                  onClick={() => void markRead(n.id)}
                  disabled={pending}
                  className="text-sm text-mute underline-offset-2 hover:underline disabled:opacity-60"
                >
                  Dismiss
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
