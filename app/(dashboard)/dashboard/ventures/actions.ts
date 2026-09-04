"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { VentureKind } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { isS3Configured, uploadVentureLogo } from "@/lib/s3";
import {
  normalizeWebsiteUrl,
  slugifyVenture,
} from "@/lib/ventures";

function parseKind(raw: FormDataEntryValue | null): VentureKind | null {
  const v = String(raw ?? "");
  if (v === "STARTUP" || v === "PROJECT" || v === "IDEA") return v;
  return null;
}

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = slugifyVenture(base) || "venture";
  let n = 0;
  for (;;) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const existing = await prisma.venture.findFirst({
      where: {
        slug: candidate,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (!existing) return candidate;
    n += 1;
  }
}

export async function createVentureAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/dashboard/ventures")}`);
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const kind = parseKind(formData.get("kind"));
  if (!name || !kind) {
    redirect("/dashboard/ventures?error=missing");
  }

  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const slug = await uniqueSlug(name);

  await prisma.venture.create({
    data: {
      userId: user.id,
      editionId: edition?.id ?? null,
      kind,
      name,
      slug,
      tagline: String(formData.get("tagline") ?? "").trim().slice(0, 160) || null,
      description:
        String(formData.get("description") ?? "").trim().slice(0, 2000) || null,
      websiteUrl: normalizeWebsiteUrl(String(formData.get("websiteUrl") ?? "")),
      isPublished: formData.get("isPublished") === "on",
    },
  });

  revalidatePath("/ventures");
  revalidatePath("/dashboard/ventures");
  redirect("/dashboard/ventures");
}

export async function updateVentureAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/dashboard/ventures")}`);
  }

  const id = String(formData.get("id") ?? "");
  const existing = await prisma.venture.findFirst({
    where: { id, userId: user.id, deletedAt: null },
  });
  if (!existing) redirect("/dashboard/ventures?error=notfound");

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const kind = parseKind(formData.get("kind"));
  if (!name || !kind) redirect("/dashboard/ventures?error=missing");

  const slug =
    name !== existing.name
      ? await uniqueSlug(name, existing.id)
      : existing.slug;

  await prisma.venture.update({
    where: { id },
    data: {
      kind,
      name,
      slug,
      tagline: String(formData.get("tagline") ?? "").trim().slice(0, 160) || null,
      description:
        String(formData.get("description") ?? "").trim().slice(0, 2000) || null,
      websiteUrl: normalizeWebsiteUrl(String(formData.get("websiteUrl") ?? "")),
      isPublished: formData.get("isPublished") === "on",
    },
  });

  revalidatePath("/ventures");
  revalidatePath("/dashboard/ventures");
  redirect("/dashboard/ventures");
}

export async function deleteVentureAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/dashboard/ventures")}`);
  }
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.venture.findFirst({
    where: { id, userId: user.id, deletedAt: null },
  });
  if (!existing) redirect("/dashboard/ventures");

  await prisma.venture.update({
    where: { id },
    data: { deletedAt: new Date(), isPublished: false },
  });

  revalidatePath("/ventures");
  revalidatePath("/dashboard/ventures");
  redirect("/dashboard/ventures");
}

export async function uploadVentureLogoAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Sign in required" };
  if (!isS3Configured()) {
    return { ok: false as const, error: "Logo upload is not configured yet" };
  }

  const id = String(formData.get("id") ?? "");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, error: "Choose an image" };
  }

  const existing = await prisma.venture.findFirst({
    where: { id, userId: user.id, deletedAt: null },
  });
  if (!existing) return { ok: false as const, error: "Not found" };

  const bytes = Buffer.from(await file.arrayBuffer());
  try {
    const { url } = await uploadVentureLogo({
      ventureId: id,
      bytes,
      contentType: file.type || "image/jpeg",
    });
    await prisma.venture.update({
      where: { id },
      data: { logoUrl: url },
    });
    revalidatePath("/ventures");
    revalidatePath("/dashboard/ventures");
    return { ok: true as const, url };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Upload failed",
    };
  }
}

export type LinkPreview = {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
};

export async function fetchLinkPreviewAction(
  rawUrl: string,
): Promise<{ ok: true; preview: LinkPreview } | { ok: false; error: string }> {
  const url = normalizeWebsiteUrl(rawUrl);
  if (!url) return { ok: false, error: "Invalid URL" };

  try {
    const ctrl = AbortSignal.timeout(5000);
    const res = await fetch(url, {
      signal: ctrl,
      headers: {
        "User-Agent": "InvEntBot/1.0 (+https://iitbinvent.com)",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      return {
        ok: true,
        preview: {
          url,
          title: null,
          description: null,
          image: null,
          siteName: new URL(url).hostname,
        },
      };
    }
    const html = (await res.text()).slice(0, 200_000);
    const meta = (prop: string) => {
      const re = new RegExp(
        `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
        "i",
      );
      const re2 = new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
        "i",
      );
      return html.match(re)?.[1] ?? html.match(re2)?.[1] ?? null;
    };
    const titleTag =
      html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null;
    let image = meta("og:image") || meta("twitter:image");
    if (image && image.startsWith("/")) {
      image = new URL(image, url).toString();
    }
    return {
      ok: true,
      preview: {
        url,
        title: meta("og:title") || titleTag,
        description: meta("og:description") || meta("description"),
        image,
        siteName: meta("og:site_name") || new URL(url).hostname,
      },
    };
  } catch {
    return {
      ok: true,
      preview: {
        url,
        title: null,
        description: null,
        image: null,
        siteName: new URL(url).hostname,
      },
    };
  }
}
