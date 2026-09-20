import { JsonLd } from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
import { PageHero } from "@/components/site/PageHero";
import { CONTACT_EMAIL, CONTACT_PAGE } from "@/lib/seo-content";
import { VENUE } from "@/lib/seo";
import {
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Write to support@iitbinvent.com. One inbox for press, partners, speakers, volunteers, and campus access at IITB INV.ENT.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <PublicChrome crumbs={[{ href: "/contact", label: "Contact" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        )}
      />
      <main id="main">
        <PageHero
          kicker={CONTACT_PAGE.kicker}
          title={CONTACT_PAGE.title}
          lede={CONTACT_PAGE.body}
        />
        <div className="site-shell editorial">
          <p>
            <a
              className="contact-mail"
              href={`mailto:${CONTACT_EMAIL}`}
              data-testid="contact-email"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <h2>Address</h2>
          <p>{VENUE.formatted}.</p>
        </div>
      </main>
    </PublicChrome>
  );
}
