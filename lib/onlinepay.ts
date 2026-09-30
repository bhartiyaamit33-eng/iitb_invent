/**
 * IIT Bombay Online Pay — TEST/LIVE access points.
 * PayU is a mode on OP, not a separate merchant checkout.
 */

export type OnlinePayEnv = "test" | "live";

export type OnlinePayConfig = {
  env: OnlinePayEnv;
  appId: string;
  accessPoint: string;
  ackUrl: string;
  purpose: string;
};

const TEST_ACCESS =
  "https://newtestasc.iitb.ac.in/onlinepay_test/commJsp/v2_accessPoint.jsp";
const LIVE_ACCESS =
  "https://portal.iitb.ac.in/onlinepay/commJsp/v2_accessPoint.jsp";
const TEST_ACK =
  "https://newtestasc.iitb.ac.in/onlinepay_test/OnlinePayAckServlet";
const LIVE_ACK = "https://portal.iitb.ac.in/onlinepay/OnlinePayAckServlet";

function env(name: string): string {
  return (process.env[name] || "").trim();
}

export function onlinePayConfig(): OnlinePayConfig | null {
  const appId = env("ONLINEPAY_APP_ID");
  if (!appId) return null;
  const raw = env("ONLINEPAY_ENV").toLowerCase();
  const testEnv: OnlinePayEnv = raw === "live" ? "live" : "test";
  const purpose =
    env("ONLINEPAY_PURPOSE") ||
    (testEnv === "live"
      ? "IITB INV.ENT conference registration"
      : "DSSE INV.ENT Test");
  return {
    env: testEnv,
    appId,
    accessPoint:
      env("ONLINEPAY_ACCESS_POINT") ||
      (testEnv === "live" ? LIVE_ACCESS : TEST_ACCESS),
    ackUrl: env("ONLINEPAY_ACK_URL") || (testEnv === "live" ? LIVE_ACK : TEST_ACK),
    purpose,
  };
}

export function isOnlinePayConfigured(): boolean {
  return onlinePayConfig() !== null;
}

/** TEST access point is on IITB DNS only (campus / VPN). */
export function isOnlinePayTest(): boolean {
  return onlinePayConfig()?.env === "test";
}

function sanitizeSMsgValue(value: string): string {
  return value.replace(/[&]/g, " ").replace(/\s+/g, " ").trim();
}

/** OP joins fields with %26 instead of encoding '='. */
export function buildSMsg(fields: Record<string, string>): string {
  return Object.entries(fields)
    .map(([key, value]) => `${key}=${sanitizeSMsgValue(value)}`)
    .join("%26");
}

export function formatAmountDue(amount: number | string): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "0.0";
  return n.toFixed(1);
}

export function paymentRequestUrl(opts: {
  appId: string;
  userId: string;
  userName: string;
  amountDue: number | string;
  purpose: string;
  reqId: string;
}): string {
  const cfg = onlinePayConfig();
  if (!cfg) throw new Error("ONLINEPAY_APP_ID is not set");
  const sMsg = buildSMsg({
    sAppId: opts.appId,
    sUserId: opts.userId,
    sUserName: opts.userName,
    sAmountDue: formatAmountDue(opts.amountDue),
    sPurpose: opts.purpose.slice(0, 120),
    sReqId: opts.reqId,
    sCurrency: "INR",
  });
  return `${cfg.accessPoint}?sMsg=${sMsg.replace(/ /g, "%20")}`;
}

export function parseSMsg(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  let input = raw.trim();
  if (input.includes("%26") && !input.includes("&")) {
    input = input.replace(/%26/gi, "&");
  }
  try {
    if (/%3D/i.test(input) && !input.includes("=")) {
      input = decodeURIComponent(input);
    }
  } catch {
    /* keep */
  }

  const out: Record<string, string> = {};
  for (const part of input.split("&")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(value.replace(/\+/g, " "));
    } catch {
      out[key] = value;
    }
  }
  return out;
}

export type ValidationInput = {
  appId: string;
  requestId: string;
  userId: string;
  amount: string;
};

export function parseValidationPayload(body: unknown): ValidationInput | null {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  const records = root.Records ?? root.records;
  let inner: Record<string, unknown> = root;
  if (typeof records === "string") {
    try {
      const parsed = JSON.parse(records) as unknown;
      if (parsed && typeof parsed === "object") {
        inner = parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  } else if (records && typeof records === "object") {
    inner = records as Record<string, unknown>;
  }
  const appId = String(
    inner.input_APPID ?? inner.appId ?? inner.sAppId ?? "",
  ).trim();
  const requestId = String(
    inner.input_RequestID ?? inner.requestId ?? inner.sReqId ?? "",
  ).trim();
  const userId = String(
    inner.input_UserID ?? inner.userId ?? inner.sUserId ?? "",
  ).trim();
  const amount = String(
    inner.input_Amount ?? inner.amount ?? inner.sAmountDue ?? "",
  ).trim();
  if (!appId || !requestId || !userId || !amount) return null;
  return { appId, requestId, userId, amount };
}

export function validationResponse(
  input: ValidationInput,
  status: "VALID" | "INVALID",
): Record<string, unknown> {
  return {
    Records: {
      input_APPID: input.appId,
      input_RequestID: input.requestId,
      input_UserID: input.userId,
      input_Amount: input.amount,
      output_Validation_Status: status,
    },
  };
}

export function onlinePayAckUrl(
  transId: string,
  requestType: "I" | "R" | "D",
): string | null {
  const cfg = onlinePayConfig();
  if (!cfg || !transId) return null;
  return `${cfg.ackUrl}?transId=${encodeURIComponent(transId)}&requestType=${requestType}`;
}

/**
 * OP's test and live hosts publish private IITB addresses. This succeeds only
 * from a network that can route there (campus or VPN), including this server
 * when it can. Callers must treat failure as "ack still owed".
 */
export async function acknowledgeOnlinePay(opts: {
  transId: string;
  requestType: "I" | "R" | "D";
}): Promise<{ ok: boolean; error?: string }> {
  const url = onlinePayAckUrl(opts.transId, opts.requestType);
  if (!url) {
    return {
      ok: false,
      error: opts.transId ? "not configured" : "missing transId",
    };
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return { ok: false, error: `ACK HTTP ${res.status}` };
    const body = (await res.text()).trim().toUpperCase();
    if (body.startsWith("FAIL")) return { ok: false, error: "ACK FAIL" };
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
