import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
import { PageHero } from "@/components/site/PageHero";
import { CANONICAL_FAQS } from "@/lib/seo-content";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "IITB INV.ENT FAQ",
  description:
    "Answers to what IITB INV.ENT is, when the conference is, and how to register at IIT Bombay.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <PublicChrome crumbs={[{ href: "/faq", label: "FAQ" }]}>
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
      <main id="main">
        <PageHero
          kicker="IITB INV.ENT · DSSE · IIT Bombay"
          title="Frequently asked questions"
          lede={
            <>
              Direct answers for people asking what IITB INV.ENT is, when it is,
              and how to register at IIT Bombay. The same facts appear on{" "}
              <Link href="/about">About</Link>.
            </>
          }
        />
        <div className="site-shell editorial">
          <dl className="faq-list">
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
      </main>
    </PublicChrome>
  );
}
