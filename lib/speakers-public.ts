import { prisma } from "@/lib/db";

export type PublicSpeaker = {
  id: string;
  name: string;
  title: string | null;
  organisation: string | null;
  photoUrl: string | null;
  isKeynote: boolean;
};

export async function getPublishedSpeakers(): Promise<PublicSpeaker[]> {
  try {
    const edition = await prisma.edition.findFirst({
      where: { isCurrent: true },
    });
    if (!edition) return [];
    return prisma.speaker.findMany({
      where: {
        editionId: edition.id,
        isPublished: true,
        deletedAt: null,
      },
      orderBy: [{ isKeynote: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        title: true,
        organisation: true,
        photoUrl: true,
        isKeynote: true,
      },
    });
  } catch {
    return [];
  }
}
