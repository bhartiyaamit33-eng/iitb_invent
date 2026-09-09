import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/admin/audit";
import { csvEscape } from "@/lib/payments/service";
import {
  CATEGORY_LABEL,
  KIND_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/lib/payments/pricing";

export const dynamic = "force-dynamic";

export async function GET() {
  const actor = await getCurrentUser();
  try {
    requireAdmin(actor);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      submission: {
        select: { title: true, kind: true, organisation: true, authors: true },
      },
      edition: { select: { year: true, name: true } },
    },
  });

  const header = [
    "invoiceNumber",
    "status",
    "statusLabel",
    "amount",
    "currency",
    "payerCategory",
    "payerCategoryLabel",
    "purpose",
    "kind",
    "kindLabel",
    "submissionTitle",
    "authors",
    "organisation",
    "payerName",
    "payerEmail",
    "userId",
    "opUserId",
    "reqId",
    "payToken",
    "appId",
    "transId",
    "refNo",
    "provId",
    "pgStatus",
    "msg",
    "transDate",
    "transTime",
    "reconDate",
    "reconTime",
    "settledAt",
    "refundAmount",
    "refundAt",
    "paymentLinkSentAt",
    "invoiceSentAt",
    "createdAt",
    "editionYear",
    "editionName",
  ];

  const rows = payments.map((p) =>
    [
      p.invoiceNumber ?? "",
      p.status,
      PAYMENT_STATUS_LABEL[p.status],
      p.amount.toString(),
      p.currency,
      p.payerCategory,
      CATEGORY_LABEL[p.payerCategory],
      p.purpose,
      p.submission.kind,
      KIND_LABEL[p.submission.kind],
      p.submission.title,
      p.submission.authors ?? "",
      p.submission.organisation ?? "",
      p.user.name,
      p.user.email,
      p.user.id,
      p.opUserId,
      p.reqId,
      p.payToken,
      p.appId,
      p.transId ?? "",
      p.refNo ?? "",
      p.provId ?? "",
      p.pgStatus ?? "",
      p.msg ?? "",
      p.transDate ?? "",
      p.transTime ?? "",
      p.reconDate ?? "",
      p.reconTime ?? "",
      p.settledAt?.toISOString() ?? "",
      p.refundAmount?.toString() ?? "",
      p.refundAt?.toISOString() ?? "",
      p.paymentLinkSentAt?.toISOString() ?? "",
      p.invoiceSentAt?.toISOString() ?? "",
      p.createdAt.toISOString(),
      String(p.edition.year),
      p.edition.name,
    ]
      .map(csvEscape)
      .join(","),
  );

  await writeAuditLog({
    actorId: actor!.id,
    action: "payment.export",
    entityType: "Payment",
    after: { count: payments.length },
  });

  const body = [header.join(","), ...rows].join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invent-payments-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
