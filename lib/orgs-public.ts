import { prisma } from "@/lib/db";

export type PublicOrg = {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  kind: "sponsor" | "partner";
};

export type PublishedOrgs = {
  sponsors: PublicOrg[];
  partners: PublicOrg[];
};

function isPublicOrg(row: {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  kind: string;
}): PublicOrg | null {
  const name = row.name.trim();
  const logoUrl = row.logoUrl.trim();
  if (!name || !logoUrl) return null;
  return {
    id: row.id,
    name,
    logoUrl,
    websiteUrl: row.websiteUrl?.trim() || null,
    kind: row.kind === "partner" ? "partner" : "sponsor",
  };
}

export async function getPublishedOrgs(): Promise<PublishedOrgs> {
  try {
    const edition = await prisma.edition.findFirst({
      where: { isCurrent: true },
    });
    if (!edition) return { sponsors: [], partners: [] };

    const rows = await prisma.sponsor.findMany({
      where: {
        editionId: edition.id,
        deletedAt: null,
        isPublished: true,
        logoUrl: { not: "" },
        name: { not: "" },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        logoUrl: true,
        websiteUrl: true,
        kind: true,
      },
    });

    const sponsors: PublicOrg[] = [];
    const partners: PublicOrg[] = [];
    for (const row of rows) {
      const org = isPublicOrg(row);
      if (!org) continue;
      if (org.kind === "partner") partners.push(org);
      else sponsors.push(org);
    }
    return { sponsors, partners };
  } catch {
    return { sponsors: [], partners: [] };
  }
}
