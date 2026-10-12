import { handleGatewayCallback } from "@/lib/onlinepay-callback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Return URL registered with ASC for immediate and reconciliation notices. */
export async function GET(req: Request) {
  return handleGatewayCallback(req);
}

export async function POST(req: Request) {
  return handleGatewayCallback(req);
}
