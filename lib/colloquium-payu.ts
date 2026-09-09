import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { siteOrigin } from "@/lib/ticket";
import {
  isPayUConfigured,
  newPayUTxnId,
  paiseFromPayUAmount,
  payuAmountFromPaise,
  payuConfig,
  payuFirstName,
  payuHashMatches,
  payuPhone,
  payuRequestHash,
  payuResponseHash,
} from "@/lib/payu";

export const COLLOQUIUM_PAYU_PRODUCT =
  "Inv.ent Research Colloquium registration";

export type PayUCheckout = {
  action: string;
  fields: Record<string, string>;
};

export function colloquiumPayUCallbackUrl(): string {
  return `${siteOrigin()}/api/colloquium/payu/callback`;
}

export function buildPayUCheckout(application: {
  id: string;
  name: string;
  email: string;
  phone: string;
  paymentToken: string;
  paymentAmountPaise: number;
}): PayUCheckout | null {
  const cfg = payuConfig();
  if (!cfg) return null;

  const amount = payuAmountFromPaise(application.paymentAmountPaise);
  const txnid = newPayUTxnId();
  const firstname = payuFirstName(application.name);
  const email = application.email.trim();
  const callback = colloquiumPayUCallbackUrl();
  const request = {
    key: cfg.key,
    txnid,
    amount,
    productinfo: COLLOQUIUM_PAYU_PRODUCT,
    firstname,
    email,
    udf1: application.id,
    udf2: application.paymentToken,
    udf3: "",
    udf4: "",
    udf5: "",
  };

  const fields: Record<string, string> = {
    key: cfg.key,
    txnid,
    amount,
    productinfo: COLLOQUIUM_PAYU_PRODUCT,
    firstname,
    email,
    phone: payuPhone(application.phone),
    surl: callback,
    furl: callback,
    hash: payuRequestHash(request, cfg.salt),
    udf1: application.id,
    udf2: application.paymentToken,
    service_provider: "payu_paisa",
  };

  return { action: cfg.paymentUrl, fields };
}

export type PayUCallbackOutcome =
  | "success"
  | "failed"
  | "pending"
  | "invalid";

export async function processPayUCallback(
  raw: Record<string, string>,
): Promise<{ outcome: PayUCallbackOutcome; paymentToken: string | null }> {
  const cfg = payuConfig();
  const status = String(raw.status || "").toLowerCase();
  const paymentToken = (raw.udf2 || "").trim() || null;
  const applicationId = (raw.udf1 || "").trim();

  if (!cfg) {
    return { outcome: "invalid", paymentToken };
  }

  const computed = payuResponseHash(
    {
      status: raw.status || "",
      udf1: raw.udf1 || "",
      udf2: raw.udf2 || "",
      udf3: raw.udf3 || "",
      udf4: raw.udf4 || "",
      udf5: raw.udf5 || "",
      email: raw.email || "",
      firstname: raw.firstname || "",
      productinfo: raw.productinfo || "",
      amount: raw.amount || "",
      txnid: raw.txnid || "",
      key: raw.key || "",
      additionalCharges: raw.additionalCharges || "",
    },
    cfg.salt,
  );

  if (!payuHashMatches(computed, raw.hash || "")) {
    console.error("[payu callback] hash mismatch", {
      txnid: raw.txnid,
      status: raw.status,
    });
    return { outcome: "invalid", paymentToken };
  }

  if ((raw.key || "") !== cfg.key) {
    return { outcome: "invalid", paymentToken };
  }

  const application = applicationId
    ? await prisma.colloquiumApplication.findUnique({
        where: { id: applicationId },
      })
    : paymentToken
      ? await prisma.colloquiumApplication.findUnique({
          where: { paymentToken },
        })
      : null;

  if (!application) {
    return { outcome: "invalid", paymentToken };
  }

  const token = application.paymentToken;
  const paidPaise = paiseFromPayUAmount(raw.amount || "");
  const amountOk = paidPaise === application.paymentAmountPaise;
  const mihpayid = String(raw.mihpayid || raw.txnid || "").trim();

  if (status === "success" && amountOk) {
    if (
      application.paymentStatus !== "PAID" &&
      application.paymentStatus !== "WAIVED"
    ) {
      await prisma.colloquiumApplication.update({
        where: { id: application.id },
        data: {
          paymentStatus: "PAID",
          paymentRef: mihpayid || application.paymentRef,
          paidAt: new Date(),
        },
      });
      revalidatePath("/admin/applications");
      revalidatePath(`/admin/applications/${application.id}`);
    }
    return { outcome: "success", paymentToken: token };
  }

  if (status === "pending") {
    return { outcome: "pending", paymentToken: token };
  }

  return { outcome: "failed", paymentToken: token };
}

export function isPayUReady(): boolean {
  return isPayUConfigured();
}
