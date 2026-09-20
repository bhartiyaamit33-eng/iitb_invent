import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
import { PageHero } from "@/components/site/PageHero";
import { CFP_STAY } from "@/lib/conference-cfp";
import {
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Accommodation",
  description:
    "Shared, limited accommodation at the IIT Bombay guest house for IITB INV.ENT 2027. First-come first-served. Costs are borne by participants.",
  path: "/accommodation",
});

export default function AccommodationPage() {
  return (
    <PublicChrome crumbs={[{ href: "/accommodation", label: "Accommodation" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Accommodation", path: "/accommodation" },
          ]),
        )}
      />
      <main id="main">
        <PageHero
          kicker="Stay"
          title="Accommodation"
          lede={CFP_STAY}
        />
        <div className="site-shell editorial">
          <p>
            For campus directions see <Link href="/travel">Venue / travel</Link>.
            Questions:{" "}
            <Link href="/contact">contact</Link>.
          </p>
        </div>
      </main>
    </PublicChrome>
  );
}
