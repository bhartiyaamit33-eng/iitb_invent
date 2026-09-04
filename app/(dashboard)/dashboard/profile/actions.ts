"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PersonaType } from "@prisma/client";
import { signOut } from "@/auth";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import {
  computeCompleteness,
  normaliseLinkedInUrl,
} from "@/lib/profile/completeness";
import { writeAuditLog } from "@/lib/admin/audit";
import { isS3Configured, uploadAttendeePhoto } from "@/lib/s3";
import { deleteUserAccount } from "@/lib/users/delete";

const PERSONAS = new Set(Object.values(PersonaType));

function csvToList(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export async function saveProfileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const name = String(formData.get("name") ?? "").trim() || user.name;
  const personaRaw = String(formData.get("personaType") ?? "");
  const personaType =
    personaRaw && PERSONAS.has(personaRaw as PersonaType)
      ? (personaRaw as PersonaType)
      : null;
  const headline = String(formData.get("headline") ?? "").trim() || null;
  const organisation = String(formData.get("organisation") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 500) || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim().slice(0, 32) || null;
  const linkedinRaw = String(formData.get("linkedinUrl") ?? "");
  const linkedinUrl = linkedinRaw
    ? normaliseLinkedInUrl(linkedinRaw)
    : null;
  if (linkedinRaw.trim() && !linkedinUrl) {
    redirect(
      `/dashboard/profile?error=linkedin&pct=${encodeURIComponent(String(0))}`,
    );
  }
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim() || null;
  const twitterUrl = String(formData.get("twitterUrl") ?? "").trim() || null;
  const githubUrl = String(formData.get("githubUrl") ?? "").trim() || null;
  const interests = csvToList(String(formData.get("interests") ?? ""));
  const lookingFor = csvToList(String(formData.get("lookingFor") ?? ""));
  const directoryOptIn = formData.get("directoryOptIn") === "on";
  const showEmail = formData.get("showEmail") === "on";

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { image: true },
  });

  const completeness = computeCompleteness({
    personaType,
    headline,
    organisation,
    linkedinUrl,
    image: dbUser?.image,
    bio,
    interests,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { name },
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      personaType,
      headline,
      organisation,
      bio,
      city,
      phone,
      linkedinUrl,
      websiteUrl,
      twitterUrl,
      githubUrl,
      interests,
      lookingFor,
      directoryOptIn,
      showEmail,
      completeness,
    },
    update: {
      personaType,
      headline,
      organisation,
      bio,
      city,
      phone,
      linkedinUrl,
      websiteUrl,
      twitterUrl,
      githubUrl,
      interests,
      lookingFor,
      directoryOptIn,
      showEmail,
      completeness,
    },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "profile.update",
    entityType: "Profile",
    entityId: user.id,
    after: { completeness, directoryOptIn },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath("/2027/attendees");
  redirect(`/dashboard/profile?saved=1&pct=${completeness}`);
}

export async function deleteMyAccountAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const confirm = String(formData.get("confirm") ?? "");
  if (confirm !== "DELETE") {
    redirect("/dashboard/profile?error=delete_confirm");
  }

  const result = await deleteUserAccount(user.id, { actorId: user.id });
  if (!result.ok) {
    redirect(
      `/dashboard/profile?error=${encodeURIComponent(result.error)}`,
    );
  }

  await writeAuditLog({
    actorId: null,
    action: "user.self_delete",
    entityType: "User",
    entityId: user.id,
    after: { email: user.email },
  });

  await signOut({ redirectTo: "/" });
}

export async function uploadProfilePhotoAction(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required" };
  if (!isS3Configured()) {
    return { ok: false, error: "Photo upload is not configured yet" };
  }
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Choose an image file" };
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadAttendeePhoto({
      userId: user.id,
      bytes,
      contentType: file.type || "image/jpeg",
    });

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    const completeness = computeCompleteness({
      personaType: profile?.personaType,
      headline: profile?.headline,
      organisation: profile?.organisation,
      linkedinUrl: profile?.linkedinUrl,
      image: url,
      bio: profile?.bio,
      interests: profile?.interests,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { image: url },
    });
    if (profile) {
      await prisma.profile.update({
        where: { userId: user.id },
        data: { completeness },
      });
    }

    await writeAuditLog({
      actorId: user.id,
      action: "profile.photo_upload",
      entityType: "User",
      entityId: user.id,
      after: { image: url, completeness },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/2027/attendees");
    return { ok: true, url };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Upload failed",
    };
  }
}
