import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const TEST_PAYMENT_URL = "https://test.payu.in/_payment";
const LIVE_PAYMENT_URL = "https://secure.payu.in/_payment";

export type PayUConfig = {
  key: string;
  salt: string;
  paymentUrl: string;
  mode: "test" | "live";
};

function env(name: string): string {
  return (process.env[name] || "").trim();
}

/** IIT Bombay PayU Biz credentials. Empty until merchant approval lands. */
export function payuConfig(): PayUConfig | null {
  const key = env("PAYU_KEY") || env("PAYU_MERCHANT_KEY");
  const salt = env("PAYU_SALT");
  if (!key || !salt) return null;

  const mode: "test" | "live" =
    env("PAYU_MODE").toLowerCase() === "live" ? "live" : "test";
  const paymentUrl =
    env("PAYU_PAYMENT_URL") ||
    (mode === "live" ? LIVE_PAYMENT_URL : TEST_PAYMENT_URL);

  return { key, salt, paymentUrl, mode };
}

export function isPayUConfigured(): boolean {
  return payuConfig() !== null;
}

export function payuAmountFromPaise(paise: number): string {
  return (paise / 100).toFixed(2);
}

export function paiseFromPayUAmount(amount: string): number {
  const n = Number(amount);
  if (!Number.isFinite(n) || n < 0) return NaN;
  return Math.round(n * 100);
}

/** PayU txnid: alphanumeric, max 25. */
export function newPayUTxnId(): string {
  const t = Date.now().toString(36);
  const r = randomBytes(5).toString("hex");
  return `inv${t}${r}`.slice(0, 25);
}

export type PayURequestFields = {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
};

export function payuRequestHash(
  fields: PayURequestFields,
  salt: string,
): string {
  const parts = [
    fields.key,
    fields.txnid,
    fields.amount,
    fields.productinfo,
    fields.firstname,
    fields.email,
    fields.udf1 ?? "",
    fields.udf2 ?? "",
    fields.udf3 ?? "",
    fields.udf4 ?? "",
    fields.udf5 ?? "",
    "",
    "",
    "",
    "",
    "",
    salt,
  ];
  return sha512(parts.join("|"));
}

export type PayUResponseFields = {
  status: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  email: string;
  firstname: string;
  productinfo: string;
  amount: string;
  txnid: string;
  key: string;
  additionalCharges?: string;
};

export function payuResponseHash(
  fields: PayUResponseFields,
  salt: string,
): string {
  const emptyUdf6to10 = ["", "", "", "", ""];
  const tail = [
    fields.status,
    ...emptyUdf6to10,
    fields.udf5 ?? "",
    fields.udf4 ?? "",
    fields.udf3 ?? "",
    fields.udf2 ?? "",
    fields.udf1 ?? "",
    fields.email,
    fields.firstname,
    fields.productinfo,
    fields.amount,
    fields.txnid,
    fields.key,
  ];
  const extra = (fields.additionalCharges || "").trim();
  const body = extra
    ? [extra, salt, ...tail].join("|")
    : [salt, ...tail].join("|");
  return sha512(body);
}

export function payuHashMatches(expected: string, received: string): boolean {
  const a = Buffer.from(expected.trim().toLowerCase());
  const b = Buffer.from(received.trim().toLowerCase());
  if (a.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function payuFirstName(name: string): string {
  const first = name.trim().split(/\s+/)[0] || "Applicant";
  const cleaned = first.replace(/[^A-Za-z.' -]/g, "").slice(0, 60);
  return cleaned || "Applicant";
}

export function payuPhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

function sha512(value: string): string {
  return createHash("sha512").update(value).digest("hex");
}
