import { LandingScreen } from "@/components/landing/LandingScreen";
import {
  DEFAULT_DESCRIPTION,
  HOME_TITLE,
  noIndex,
  pageMetadata,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = {
  ...pageMetadata({
    title: HOME_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: "/test123",
    absoluteTitle: true,
  }),
  ...noIndex,
};

export default async function TestLandingPage() {
  return <LandingScreen />;
}
