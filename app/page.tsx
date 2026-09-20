import { LandingScreen } from "@/components/landing/LandingScreen";
import { DEFAULT_DESCRIPTION, HOME_TITLE, pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = {
  ...pageMetadata({
    title: HOME_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: "/",
    absoluteTitle: true,
  }),
};

export default async function HomePage() {
  return <LandingScreen />;
}
