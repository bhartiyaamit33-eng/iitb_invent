import { JsonLd } from "@/components/JsonLd";
import { landingFontClassName } from "@/components/landing/fonts";
import { LandingPage } from "@/components/landing/LandingPage";
import { getCurrentUser } from "@/lib/auth/session";
import { formatIstRange } from "@/lib/editions";
import {
  FALLBACK_FAQS,
  FALLBACK_STATS,
  KEY_DATES,
  markTimeline,
  type HeroVariant,
  type LandingFaq,
  type LandingStat,
  type LiveStripData,
} from "@/lib/landing";
import { prisma } from "@/lib/db";
import { getHappeningNow, getUpNext, isLiveStatus } from "@/lib/live";
import { CANONICAL_FAQS } from "@/lib/seo-content";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME_LONG,
  eventJsonLd,
  faqPageJsonLd,
  graphJsonLd,
  noIndex,
  organizationJsonLd,
  pageMetadata,
  websiteJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = {
  ...pageMetadata({
    title: SITE_NAME_LONG,
    description: DEFAULT_DESCRIPTION,
    path: "/test123",
    absoluteTitle: true,
  }),
  ...noIndex,
};

type SearchParams = Promise<{ hero?: string }>;

export default async function TestLandingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const heroVariant: HeroVariant = params.hero === "plain" ? "plain" : "photo";
  const user = await getCurrentUser().catch(() => null);
  const signedInName = user
    ? user.name.trim().split(/\s+/)[0] || user.name || "Account"
    : null;

  let live: LiveStripData | null = null;
  let faqs: LandingFaq[] = mergeFaqs(FALLBACK_FAQS);
  let stats: LandingStat[] = FALLBACK_STATS;

  try {
    const edition = await prisma.edition.findFirst({
      where: { isCurrent: true },
      include: {
        stats: { orderBy: { sortOrder: "asc" } },
        faqs: {
          where: { isPublished: true, deletedAt: null },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (edition) {
      if (edition.faqs.length > 0) {
        faqs = mergeFaqs(
          edition.faqs.map((f) => ({
            question: f.question,
            answer: f.answer,
          })),
        );
      }
      if (edition.stats.length > 0) {
        stats = edition.stats.map((s) => ({
          label: s.label,
          value: s.value,
        }));
      }
      if (isLiveStatus(edition.status)) {
        const now = new Date();
        const clock = now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        });
        const [happening, upNext] = await Promise.all([
          getHappeningNow(edition.id, now),
          getUpNext(edition.id, now, 3),
        ]);
        live = {
          clock,
          happening: happening.map((s) => ({ title: s.title, room: s.room })),
          upNext: upNext.map((s) => ({
            title: s.title,
            when: formatIstRange(s.startsAt, s.endsAt),
          })),
        };
      }
    }
  } catch {
    // Public teaser must render even if the database is down.
  }

  return (
    <div className={landingFontClassName()}>
      <JsonLd
        data={graphJsonLd(
          websiteJsonLd(),
          organizationJsonLd(),
          eventJsonLd(),
          faqPageJsonLd(),
        )}
      />
      <LandingPage
        heroVariant={heroVariant}
        signedInName={signedInName}
        live={live}
        faqs={faqs}
        stats={stats}
        timeline={markTimeline(KEY_DATES)}
      />
    </div>
  );
}

function mergeFaqs(source: LandingFaq[]): LandingFaq[] {
  const seen = new Set<string>();
  const out: LandingFaq[] = [];
  for (const item of [...CANONICAL_FAQS.slice(0, 5), ...source, ...FALLBACK_FAQS]) {
    const key = item.question.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
