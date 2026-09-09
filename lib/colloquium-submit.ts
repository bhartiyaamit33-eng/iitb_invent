import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { saveAbstractFile } from "@/lib/abstract-storage";
import {
  isPdfBuffer,
  isValidEmail,
  isValidPhone,
  MAX_ABSTRACT_BYTES,
  needsAbstract,
  needsPhdYear,
  parseParticipation,
  parsePhdYear,
  parsePostdoc,
  parseProfessional,
  participationLabel,
  phdYearLabel,
  postdocLabel,
  professionalLabel,
} from "@/lib/colloquium";
import { newColloquiumToken } from "@/lib/colloquium-server";
import {
  sendColloquiumApplicationCopy,
  sendColloquiumOrganiserNotify,
} from "@/lib/email/transactions";
import { getEmailFromAddress } from "@/lib/email/ses";
import { siteOrigin } from "@/lib/ticket";

export type ColloquiumSubmitResult =
  | { ok: true; paymentToken: string }
  | { error: string };

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    !!value &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    typeof (value as File).arrayBuffer === "function" &&
    typeof (value as File).size === "number" &&
    typeof (value as File).name === "string"
  );
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Validate and persist a colloquium application.
 * Always resolves with a result — never redirects — so a reverse proxy
 * cannot leave the browser waiting on a Server Action forever.
 */
export async function processColloquiumApplication(
  formData: FormData,
): Promise<ColloquiumSubmitResult> {
  const name = str(formData, "name");
  const email = str(formData, "email").toLowerCase();
  const phone = str(formData, "phone");
  const institution = str(formData, "institution");
  const professional = parseProfessional(str(formData, "professionalCategory"));
  const professionalOther = str(formData, "professionalOther");
  const phdYear = needsPhdYear(professional ?? "OTHER")
    ? parsePhdYear(str(formData, "phdYear"))
    : null;
  const seekingPostdoc = parsePostdoc(str(formData, "seekingPostdoc"));
  const participation = parseParticipation(
    str(formData, "participationCategory"),
  );
  const participationOther = str(formData, "participationOther");
  const paperTitle = str(formData, "paperTitle");
  const sendCopy = formData.get("sendCopy") === "on";
  const file = formData.get("abstract");

  if (!name || name.length < 2) {
    return { error: "Please enter your name." };
  }
  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (!isValidPhone(phone)) {
    return { error: "Please enter a valid phone number." };
  }
  if (!institution) {
    return { error: "Please enter your institution name." };
  }
  if (!professional) {
    return { error: "Please choose your professional category." };
  }
  if (professional === "OTHER" && !professionalOther) {
    return { error: "Please describe your professional category." };
  }
  if (needsPhdYear(professional) && !phdYear) {
    return { error: "Please choose your current PhD year." };
  }
  if (!participation) {
    return { error: "Please choose a participation category." };
  }
  if (participation === "OTHER" && !participationOther) {
    return { error: "Please describe your participation category." };
  }

  const abstractRequired = needsAbstract(participation);
  if (abstractRequired && !paperTitle) {
    return {
      error: "Please enter the proposed title of the paper or poster.",
    };
  }

  const edition = await prisma.edition.findFirst({
    where: { isCurrent: true },
  });
  if (!edition) {
    return { error: "The current edition is not configured yet." };
  }

  let abstractBytes: Buffer | null = null;
  let abstractFileName: string | null = null;
  if (isUploadedFile(file) && file.size > 0) {
    if (file.size > MAX_ABSTRACT_BYTES) {
      return { error: "The extended abstract must be a PDF under 10 MB." };
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!isPdfBuffer(bytes)) {
      return { error: "Please upload a PDF file for the extended abstract." };
    }
    abstractBytes = bytes;
    abstractFileName =
      file.name.replace(/[/\\]/g, "").slice(0, 180) || "abstract.pdf";
  } else if (abstractRequired) {
    return {
      error: "Please upload an extended abstract as a PDF (max 10 MB).",
    };
  }

  const sessionUser = await getCurrentUser();
  const linkedUser =
    sessionUser && sessionUser.email === email
      ? sessionUser
      : await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });

  const application = await prisma.colloquiumApplication.upsert({
    where: { editionId_email: { editionId: edition.id, email } },
    create: {
      editionId: edition.id,
      userId: linkedUser?.id ?? null,
      email,
      name,
      phone,
      institution,
      professionalCategory: professional,
      professionalOther: professional === "OTHER" ? professionalOther : null,
      phdYear,
      seekingPostdoc,
      participationCategory: participation,
      participationOther: participation === "OTHER" ? participationOther : null,
      paperTitle: paperTitle || null,
      sendCopy,
      abstractViewToken: newColloquiumToken(),
      paymentToken: newColloquiumToken(),
    },
    update: {
      userId: linkedUser?.id ?? null,
      name,
      phone,
      institution,
      professionalCategory: professional,
      professionalOther: professional === "OTHER" ? professionalOther : null,
      phdYear,
      seekingPostdoc,
      participationCategory: participation,
      participationOther: participation === "OTHER" ? participationOther : null,
      paperTitle: paperTitle || null,
      sendCopy,
    },
  });

  if (abstractBytes && abstractFileName) {
    try {
      const stored = await withTimeout(
        saveAbstractFile({
          applicationId: application.id,
          bytes: abstractBytes,
          fileName: abstractFileName,
        }),
        20_000,
        "PDF upload timed out. Please try again.",
      );
      await prisma.colloquiumApplication.update({
        where: { id: application.id },
        data: {
          abstractFileName,
          abstractStorage: stored.storage,
          abstractStorageKey: stored.key,
        },
      });
    } catch (err) {
      console.error("[colloquium] abstract upload", err);
      const message =
        err instanceof Error && err.message.includes("timed out")
          ? err.message
          : "Could not store the PDF. Please try again.";
      return { error: message };
    }
  }

  const saved = await prisma.colloquiumApplication.findUniqueOrThrow({
    where: { id: application.id },
  });

  const eventName = `${edition.name} · Research Colloquium`;
  const payload = {
    name: saved.name,
    email: application.email,
    phone: application.phone,
    institution: application.institution,
    professional: professionalLabel(
      saved.professionalCategory,
      saved.professionalOther,
    ),
    phdYear: phdYearLabel(saved.phdYear),
    seekingPostdoc: postdocLabel(saved.seekingPostdoc),
    participation: participationLabel(
      saved.participationCategory,
      saved.participationOther,
    ),
    paperTitle: saved.paperTitle ?? "",
    abstractFileName: saved.abstractFileName ?? "",
    eventName,
  };

  if (sendCopy) {
    void sendColloquiumApplicationCopy({
      ...payload,
      to: saved.email,
      userId: saved.userId,
      applicationId: saved.id,
    }).catch(() => undefined);
  }

  void sendColloquiumOrganiserNotify({
    to: getEmailFromAddress(),
    name: saved.name,
    email: saved.email,
    institution: saved.institution,
    participation: payload.participation,
    paperTitle: saved.paperTitle ?? "",
    eventName,
    adminUrl: `${siteOrigin()}/admin/applications/${saved.id}`,
    applicationId: saved.id,
  }).catch(() => undefined);

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath("/dashboard");
  revalidatePath("/colloquium");
  return { ok: true, paymentToken: saved.paymentToken };
}
