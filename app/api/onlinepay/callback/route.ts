import { handleOnlinePayCallback } from "@/lib/onlinepay-http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  return handleOnlinePayCallback(req);
}
export async function GET(req: Request) {
  return handleOnlinePayCallback(req);
}
