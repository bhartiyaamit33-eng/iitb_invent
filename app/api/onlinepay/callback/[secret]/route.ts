import { handleOnlinePayCallback } from "@/lib/onlinepay-http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handle(
  req: Request,
  context: { params: Promise<{ secret: string }> },
) {
  const { secret } = await context.params;
  return handleOnlinePayCallback(req, secret);
}
export const GET = handle;
export const POST = handle;
