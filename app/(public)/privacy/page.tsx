import { Prose } from "@/components/Prose";
import { PublicChrome } from "@/components/PublicChrome";
import { getPublishedPage } from "@/lib/pages";
import { PRIVACY_FALLBACK } from "@/lib/seo-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy",
  description:
    "How IITB INV.ENT (iitbinvent.com) handles attendee directory opt-in, email visibility, and data requests at DSSE, IIT Bombay.",
  path: "/privacy",
});

export default async function PrivacyPage() {
  const cms = await getPublishedPage("privacy");
  return (
    <PublicChrome crumbs={[{ href: "/privacy", label: "Privacy" }]}>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl tracking-wide text-teal-deep">
          {cms?.title || "Privacy"}
        </h1>
        <div className="mt-8">
          <Prose text={cms?.body?.trim() || PRIVACY_FALLBACK} />
        </div>
      </main>
    </PublicChrome>
  );
}
