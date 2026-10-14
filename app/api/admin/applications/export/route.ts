import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/admin/audit";
import {
  applicationStatusLabel,
  participationLabel,
  phdYearLabel,
  postdocLabel,
  professionalLabel,
  gstPaise,
  withGstPaise,
} from "@/lib/conference";
import { abstractPdfPublicUrl, conferencePaymentUrl } from "@/lib/conference-server";
import { proformaSendStats } from "@/lib/conference-payment";
import { feeStatusLabel } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

export async function GET() {
  const actor = await getCurrentUser();
  try {
    requireAdmin(actor);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const rows = edition
    ? await prisma.conferenceApplication.findMany({
        where: { editionId: edition.id },
        orderBy: { createdAt: "desc" },
        include: {
          gatewayPayments: {
            where: { verified: true },
            orderBy: { createdAt: "asc" },
            select: { transId: true, refNo: true },
          },
        },
      })
    : [];
  const proformas = await proformaSendStats(rows.map((a) => a.id));

  const header = [
    "submittedAt",
    "status",
    "paymentStatus",
    "paymentAmountInr",
    "gstInr",
    "totalPayableInr",
    "paymentRef",
    "registrationId",
    "gatewayTransIds",
    "bankRefs",
    "paidAt",
    "paymentPageUrl",
    "proformaSentCount",
    "proformaLastSentAt",
    "name",
    "email",
    "phone",
    "institution",
    "professionalCategory",
    "phdYear",
    "seekingPostdoc",
    "participation",
    "paperTitle",
    "abstractFileName",
    "abstractPdfUrl",
    "sendCopy",
    "adminNotes",
  ];
  const bodyRows = rows.map((a) =>
    [
      a.createdAt.toISOString(),
      applicationStatusLabel(a.status),
      feeStatusLabel(a),
      (a.paymentAmountPaise / 100).toFixed(2),
      (gstPaise(a.paymentAmountPaise) / 100).toFixed(2),
      (withGstPaise(a.paymentAmountPaise) / 100).toFixed(2),
      a.paymentRef ?? "",
      a.payerId ?? "",
      a.gatewayPayments.map((p) => p.transId).join(" "),
      a.gatewayPayments.map((p) => p.refNo ?? "").join(" "),
      a.paidAt ? a.paidAt.toISOString() : "",
      conferencePaymentUrl(a.paymentToken),
      String(proformas.get(a.id)?.count ?? 0),
      proformas.get(a.id)?.lastSentAt?.toISOString() ?? "",
      a.name,
      a.email,
      a.phone,
      a.institution,
      professionalLabel(a.professionalCategory, a.professionalOther),
      phdYearLabel(a.phdYear),
      postdocLabel(a.seekingPostdoc),
      participationLabel(a.participationCategory, a.participationOther),
      a.paperTitle ?? "",
      a.abstractFileName ?? "",
      a.abstractStorageKey ? abstractPdfPublicUrl(a.abstractViewToken) : "",
      a.sendCopy ? "yes" : "no",
      a.adminNotes ?? "",
    ]
      .map(csvEscape)
      .join(","),
  );

  await writeAuditLog({
    actorId: actor!.id,
    action: "conference.export",
    entityType: "ConferenceApplication",
    after: { count: rows.length },
  });

  const body = [header.join(","), ...bodyRows].join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invent-conference-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}
