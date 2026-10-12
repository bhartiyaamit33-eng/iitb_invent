import { handleGatewayCallback } from "@/lib/onlinepay-callback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Older return URL; same handler as /api/onlinepay/payack. */
export async function GET(req: Request) {
  return handleGatewayCallback(req);
}

export async function POST(req: Request) {
  return handleGatewayCallback(req);
}
