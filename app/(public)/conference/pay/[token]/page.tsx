import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { applicationStatusLabel } from "@/lib/conference";
import { isConferenceGatewayReady } from "@/lib/conference-onlinepay";
import { applicationPaymentVisible } from "@/lib/conference-access";
import { isOnlinePayTest } from "@/lib/onlinepay";
import { ConferencePayPanel } from "../ConferencePayPanel";

export const dynamic = "force-dynamic";

export default async function ConferencePayPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ payu?: string; start?: string }>;
}) {
  const { token } = await params;
  const { payu, start } = await searchParams;
  const application = await prisma.conferenceApplication.findUnique({
    where: { paymentToken: token },
    include: { edition: { select: { name: true } } },
  });
  if (!application) notFound();

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        {application.edition.name} · Research Conference
      </p>
      <h1
        className="mt-2 font-display text-4xl tracking-wide text-teal-deep"
        data-testid="conference-pay"
      >
        Registration payment
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Application status: {applicationStatusLabel(application.status)}
      </p>
      <ConferencePayPanel
        token={application.paymentToken}
        name={application.name}
        amountPaise={application.paymentAmountPaise}
        paymentStatus={application.paymentStatus}
        paymentRef={application.paymentRef}
        gatewayReady={isConferenceGatewayReady()}
        outcome={payu ?? null}
        campusOnly={isOnlinePayTest()}
        autoStart={start === "1" && !payu && !isOnlinePayTest()}
        paymentVisible={applicationPaymentVisible(application)}
      />
      <p className="mt-6 text-sm text-mute">
        Questions:{" "}
        <a href="mailto:support@iitbinvent.com">support@iitbinvent.com</a>
        {" · "}
        <Link href="/dashboard" className="underline-offset-2 hover:underline">
          Dashboard
        </Link>
      </p>
    </main>
  );
}
