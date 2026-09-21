import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { SiteShell } from "@/components/site/SiteShell";
import { CANONICAL_FAQS } from "@/lib/seo-content";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";
import { EVENT_DATES, SUPPORT_EMAIL } from "@/lib/site-content";

export const metadata = pageMetadata({
  title: "IITB INV.ENT FAQ",
  description:
    "Answers to what IITB INV.ENT is, when the conference is, and how to register at IIT Bombay.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <SiteShell crumbs={[{ href: "/faq", label: "FAQ" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          faqPageJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        )}
      />

      <PageHero
        kicker="IITB INV.ENT · DSSE · IIT Bombay"
        title="Frequently asked questions"
        lede={
          <>
            Direct answers for people asking what IITB INV.ENT is, when it is, and how to
            register at IIT Bombay. The same facts appear on{" "}
            <Link href="/about" style={{ color: "var(--blue)" }}>
              About
            </Link>
            .
          </>
        }
        meta={[`Conference · ${EVENT_DATES}`, "Venue · IIT Bombay"]}
      />

      <section className="site-section is-tight">
        <div className="site-shell">
          <dl className="faq-list" data-testid="faq-list">
            {CANONICAL_FAQS.map((item) => (
              <div key={item.question}>
                <dt>
                  <h2>{item.question}</h2>
                </dt>
                <dd>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="site-section is-blue" aria-labelledby="still-heading">
        <div className="site-shell" style={{ position: "relative" }}>
          <h2 id="still-heading">Still stuck?</h2>
          <p className="lead">
            One inbox, read by humans. Submission and accommodation questions go to the
            conference desk on the contact page.
          </p>
          <div className="cta-row">
            <a className="site-btn site-btn-white" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL} →
            </a>
            <Link className="site-btn site-btn-white" href="/contact">
              Contact
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
