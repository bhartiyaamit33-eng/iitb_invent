/**
 * IIT Bombay OnlinePay — the wire protocol, and nothing about INV.ENT itself.
 *
 *   1. Hand-off   GET {gateway}commJsp/v2_accessPoint.jsp?sMsg=sAppId=…%26sUserId=…
 *   2. Validation the gateway POSTs { Records: { input_* } } to our validator and
 *                 expects the same envelope back with output_Validation_Status.
 *   3. Notice     the gateway calls our callback with ?sMsg=requestType=I|R|D&transId=…
 *   4. ACK        we GET {gateway}OnlinePayAckServlet?transId=…&requestType=…; the
 *                 servlet answers FAIL for a transaction it does not know.
 *
 * The LIVE gateway is the default. The TEST host (newtestasc) resolves on the
 * IITB LAN only, so it is usable from a server on the campus network (the LAN
 * dev copy at 10.127.1.23) with a TEST app id such as 10172:
 *   ONLINEPAY_GATEWAY_URL=https://newtestasc.iitb.ac.in/onlinepay_test/
 * ONLINEPAY_GATEWAY_URL also points local development at a mock gateway.
 */
import http from "node:http";
import https from "node:https";
import { randomBytes } from "node:crypto";

export type NoticeType = "I" | "R" | "D";

export type OnlinePayConfig = {
  appId: string;
  gatewayUrl: string;
  purpose: string;
};

const LIVE_GATEWAY_URL = "https://portal.iitb.ac.in/onlinepay/";
const LIVE_HOST = "portal.iitb.ac.in";
const TEST_HOST = "newtestasc.iitb.ac.in";

/**
 * App ids ASC issued for the TEST host. Sending one to the LIVE gateway would
 * at best fail and at worst settle fees into whichever live app owns that number.
 */
const TEST_ONLY_APP_IDS = new Set(["10172"]);

function gatewayHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

const DEFAULT_PURPOSE = "IITB INV.ENT conference registration";

function env(name: string): string {
  return (process.env[name] || "").trim();
}

/** Null while no usable app id is configured; the pay page then offers no checkout. */
export function onlinePayConfig(): OnlinePayConfig | null {
  const appId = env("ONLINEPAY_APP_ID");
  if (!appId) return null;
  const url = gatewayUrl();
  const host = gatewayHost(url);
  if (TEST_ONLY_APP_IDS.has(appId) && host === LIVE_HOST) {
    console.error(
      `[onlinepay] ONLINEPAY_APP_ID ${appId} is a TEST app id; set ONLINEPAY_GATEWAY_URL to the TEST host (https://${TEST_HOST}/onlinepay_test/) to use it`,
    );
    return null;
  }
  return {
    appId,
    gatewayUrl: url,
    purpose: env("ONLINEPAY_PURPOSE") || DEFAULT_PURPOSE,
  };
}

