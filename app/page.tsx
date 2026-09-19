import { LandingScreen } from "@/components/landing/LandingScreen";
import type { HeroVariant } from "@/lib/landing";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME_LONG,
  pageMetadata,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = {
  ...pageMetadata({
    title: SITE_NAME_LONG,
    description: DEFAULT_DESCRIPTION,
    path: "/",
    absoluteTitle: true,
  }),
};

type SearchParams = Promise<{ hero?: string }>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const heroVariant: HeroVariant = params.hero === "plain" ? "plain" : "photo";
  return <LandingScreen heroVariant={heroVariant} />;
}
