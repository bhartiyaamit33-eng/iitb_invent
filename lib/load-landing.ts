import { getCurrentUser } from "@/lib/auth/session";
import { formatIstRange } from "@/lib/editions";
import { prisma } from "@/lib/db";
import {
  FALLBACK_FAQS,
  FALLBACK_STATS,
  KEY_DATES,
  markTimeline,
  type LandingFaq,
  type LandingStat,
  type LiveStripData,
  type TimelineItem,
} from "@/lib/landing";
import { getHappeningNow, getUpNext, isLiveStatus } from "@/lib/live";
import { CANONICAL_FAQS } from "@/lib/seo-content";

export type LandingScreenData = {
  signedInName: string | null;
  live: LiveStripData | null;
  faqs: LandingFaq[];
  stats: LandingStat[];
  timeline: TimelineItem[];
};

export async function loadLandingData(): Promise<LandingScreenData> {
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

  return {
    signedInName,
    live,
    faqs,
    stats,
    timeline: markTimeline(KEY_DATES),
  };
}

function faqKey(question: string) {
  return question
    .toLowerCase()
    .replace(/inv\.ent/g, "invent")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function shouldDropFaq(item: LandingFaq) {
  const blob = `${item.question} ${item.answer}`.toLowerCase();
  if (blob.includes("day zero")) return true;
  if (blob.includes("foundation-day") || blob.includes("foundation day")) return true;
  if (blob.includes("annual day")) return true;
  if (/\biitbinvent\b|\biitb_invent\b/i.test(item.question)) return true;
  return false;
}

function mergeFaqs(source: LandingFaq[]): LandingFaq[] {
  const seen = new Set<string>();
  const out: LandingFaq[] = [];
  for (const item of [...CANONICAL_FAQS.slice(0, 5), ...source, ...FALLBACK_FAQS]) {
    const key = faqKey(item.question);
    if (seen.has(key) || shouldDropFaq(item)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
