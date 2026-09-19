import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
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
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
          IITB INV.ENT · DSSE · IIT Bombay
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
          Frequently asked questions
        </h1>
        <p className="mt-4 text-[17px] leading-7 text-ink-soft">
          Direct answers for people asking what IITB INV.ENT is, when it is, and how
          to register at IIT Bombay. The same facts appear on{" "}
          <Link href="/about">About</Link>.
        </p>
        <dl className="mt-10 divide-y divide-line border-y border-line">
          {CANONICAL_FAQS.map((item) => (
            <div key={item.question} className="py-6">
              <dt>
                <h2 className="text-lg font-semibold text-ink">
                  {item.question}
                </h2>
              </dt>
              <dd className="mt-2 text-[17px] leading-7 text-ink-soft">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </main>
    </PublicChrome>
  );
}
