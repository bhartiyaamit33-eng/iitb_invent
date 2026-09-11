import { LandingScreen } from "@/components/landing/LandingScreen";
import type { HeroVariant } from "@/lib/landing";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME_LONG,
  noIndex,
  pageMetadata,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = {
  ...pageMetadata({
    title: SITE_NAME_LONG,
    description: DEFAULT_DESCRIPTION,
    path: "/test124",
    absoluteTitle: true,
  }),
  ...noIndex,
};

type SearchParams = Promise<{ hero?: string }>;

export default async function TestLandingLightPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const heroVariant: HeroVariant = params.hero === "plain" ? "plain" : "photo";
  return <LandingScreen theme="light" heroVariant={heroVariant} />;
}
