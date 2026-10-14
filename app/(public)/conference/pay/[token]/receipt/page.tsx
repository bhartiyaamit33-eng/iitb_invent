import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { GST_PERCENT, formatInrFromPaise, gstPaise, withGstPaise } from "@/lib/conference";
import { rupeesToPaise } from "@/lib/onlinepay";
import { noIndex } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { ...noIndex, referrer: "origin" };

export default async function Receipt({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const app = await prisma.conferenceApplication.findUnique({
    where: { paymentToken: token },
    include: {
      edition: { select: { name: true } },
      gatewayPayments: { where: { verified: true }, orderBy: { createdAt: "asc" }, take: 1 },
    },
  });
  if (!app || app.paymentStatus !== "PAID") notFound();
  const payment = app.gatewayPayments[0];
  const paise = payment ? rupeesToPaise(payment.amount) : null;
  // Fee and GST lines when the payment is exactly fee + GST.
  const fee = app.paymentAmountPaise;
  const itemised = paise === withGstPaise(fee);

  const rows: [string, string][] = [
    ["Name", app.name],
    ["Email", app.email],
    ["Registration ID", app.payerId ?? "—"],
    ["Event", app.edition.name],
    ...(itemised
      ? ([
          ["Subtotal", formatInrFromPaise(fee)],
          [`GST (${GST_PERCENT}%)`, formatInrFromPaise(gstPaise(fee))],
        ] as [string, string][])
      : []),
    [itemised ? "Total" : "Amount paid", formatInrFromPaise(paise ?? withGstPaise(fee))],
    ...(payment
      ? ([
          ["Transaction ID", payment.transId],
          ["Bank reference", payment.refNo ?? "—"],
          ["Paid on", [payment.imtDate, payment.imtTime].filter(Boolean).join(" ") || payment.reconStamp || "—"],
        ] as [string, string][])
      : ([["Reference", app.paymentRef || "Recorded by the organisers"]] as [string, string][])),
  ];

  return (
    <main className="mx-auto max-w-2xl px-6 py-12" data-testid="payment-receipt">
      <p className="text-sm">IIT Bombay · INV.ENT</p>
      <h1 className="mt-3 font-display text-4xl text-teal-deep">Payment receipt</h1>
      <dl className="my-8 divide-y divide-line border-y border-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-wrap justify-between gap-3 py-3">
            <dt className="text-sm text-mute">{label}</dt>
            <dd className="break-all text-sm font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="rounded bg-paper p-4 text-sm">
        Paid through IIT Bombay OnlinePay.
        {itemised ? ` The total includes ${GST_PERCENT}% GST on the subtotal.` : ""} This
        is a payment receipt, not a GST tax invoice.
      </p>
      <p className="mt-6 text-sm print:hidden">
        Use your browser’s Print → Save as PDF to keep a copy.
      </p>
      <Link className="mt-4 block text-sm underline print:hidden" href={`/conference/pay/${encodeURIComponent(token)}`}>
        Back to payment
      </Link>
    </main>
  );
}
