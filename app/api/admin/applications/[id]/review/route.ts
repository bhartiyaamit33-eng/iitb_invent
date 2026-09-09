import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/roles";
import { parseApplicationStatus } from "@/lib/conference";
import { reviewConferenceApplication } from "@/lib/conference-review";
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
    status?: string;
    message?: string;
    sendEmail?: boolean;
    adminNotes?: string | null;
  } | null;

  const status = parseApplicationStatus(String(body?.status ?? ""));
  if (!status) {
    return NextResponse.json({ error: "Choose a status." }, { status: 400 });
  }

  try {
    const result = await reviewConferenceApplication({
      actorId: actor!.id,
      id,
      status,
      message: String(body?.message ?? ""),
      sendEmail: Boolean(body?.sendEmail),
      adminNotes:
        body?.adminNotes === undefined
          ? undefined
          : String(body.adminNotes ?? "").trim() || null,
    });
    revalidatePath("/admin");
    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${id}`);
    revalidatePath("/dashboard");
    revalidatePath("/conference");
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[application review]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not update status.",
      },
      { status: 400 },
    );
  }
}
