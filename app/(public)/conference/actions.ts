"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { deleteConferenceApplication } from "@/lib/conference-delete";
import { prisma } from "@/lib/db";

export async function deleteMyApplicationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/conference#submit")}`);
  }

  const applicationId = String(formData.get("applicationId") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!applicationId) {
    redirect("/conference?error=missing#submit");
  }
  if (confirm !== "DELETE") {
    redirect("/conference?error=confirm#submit");
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
    redirect("/conference?error=not_found#submit");
  }

  const result = await deleteConferenceApplication({
    actorId: user.id,
    id: application.id,
  });
  if (!result.ok) {
    redirect(`/conference?error=${encodeURIComponent(result.error)}#submit`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath("/dashboard");
  revalidatePath("/conference");
  redirect("/conference?deleted=1#submit");
}
