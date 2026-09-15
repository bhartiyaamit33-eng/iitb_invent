import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { INDEXABLE_PATHS, absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = INDEXABLE_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/about" ? 0.9 : 0.7,
  }));

  try {
    const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
    if (edition) {
      const sessions = await prisma.session_.findMany({
        where: {
          editionId: edition.id,
          isPublished: true,
          deletedAt: null,
        },
        select: { slug: true, startsAt: true },
      });
      for (const session of sessions) {
        entries.push({
          url: absoluteUrl(`/programme/${session.slug}`),
          lastModified: session.startsAt,
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }
    }
  } catch {
    // Public sitemap must still ship if the database is down.
  }

  return entries;
}
