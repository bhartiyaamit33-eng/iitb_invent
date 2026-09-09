import { prisma } from "@/lib/db";

export async function getPublishedPage(slug: string) {
  try {
    const edition = await prisma.edition.findFirst({
      where: { isCurrent: true },
    });
    if (!edition) return null;
    return prisma.page.findFirst({
      where: {
        editionId: edition.id,
        slug,
        isPublished: true,
        deletedAt: null,
      },
    });
  } catch {
    return null;
  }
}