/** Base URL ending in "/". The ACK servlet lives here too, so it never needs an app id. */
export function gatewayUrl(): string {
  return (env("ONLINEPAY_GATEWAY_URL") || LIVE_GATEWAY_URL).replace(/\/*$/, "/");
}

/** PHP rawurlencode: like encodeURIComponent but also escapes ! ' ( ) *. */
function rawurlencode(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

/**
 * sMsg fields are separated by %26, which the gateway decodes once into "&".
 * A literal "&" in a value would therefore split the field, so it is removed.
 */
function field(value: string): string {
  return rawurlencode(value.replace(/&/g, " ").replace(/\s+/g, " ").trim());
}

/** Rupees as the gateway echoes them back: "5000", or "5000.50" when there are paise. */
export function formatRupees(paise: number): string {
  if (!Number.isSafeInteger(paise) || paise <= 0) {
    throw new Error("Invalid payment amount");
  }
  return paise % 100 === 0 ? String(paise / 100) : (paise / 100).toFixed(2);
}

/** Fresh per page load and never stored, as in the reference flow; echoed back by the gateway. */
export function newRequestId(): string {
  return randomBytes(12).toString("hex");
}

export function paymentRequestUrl(
  cfg: OnlinePayConfig,
  opts: { payerId: string; payerName: string; amountPaise: number; reqId: string },
): string {
  const parts = [
    `sAppId=${field(cfg.appId)}`,
    `sUserId=${field(opts.payerId)}`,
    `sUserName=${field(opts.payerName.slice(0, 80))}`,
    `sAmountDue=${field(formatRupees(opts.amountPaise))}`,
    `sPurpose=${field(cfg.purpose.slice(0, 120))}`,
    `sReqId=${field(opts.reqId)}`,
    "sCurrency=INR",
  ];
  return `${cfg.gatewayUrl}commJsp/v2_accessPoint.jsp?sMsg=${parts.join("%26")}`;
}

/** True when `incoming` (rupees, as sent by the gateway) is exactly `paise`. */
export function amountEqualsPaise(incoming: string, paise: number): boolean {
  const text = incoming.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return false;
  return Math.round(Number(text) * 100) === paise;
}

/** Rupees string → paise, or null when it is not a plain non-negative amount. */
export function rupeesToPaise(incoming: string): number | null {
  const text = incoming.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return null;
  return Math.round(Number(text) * 100);
}

// ─── Validation ──────────────────────────────────────────────────────────────

export type ValidationRequest = {
  appId: string;
  requestId: string;
  userId: string;
  amount: string;
};

/** Read the { Records: { input_* } } envelope. Missing fields come back as "". */
export function parseValidationRequest(body: unknown): ValidationRequest {
  const envelope =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  const records =
    envelope.Records && typeof envelope.Records === "object"
      ? (envelope.Records as Record<string, unknown>)
      : {};
  const text = (key: string) =>
    records[key] == null ? "" : String(records[key]).trim();
  return {
    appId: text("input_APPID"),
    requestId: text("input_RequestID"),
    userId: text("input_UserID"),
    amount: text("input_Amount"),
  };
}

export function validationResponse(
  req: ValidationRequest,
  status: "VALID" | "INVALID",
) {
  return {
    Records: {
      input_APPID: req.appId,
      input_RequestID: req.requestId,
      input_UserID: req.userId,
      input_Amount: req.amount,
      output_Validation_Status: status,
    },
  };
}

// ─── Notices (immediate / reconciliation / D) ────────────────────────────────

export type GatewayNotice = {
  requestType: string;
  userId: string;
  provId: string;
  reqId: string;
  totalAmt: string;
  refNo: string;
  transId: string;
  status: string;
  transDate: string;
  transTime: string;
  reconDate: string;
  reconTime: string;
  msg: string;
};

/** sMsg as delivered (already URL-decoded once): "requestType=I&transId=…". */
export function parseNotice(sMsg: string): GatewayNotice {
  const params = new URLSearchParams(sMsg);
  const get = (key: string) => (params.get(key) ?? "").trim();
  return {
    requestType: get("requestType").toUpperCase(),
    userId: get("userId"),
    provId: get("provId"),
    reqId: get("reqId"),
    totalAmt: get("totalAmt"),
    refNo: get("refNo"),
    transId: get("transId"),
    status: get("status").toUpperCase(),
    transDate: get("transDate"),
    transTime: get("transTime"),
    reconDate: get("reconDate"),
    reconTime: get("reconTime"),
    msg: get("msg"),
  };
}

export function isNoticeType(value: string): value is NoticeType {
  return value === "I" || value === "R" || value === "D";
}

// ─── Acknowledgement ─────────────────────────────────────────────────────────

/**
 * Tell the gateway we received a notice, and keep its answer for the record:
 * "<type>_ACK_<reply>" or "Err <reason>". The servlet replies FAIL for a
 * transaction it never issued, which is what makes a forged notice harmless.
 */
export function acknowledgeNotice(
  transId: string,
  requestType: NoticeType,
): Promise<string> {
  const url = new URL(`${gatewayUrl()}OnlinePayAckServlet`);
  url.searchParams.set("transId", transId);
  url.searchParams.set("requestType", requestType);
  const client = url.protocol === "http:" ? http : https;

  return new Promise((resolve) => {
    const done = (result: string) => {
      const line = result.replace(/\s+/g, " ").trim().slice(0, 255);
      console.info(`[onlinepay] ACK ${requestType} ${transId} -> ${line}`);
      resolve(line);
    };
    const req = client.get(
      url,
      {
        timeout: 20_000,
        // IITB's gateway hosts still negotiate ciphers OpenSSL 3 rejects by default.
        ...(url.protocol === "https:" ? { ciphers: "DEFAULT@SECLEVEL=1" } : {}),
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk: string) => {
          if (body.length < 2000) body += chunk;
        });
        res.on("end", () => {
          const status = res.statusCode ?? 0;
          done(
            status >= 200 && status < 300
              ? `${requestType}_ACK_${body.trim()}`
              : `Err HTTP ${status}`,
          );
        });
      },
    );
    req.on("timeout", () => req.destroy(new Error("timed out")));
    req.on("error", (err) => done(`Err ${err.message}`));
  });
}

/** Whether a stored ACK reply confirms the transaction. */
export function ackConfirmed(ack: string | null | undefined): boolean {
  if (!ack) return false;
  return !ack.startsWith("Err") && !/FAIL/i.test(ack);
}
