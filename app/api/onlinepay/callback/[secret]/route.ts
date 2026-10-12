import { handleGatewayCallback } from "@/lib/onlinepay-callback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Older return URLs (/api/onlinepay/callback/<anything>, e.g. the one still
 * registered for the TEST app). The path segment is ignored; same handler as
 * /api/onlinepay/payack.
 */
export async function GET(req: Request) {
  return handleGatewayCallback(req);
}

export async function POST(req: Request) {
  return handleGatewayCallback(req);
}
