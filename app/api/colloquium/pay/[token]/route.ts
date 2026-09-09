import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const body = (await req.json().catch(() => null)) as {
    paymentRef?: string;
  } | null;
  const paymentRef = String(body?.paymentRef ?? "").trim();
  if (paymentRef.length < 4) {
    return NextResponse.json(
      { error: "Enter the UPI / bank reference (at least 4 characters)." },
      { status: 400 },
    );
  }

  const application = await prisma.colloquiumApplication.findUnique({
    where: { paymentToken: token },
  });
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (application.paymentStatus === "PAID" || application.paymentStatus === "WAIVED") {
    return NextResponse.json({ ok: true, paymentStatus: application.paymentStatus });
  }
  if (application.paymentStatus === "NOT_REQUIRED") {
    return NextResponse.json(
      { error: "No payment is due on this application." },
      { status: 400 },
    );
  }

  await prisma.colloquiumApplication.update({
    where: { id: application.id },
    data: {
      paymentStatus: "REPORTED",
      paymentRef,
    },
  });
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${application.id}`);
  return NextResponse.json({ ok: true, paymentStatus: "REPORTED" });
}
