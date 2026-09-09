import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isPaidStatus } from "@/lib/payments/pricing";
import { buildInvoicePdf, invoiceFilename } from "@/lib/payments/invoice";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const payment = await prisma.payment.findUnique({
    where: { payToken: token },
    include: {
      user: { select: { id: true, name: true, email: true } },
      submission: {
        select: { title: true, kind: true, organisation: true, authors: true },
      },
      edition: { select: { name: true, year: true } },
    },
  });

  if (!payment || !isPaidStatus(payment.status) || !payment.invoiceNumber) {
    return NextResponse.json({ error: "Invoice not available" }, { status: 404 });
  }

  const pdf = await buildInvoicePdf(payment);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoiceFilename(payment)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
