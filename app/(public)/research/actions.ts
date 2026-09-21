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
    redirect("/research?error=missing#submit");
  }
  if (confirm !== "DELETE") {
    redirect("/research?error=confirm#submit");
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
    redirect("/research?error=not_found#submit");
  }

  const result = await deleteConferenceApplication({
    actorId: user.id,
    id: application.id,
  });
  if (!result.ok) {
    redirect(`/research?error=${encodeURIComponent(result.error)}#submit`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath("/dashboard");
  revalidatePath("/research");
  redirect("/research?deleted=1#submit");
}
