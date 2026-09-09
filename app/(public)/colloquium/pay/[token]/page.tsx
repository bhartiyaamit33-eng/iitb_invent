import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { applicationStatusLabel } from "@/lib/colloquium";
import { colloquiumUpiId, colloquiumUpiName } from "@/lib/colloquium-server";
import { ColloquiumPayPanel } from "../ColloquiumPayPanel";

export const dynamic = "force-dynamic";

export default async function ColloquiumPayPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const application = await prisma.colloquiumApplication.findUnique({
    where: { paymentToken: token },
    include: { edition: { select: { name: true } } },
  });
  if (!application) notFound();

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        {application.edition.name} · Research Colloquium
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Registration payment
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Application status: {applicationStatusLabel(application.status)}
      </p>
      <ColloquiumPayPanel
        token={application.paymentToken}
        name={application.name}
        amountPaise={application.paymentAmountPaise}
        paymentStatus={application.paymentStatus}
        upiId={colloquiumUpiId()}
        upiName={colloquiumUpiName()}
        paymentRef={application.paymentRef}
      />
      <p className="mt-6 text-sm text-mute">
        Questions:{" "}
        <a href="mailto:support@iitbinvent.com">support@iitbinvent.com</a>
        {" · "}
        <Link href="/colloquium" className="underline-offset-2 hover:underline">
          Call for applications
        </Link>
      </p>
    </main>
  );
}
