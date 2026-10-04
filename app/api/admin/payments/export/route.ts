import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/roles";
export const dynamic = "force-dynamic";
function csv(value: unknown) {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
export async function GET(req: Request) {
  const actor = await getCurrentUser();
  try {
    requireAdmin(actor);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  if (url.searchParams.get("events") === "1") {
    const events = await prisma.paymentEvent.findMany({
      include: { application: true, attempt: true },
      orderBy: { createdAt: "asc" },
    });
    const rows: unknown[][] = [
      [
        "Time UTC",
        "Participant",
        "Email",
        "Environment",
        "Type",
        "Outcome",
        "Request ID",
        "Transaction ID",
        "Amount INR",
        "Reason",
      ],
    ];
    for (const e of events)
      rows.push([
        e.createdAt.toISOString(),
        e.application?.name,
        e.application?.email,
        e.attempt?.environment || "legacy / unknown",
        e.kind,
        e.outcome,
        e.requestId,
        e.transId,
        e.amount,
        e.reason,
      ]);
    return new NextResponse(
      "\uFEFF" + rows.map((r) => r.map(csv).join(",")).join("\r\n"),
      {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="gateway-activity.csv"',
          "Cache-Control": "private, no-store",
        },
      },
    );
  }
  const accounts = url.searchParams.get("accounts") === "1";
  const apps = await prisma.conferenceApplication.findMany({
    where: accounts
      ? { paymentStatus: "PAID", edition: { endsAt: { lte: new Date() } } }
      : {},
    include: {
      edition: true,
      receipt: true,
      coupon: true,
      paymentAttempts: true,
      paymentEvents: {
        where: { kind: { in: ["R", "D"] }, outcome: { not: "REJECTED" } },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  if (accounts && !apps.length)
    return NextResponse.json(
      {
        error:
          "No paid registrations from completed programs are ready for Accounts.",
      },
      { status: 409 },
    );
  const rows: unknown[][] = [
    [
      "Application ID",
      "Program",
      "Program ends",
      "Name",
      "Email",
      "Phone",
      "Institution",
      "Billing name",
      "Billing address",
      "GSTIN",
      "Amount INR",
      "Discount INR",
      "Coupon",
      "Payment status",
      "Paid at",
      "Request ID",
      "Transaction ID",
      "Bank reference",
      "Gateway mode",
      "Receipt number",
      "Settlement notices",
      "Refund notices",
      "Attempt history",
      "Accounts review",
      "Accounts GST invoice",
      "Accounts document URL",
    ],
  ];
  for (const a of apps)
    rows.push([
      a.id,
      a.edition.name,
      a.edition.endsAt.toISOString(),
      a.name,
      a.email,
      a.phone,
      a.institution,
      a.billingName || a.name,
      a.billingAddress,
      a.billingGstin,
      (a.paymentAmountPaise / 100).toFixed(2),
      (a.discountPaise / 100).toFixed(2),
      a.coupon?.code,
      a.paymentStatus,
      a.paidAt?.toISOString(),
      a.opReqId,
      a.opTransId,
      a.opRefNo,
      a.opProvId,
      a.receipt?.number,
      a.paymentEvents
        .filter((e) => e.kind === "R")
        .map((e) => e.transId)
        .join("; "),
      a.paymentEvents
        .filter((e) => e.kind === "D")
        .map((e) => `${e.transId}: ${e.amount}`)
        .join("; "),
      a.paymentAttempts
        .map(
          (t) =>
            `${t.environment}: ${t.requestId}: ${t.status}: INR ${(t.amountPaise / 100).toFixed(2)}`,
        )
        .join("; "),
      a.paymentEvents.some((e) => e.kind === "D")
        ? "Refund / chargeback requires review"
        : "Confirm fee and tax breakdown with Accounts",
      a.gstInvoiceRef,
      a.gstInvoiceUrl,
    ]);
  return new NextResponse(
    "\uFEFF" + rows.map((r) => r.map(csv).join(",")).join("\r\n"),
    {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${accounts ? "iitb-accounts-gst-list" : "payment-ledger"}.csv"`,
        "Cache-Control": "private, no-store",
      },
    },
  );
}
