"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  canMockOnlinePay,
  onlinePayConfig,
  paymentRequestUrl,
} from "@/lib/payments/onlinepay";
import { isPaidStatus } from "@/lib/payments/pricing";
import { completeMockPayment } from "@/lib/payments/service";

export async function startOnlinePayAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const payment = await prisma.payment.findUnique({
    where: { payToken: token },
    include: { user: true },
  });
  if (!payment) {
    redirect("/");
  }
  if (isPaidStatus(payment.status)) {
    redirect(`/pay/${token}/receipt`);
  }

  if (canMockOnlinePay()) {
    await completeMockPayment(token);
    redirect(`/pay/${token}/receipt`);
  }

  const cfg = onlinePayConfig();
  if (!cfg.appId) {
    redirect(`/pay/${token}?error=gateway`);
  }

  redirect(
    paymentRequestUrl({
      appId: payment.appId || cfg.appId,
      userId: payment.opUserId,
      userName: payment.user.name,
      amountDue: payment.amount.toString(),
      purpose: payment.purpose,
      reqId: payment.reqId,
    }),
  );
}
