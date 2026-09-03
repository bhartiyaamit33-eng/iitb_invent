import { prisma } from "@/lib/db";

export async function getCurrentEdition() {
  return prisma.edition.findFirst({
    where: { isCurrent: true },
    include: {
      stats: { orderBy: { sortOrder: "asc" } },
      faqs: { where: { isPublished: true }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getEditionBySlug(slug: string) {
  return prisma.edition.findUnique({
    where: { slug },
  });
}

/** Format times in Asia/Kolkata for display. */
export function formatIstTime(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatIstRange(startsAt: Date, endsAt: Date): string {
  return `${formatIstTime(startsAt)} – ${formatIstTime(endsAt)}`;
}
