import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/roles";
import { parsePaymentStatus } from "@/lib/conference";
import { setApplicationPayment } from "@/lib/conference-review";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getCurrentUser();
  try {
    requireAdmin(actor);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as {
    paymentStatus?: string;
    paymentRef?: string;
  } | null;
  const paymentStatus = parsePaymentStatus(String(body?.paymentStatus ?? ""));
  if (!paymentStatus) {
    return NextResponse.json({ error: "Choose a payment status." }, { status: 400 });
  }

  try {
    await setApplicationPayment({
      actorId: actor!.id,
      id,
      paymentStatus,
      paymentRef: body?.paymentRef ?? null,
    });
    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[application payment]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not update payment." },
      { status: 400 },
    );
  }
}
