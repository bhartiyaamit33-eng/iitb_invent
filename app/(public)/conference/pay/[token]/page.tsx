import { saveBilling } from "./actions";
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
  searchParams: Promise<{
    payu?: string;
    start?: string;
    ack?: string;
    billing?: string;
  }>;
}) {
  const { token } = await params;
  const { payu, start, ack, billing } = await searchParams;
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
        payerUserId={application.opUserId}
        gatewayReady={isConferenceGatewayReady()}
        outcome={payu ?? null}
        campusOnly={isOnlinePayTest()}
        autoStart={start === "1" && !payu && !isOnlinePayTest()}
        paymentVisible={applicationPaymentVisible(application)}
        ackPending={ack === "pending"}
      />
      {application.paymentStatus === "PAID" && (
        <Link
          className="mt-6 block font-semibold underline"
          href={`/conference/pay/${token}/receipt`}
        >
          Download / print payment receipt
        </Link>
      )}
      {["UNPAID", "NOT_REQUIRED"].includes(application.paymentStatus) && (
        <section className="mt-6 rounded-xl border border-line p-5">
          <h2 className="font-semibold">
            Billing details for your receipt and Accounts
          </h2>
          <p className="mt-2 text-sm">
            Optional. Save before paying. The GST invoice will be issued
            separately after the program.
          </p>
          {billing && (
            <p role="status">
              {billing === "saved"
                ? "Billing details saved."
                : "Check your billing details and GSTIN."}
            </p>
          )}
          <form action={saveBilling} className="mt-3 space-y-3">
            <input type="hidden" name="token" value={token} />
            <label className="block text-sm">
              Billing name
              <input
                name="billingName"
                maxLength={120}
                defaultValue={application.billingName || ""}
                className="mt-1 w-full rounded border border-line p-2"
              />
            </label>
            <label className="block text-sm">
              Billing address
              <textarea
                name="billingAddress"
                maxLength={1000}
                defaultValue={application.billingAddress || ""}
                className="mt-1 w-full rounded border border-line p-2"
              />
            </label>
            <label className="block text-sm">
              GSTIN (if applicable)
              <input
                name="billingGstin"
                maxLength={15}
                defaultValue={application.billingGstin || ""}
                className="mt-1 w-full rounded border border-line p-2"
              />
            </label>
            <button className="rounded bg-teal-deep px-4 py-2 text-sm text-white">
              Save billing details
            </button>
          </form>
        </section>
      )}
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
