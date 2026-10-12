"use client";

import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/base-path";

/** Remember this payment link on the browser, so /research shows the application. */
export function RememberPaymentToken({ token }: { token: string }) {
  useEffect(() => {
    void fetch(withBasePath("/api/conference/remember"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ token }),
    });
  }, [token]);
  return null;
}

/**
 * A plain link to the gateway, as in the reference flow, that locks after the
 * first click so a double click cannot open two payment requests.
 */
export function GatewayHandoffButton({ href, label }: { href: string; label: string }) {
  const [leaving, setLeaving] = useState(false);
  return (
    <a
      href={href}
      referrerPolicy="origin"
      onClick={(event) => {
        if (leaving) event.preventDefault();
        setLeaving(true);
      }}
      aria-disabled={leaving}
      className={`mt-6 block rounded-md bg-teal-deep px-4 py-3 text-center text-sm font-semibold text-white ${leaving ? "pointer-events-none opacity-70" : ""}`}
      data-testid="onlinepay-handoff"
    >
      {leaving ? "Redirecting to IIT Bombay OnlinePay…" : label}
    </a>
  );
}
