import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ensurePaymentReceipt } from "@/lib/payment-management";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Receipt({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const app = await prisma.conferenceApplication.findUnique({
    where: { paymentToken: token },
  });
  if (!app || app.paymentStatus !== "PAID") notFound();
  const receipt = await ensurePaymentReceipt(app.id);
  if (!receipt) notFound();
  const data = receipt.snapshot as Record<string, string | number | null>;
  return (
    <main
      className="mx-auto max-w-2xl px-6 py-12"
      data-testid="payment-receipt"
    >
      <p className="text-sm">IIT Bombay · INV.ENT</p>
      <h1 className="mt-3 font-display text-4xl text-teal-deep">
        Payment receipt
      </h1>
      <p className="mt-3 font-semibold">{receipt.number}</p>
      <p>
        Issued{" "}
        {receipt.issuedAt.toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
        })}
      </p>
      <div className="my-8 border-y border-line py-6">
        <p>{data.name}</p>
        <p>{data.email}</p>
        <p className="whitespace-pre-line">{data.address}</p>
        {data.gstin && <p>GSTIN: {data.gstin}</p>}
      </div>
      <p>{data.event}</p>
      <p className="mt-4 text-3xl">
        {new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(receipt.amountPaise / 100)}
      </p>
      <p className="mt-3">
        Payment reference: {data.reference || "Recorded by organiser"}
      </p>
      <p className="mt-6 rounded bg-paper p-4">
        This is a payment receipt, not a GST tax invoice. The official GST
        invoice is issued by IIT Bombay Accounts after the program ends.
      </p>
      {app.gstInvoiceRef && (
        <p className="mt-4">
          Accounts GST invoice: {app.gstInvoiceRef}{" "}
          {app.gstInvoiceUrl && (
            <a className="underline" href={app.gstInvoiceUrl}>
              Open invoice
            </a>
          )}
        </p>
      )}
      <p className="mt-6 text-sm print:hidden">
        Use your browser’s Print → Save as PDF to download this receipt.
      </p>
      <Link
        className="mt-4 block underline print:hidden"
        href={`/conference/pay/${token}`}
      >
        Back to payment
      </Link>
    </main>
  );
}
