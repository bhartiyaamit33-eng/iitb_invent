"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  formatInrFromPaise,
  paymentStatusLabel,
  type ApplicationPaymentStatus,
} from "@/lib/colloquium";

export function ColloquiumPayPanel({
  token,
  name,
  amountPaise,
  paymentStatus,
  upiId,
  upiName,
  paymentRef,
}: {
  token: string;
  name: string;
  amountPaise: number;
  paymentStatus: ApplicationPaymentStatus;
  upiId: string;
  upiName: string;
  paymentRef?: string | null;
}) {
  const amount = formatInrFromPaise(amountPaise);
  const rupees = (amountPaise / 100).toFixed(2);
  const upiLink = useMemo(() => {
    if (!upiId) return "";
    const params = new URLSearchParams({
      pa: upiId,
      pn: upiName,
      am: rupees,
      cu: "INR",
      tn: "Inv.ent Research Colloquium",
    });
    return `upi://pay?${params.toString()}`;
  }, [upiId, upiName, rupees]);

  const [qr, setQr] = useState<string | null>(null);
  const [ref, setRef] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(paymentStatus);

  useEffect(() => {
    if (!upiLink) return;
    QRCode.toDataURL(upiLink, { width: 220, margin: 1 })
      .then(setQr)
      .catch(() => setQr(null));
  }, [upiLink]);

  const settled = status === "PAID" || status === "WAIVED";
  const reported = status === "REPORTED";

  async function report() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/colloquium/pay/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ paymentRef: ref }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        paymentStatus?: ApplicationPaymentStatus;
      } | null;
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Could not record payment.");
        return;
      }
      if (data.paymentStatus) setStatus(data.paymentStatus);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-line bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mute">
        Registration fee
      </p>
      <p className="mt-1 font-display text-4xl text-teal-deep">{amount}</p>
      <p className="mt-2 text-sm text-ink-soft">
        Hi {name}. Status:{" "}
        <strong className="text-ink">{paymentStatusLabel(status)}</strong>
        {paymentRef ? ` · ref ${paymentRef}` : null}
      </p>

      {settled ? (
        <p className="mt-4 rounded-md bg-paper px-3 py-2 text-sm text-ink">
          {status === "WAIVED"
            ? "The fee has been waived. You do not need to pay."
            : "Payment received. Organisers have marked this as paid."}
        </p>
      ) : null}

      {!settled ? (
        <>
          {upiId && upiLink ? (
            <div className="mt-6">
              <p className="text-sm text-ink">
                Pay {amount} to <strong>{upiName}</strong> ({upiId}).
              </p>
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qr}
                  alt="UPI QR code"
                  className="mt-3 h-44 w-44"
                  data-testid="upi-qr"
                />
              ) : null}
              <a
                href={upiLink}
                className="mt-3 inline-block rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white"
              >
                Open UPI app
              </a>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">
              Complete the {amount} transfer using the details organisers shared,
              then enter the UPI or bank reference below so we can mark you paid.
            </p>
          )}

          {reported ? (
            <p className="mt-4 rounded-md bg-paper px-3 py-2 text-sm text-ink">
              We have your reference. Organisers will confirm it shortly.
            </p>
          ) : (
            <form
              className="mt-6 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void report();
              }}
            >
              <label className="block text-sm">
                <span className="text-ink">UPI / bank reference</span>
                <input
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  required
                  minLength={4}
                  className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5"
                  placeholder="UPI Ref / UTR"
                  data-testid="payment-ref"
                />
              </label>
              {error ? (
                <p className="text-sm text-red-700" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                data-testid="report-payment"
              >
                {pending ? "Saving…" : "I have paid"}
              </button>
            </form>
          )}
        </>
      ) : null}
    </section>
  );
}
