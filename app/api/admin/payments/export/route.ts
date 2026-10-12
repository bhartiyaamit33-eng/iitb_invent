import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/roles";
import { gatewayStatusLabel } from "@/lib/conference-payment";

export const dynamic = "force-dynamic";

function csv(value: unknown) {
  let s = value == null ? "" : String(value);
  // Spreadsheet formula injection guard.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** Every gateway transaction, one row each, for reconciliation with ASC's report. */
export async function GET() {
  const actor = await getCurrentUser();
  try {
    requireAdmin(actor);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payments = await prisma.gatewayPayment.findMany({
    include: { application: { select: { name: true, email: true, paymentStatus: true } } },
    orderBy: { createdAt: "asc" },
  });

  const rows: unknown[][] = [
    [
      "Received UTC",
      "Participant",
      "Email",
      "Registration ID",
      "Amount INR",
      "Status",
      "Confirmed",
      "Registration payment status",
      "Transaction ID",
      "Bank reference",
      "Request ID",
      "Mode",
      "Immediate status",
      "Paid date",
      "Paid time",
      "Immediate ACK",
      "Reconciliation",
      "Reconciled at",
      "Reconciliation ACK",
      "Receipt emailed UTC",
    ],
  ];
  for (const p of payments) {
    rows.push([
      p.createdAt.toISOString(),
      p.application?.name,
      p.application?.email,
      p.payerId,
      p.amount,
      gatewayStatusLabel(p),
      p.verified ? "Yes" : "No",
      p.application?.paymentStatus,
      p.transId,
      p.refNo,
      p.reqId,
      p.provId,
      p.imtStatus,
      p.imtDate,
      p.imtTime,
      p.imtAck,
      p.reconStatus,
      p.reconStamp,
      p.reconAck,
      p.receiptMailedAt?.toISOString(),
    ]);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse("﻿" + rows.map((r) => r.map(csv).join(",")).join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invent-payments-${stamp}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
