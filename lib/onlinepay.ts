/**
 * IIT Bombay Online Pay — TEST/LIVE access points.
 * PayU is a mode on OP (Lisa app 10172 DSSE INV.ENT Test), not a separate
 * merchant checkout. Money settles to IITB_MAIN.
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
const LIVE_ACK = "https://onlinepay.iitb.ac.in/OnlinePayAckServlet";

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
    (testEnv === "live" ? "INVENT conference registration" : "testing");
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
  return `${cfg.accessPoint}?sMsg=${sMsg}`;
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

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function firstField(
  params: Record<string, string>,
  keys: string[],
): string {
  for (const key of keys) {
    const value = (params[key] || "").trim();
    if (value) return value;
  }
  return "";
}

/** Flatten Lisa JSON (`Records: { … }`) or a flat object into string fields. */
export function flattenOnlinePayObject(body: unknown): Record<string, string> {
  if (typeof body === "string") {
    const trimmed = body.trim();
    if (trimmed.startsWith("{")) {
      try {
        return flattenOnlinePayObject(JSON.parse(trimmed));
      } catch {
        return parseSMsg(trimmed);
      }
    }
    return parseSMsg(trimmed);
  }
  if (!isPlainRecord(body)) return {};
  const records = body.Records ?? body.records;
  const inner = isPlainRecord(records) ? { ...body, ...records } : body;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(inner)) {
    if (key === "Records" || key === "records") continue;
    if (value == null || typeof value === "object") continue;
    const text = String(value).trim();
    if (text) out[key] = text;
  }
  return out;
}

/**
 * Read an OP validate/callback HTTP call. Lisa may send sMsg, JSON Records,
 * or the flat payment/settlement fields listed on the application (reqId,
 * transId, status, reconDate, …).
 */
export async function readOnlinePayRequest(
  req: Request,
): Promise<Record<string, string>> {
  const url = new URL(req.url);
  const fromQuery = Object.fromEntries(url.searchParams.entries());
  const sMsgQuery = fromQuery.sMsg;
  const fromSMsg = sMsgQuery ? parseSMsg(sMsgQuery) : {};
  const base = { ...fromQuery, ...fromSMsg };

  if (req.method === "GET" || req.method === "HEAD") {
    return base;
  }

  const text = await req.text();
  if (!text) return base;

  const contentType = req.headers.get("content-type") ?? "";
  if (
    contentType.includes("json") ||
    text.trim().startsWith("{") ||
    text.trim().startsWith("[")
  ) {
    try {
      return { ...base, ...flattenOnlinePayObject(JSON.parse(text)) };
    } catch {
      /* fall through */
    }
  }
  if (text.includes("=")) {
    const form = Object.fromEntries(new URLSearchParams(text));
    const nested = form.sMsg ? parseSMsg(form.sMsg) : {};
    return { ...base, ...form, ...nested };
  }
  return { ...base, ...parseSMsg(text) };
}

/**
 * Lisa lists payment vs settlement fields, not always `requestType`.
 * I = payment notification (status S/F). R = settlement (reconDate). D = refund.
 */
export function inferOnlinePayRequestType(
  params: Record<string, string>,
): "I" | "R" | "D" | null {
  const explicit = firstField(params, [
    "requestType",
    "RequestType",
    "requesttype",
    "request_type",
  ])
    .charAt(0)
    .toUpperCase();
  if (explicit === "I" || explicit === "R" || explicit === "D") return explicit;
  if (
    firstField(params, ["reconDate", "reconTime", "netReconAmt", "grossAmt"])
  ) {
    return "R";
  }
  if (
    firstField(params, ["status", "sStatus", "transDate", "transTime"])
  ) {
    return "I";
  }
  return null;
}

export type ValidationInput = {
  appId: string;
  requestId: string;
  userId: string;
  amount: string;
};

export function parseValidationPayload(body: unknown): ValidationInput | null {
  const inner = flattenOnlinePayObject(body);
  const appId = firstField(inner, [
    "input_APPID",
    "appId",
    "sAppId",
    "APPID",
  ]);
  const requestId = firstField(inner, [
    "input_RequestID",
    "requestId",
    "sReqId",
    "reqId",
  ]);
  const userId = firstField(inner, [
    "input_UserID",
    "userId",
    "sUserId",
  ]);
  const amount = firstField(inner, [
    "input_Amount",
    "amount",
    "sAmountDue",
    "totalAmt",
  ]);
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

export async function acknowledgeOnlinePay(opts: {
  transId: string;
  requestType: "I" | "R" | "D";
}): Promise<{ ok: boolean; error?: string }> {
  const cfg = onlinePayConfig();
  if (!cfg) return { ok: false, error: "not configured" };
  if (!opts.transId) return { ok: false, error: "missing transId" };

  const url = `${cfg.ackUrl}?transId=${encodeURIComponent(opts.transId)}&requestType=${opts.requestType}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, error: `ACK HTTP ${res.status}` };
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
