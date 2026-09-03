"use server";

import { revalidatePath } from "next/cache";
import { PersonaType } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import {
  computeCompleteness,
  normaliseLinkedInUrl,
} from "@/lib/profile/completeness";
import { sendProfileConfirmation } from "@/lib/email/transactions";
import { writeAuditLog } from "@/lib/admin/audit";

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
  const linkedinRaw = String(formData.get("linkedinUrl") ?? "");
  const linkedinUrl = linkedinRaw
    ? normaliseLinkedInUrl(linkedinRaw)
    : null;
  if (linkedinRaw && !linkedinUrl) {
    throw new Error("Invalid LinkedIn URL");
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

  void sendProfileConfirmation({
    to: user.email,
    name,
    isFirstSave: false,
    userId: user.id,
  }).catch(() => undefined);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
}
