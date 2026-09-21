import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
import { PageHero } from "@/components/site/PageHero";
import { WORKSHOP_ITEMS, registerHrefFor } from "@/lib/site";
import {
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Workshop",
  description:
    "Pre-conference workshops at IITB INV.ENT 2027, including AI for Incubators and entrepreneurship education sessions at IIT Bombay.",
  path: "/workshops",
});

export default function WorkshopsPage() {
  return (
    <PublicChrome crumbs={[{ href: "/workshops", label: "Workshop" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Workshop", path: "/workshops" },
          ]),
        )}
      />
      <main id="main">
        <PageHero
          kicker="30 January 2027"
          title="Workshop"
          lede="Hands-on workshops on entrepreneurship education and related themes, on the day before the conference."
        />
        <div className="site-shell editorial">
          <p>
            30 January is the pre-conference day. You do not need to be
            presenting to attend.
          </p>
          <ul className="theme-list">
            {WORKSHOP_ITEMS.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <p className="lead">{item.body}</p>
              </li>
            ))}
          </ul>
          <p>
            The detailed workshop agenda will be published closer to the
            conference. See the <Link href="/programme">programme</Link> for
            the two-day outline.
          </p>
          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <Link className="site-btn" href={registerHrefFor(false)}>
              Register →
            </Link>
          </div>
        </div>
      </main>
    </PublicChrome>
  );
}
