"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { deleteConferenceApplication } from "@/lib/conference-delete";
import { prisma } from "@/lib/db";
import { LOGIN_TO_SUBMIT_HREF } from "@/lib/landing";

export async function deleteMyApplicationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(LOGIN_TO_SUBMIT_HREF);
  }

  const applicationId = String(formData.get("applicationId") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!applicationId) {
    redirect("/register?error=missing");
  }
  if (confirm !== "DELETE") {
    redirect("/register?error=confirm");
  }

  const email = user.email.trim().toLowerCase();
  const application = await prisma.conferenceApplication.findFirst({
    where: {
      id: applicationId,
      edition: { isCurrent: true },
      OR: [{ userId: user.id }, { email }],
    },
    select: { id: true },
  });
  if (!application) {
    redirect("/register?error=not_found");
  }

  const result = await deleteConferenceApplication({
    actorId: user.id,
    id: application.id,
  });
  if (!result.ok) {
    redirect(`/register?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath("/dashboard");
  revalidatePath("/research");
  revalidatePath("/register");
  redirect("/register?deleted=1");
}
