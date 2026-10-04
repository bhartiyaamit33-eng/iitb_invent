/** Run only against a dedicated disposable database containing "payment_verify" in its name. */
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { prisma } from "../lib/db";
import {
  startConferenceOnlinePay,
  validateOnlinePayRequest,
  applyConferenceOnlinePayCallback,
} from "../lib/conference-onlinepay";
import { assignCoupon } from "../lib/payment-management";
import { handleOnlinePayCallback } from "../lib/onlinepay-http";
import { paymentRequestUrl, readOnlinePayRequest, parseValidationPayload, inferOnlinePayRequestType } from "../lib/onlinepay";
import { conferenceFeePaiseFor, needsPhdYear, parseProfessional } from "../lib/conference";

async function main() {
  const jsonNotice = await readOnlinePayRequest(new Request("https://example.invalid/callback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sMsg: "requestType=I%26status=S%26grossAmt=5000.00" }) }));
  assert.equal(jsonNotice.requestType, "I");
  assert.equal(inferOnlinePayRequestType({ status: "S", grossAmt: "5000.00" }), "I");
  assert.equal(inferOnlinePayRequestType({ reconDate: "2026-10-05" }), "R");
  assert.equal(inferOnlinePayRequestType({ requestType: "INVALID", status: "S" }), null);
  assert.deepEqual(parseValidationPayload({ Records: JSON.stringify({ input_APPID: "10172", input_RequestID: "req-test", input_UserID: "payer", input_Amount: "5000.00" }) }), { appId: "10172", requestId: "req-test", userId: "payer", amount: "5000.00" });
  assert.equal(parseProfessional("STUDENT"), "STUDENT");
  assert.equal(conferenceFeePaiseFor("STUDENT"), 500_000);
  assert.equal(conferenceFeePaiseFor("PHD_SCHOLAR"), 500_000);
  assert.equal(conferenceFeePaiseFor("PROFESSOR"), 1_000_000);
  assert.equal(conferenceFeePaiseFor("INDUSTRY"), 2_000_000);
  assert.equal(needsPhdYear("STUDENT"), false);
  const database = new URL(process.env.DATABASE_URL || "");
  assert.equal(database.hostname, "localhost");
  assert.ok(
    database.pathname.includes("payment_verify"),
    "A dedicated verification database is required.",
  );
  const server = createServer((_, res) => {
    res.writeHead(200);
    res.end("OK");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  process.env.ONLINEPAY_ENV = "test";
  process.env.ONLINEPAY_APP_ID = "10172";
  process.env.ONLINEPAY_ACK_URL = `http://127.0.0.1:${address.port}/ack`;
  const suffix = Date.now().toString(36);
  const edition = await prisma.edition.create({
    data: {
      year: 2091,
      slug: `payment-verify-${suffix}`,
      name: "Payment verification",
      startsAt: new Date("2091-01-01"),
      endsAt: new Date("2091-01-02"),
      venueName: "Test",
      venueAddress: "Test",
    },
  });
  const ids: string[] = [];
  let couponId: string | undefined;
  try {
    const app = await prisma.conferenceApplication.create({
      data: {
        editionId: edition.id,
        email: `${suffix}@example.invalid`,
        name: "Payment verification",
        phone: "9999999999",
        institution: "Test",
        professionalCategory: "PROFESSOR",
        participationCategory: "ATTENDEE",
        status: "ATTENDEE",
        paymentStatus: "UNPAID",
        paymentAmountPaise: 1000000,
        paymentToken: `pay-${suffix}`,
        abstractViewToken: `abs-${suffix}`,
      },
    });
    ids.push(app.id);
    const actor = await prisma.user.findUniqueOrThrow({
      where: { id: "payment-verification-admin" },
    });
    const coupon = await prisma.paymentCoupon.create({
      data: {
        code: `VERIFY-${suffix.toUpperCase()}`,
        kind: "PERCENT",
        value: 10,
      },
    });
    couponId = coupon.id;
    const discounted = await assignCoupon(actor.id, app.id, coupon.code);
    assert.equal(discounted.paymentAmountPaise, 900000);
    const payer = "amitbhartiya@iitb.ac.in";
    const starts = await Promise.all([
      startConferenceOnlinePay(discounted, { payerUserId: payer }),
      startConferenceOnlinePay(discounted, { payerUserId: payer }),
    ]);
    assert.equal(starts[0]!.url, starts[1]!.url);
    assert.equal(
      await prisma.paymentAttempt.count({ where: { applicationId: app.id } }),
      1,
    );
    const attempt = await prisma.paymentAttempt.findFirstOrThrow({
      where: { applicationId: app.id },
    });
    assert.equal(attempt.userId, payer);
    const request = {
      appId: "10172",
      requestId: attempt.requestId,
      userId: payer,
      amount: "9000.00",
    };
    assert.equal(await validateOnlinePayRequest(request), "VALID");
    for (const input of [
      { ...request, userId: "amitbhartiyaiitb.ac.in" },
      { ...request, amount: "9000.01" },
      { ...request, appId: "wrong" },
    ])
      assert.equal(await validateOnlinePayRequest(input), "INVALID");
    await assert.rejects(
      assignCoupon(actor.id, app.id, coupon.code),
      /request already exists/,
    );
    process.env.ONLINEPAY_CALLBACK_TOKEN = "local-verification-secret";
    const unauthorized = await handleOnlinePayCallback(
      new Request("http://localhost/api/onlinepay/callback?sMsg=x"),
    );
    assert.equal(unauthorized.status, 403);
    delete process.env.ONLINEPAY_CALLBACK_TOKEN;
    const fields = {
      requestType: "I",
      reqId: attempt.requestId,
      appId: "10172",
      userId: payer,
      totalAmt: "9000.00",
      transId: `TEST-${suffix}`,
      status: "S",
    };
    const message = (data: Record<string, string>) =>
      new URLSearchParams(data).toString();
    for (const change of [
      { userId: "wrong" },
      { totalAmt: "9000.01" },
      { appId: "wrong" },
      { transId: "" },
      { status: "X" },
    ]) {
      const result = await applyConferenceOnlinePayCallback(
        message({ ...fields, ...change }),
      );
      assert.equal(result.paymentToken, null);
      assert.equal(
        (
          await prisma.conferenceApplication.findUniqueOrThrow({
            where: { id: app.id },
          })
        ).paymentStatus,
        "UNPAID",
      );
    }
    // A failed attempt reference must not become the receipt's successful reference.
    await applyConferenceOnlinePayCallback(
      message({ ...fields, status: "F", transId: `FAILED-${suffix}` }),
    );
    // A later bank reconciliation takes precedence.

    assert.equal(
      (
        await applyConferenceOnlinePayCallback(
          message({ ...fields, requestType: "R" }),
        )
      ).ackOk,
      true,
    );
    const paid = await prisma.conferenceApplication.findUniqueOrThrow({
      where: { id: app.id },
      include: { receipt: true },
    });
    assert.equal(paid.paymentStatus, "PAID");
    assert.ok(paid.receipt);
    assert.equal(paid.paymentRef, fields.transId);
    assert.equal(paid.opTransId, fields.transId);
    assert.equal(
      (paid.receipt.snapshot as { reference: string }).reference,
      fields.transId,
    );
    const receiptNumber = paid.receipt.number;
    const collision = await prisma.paymentAttempt.create({
      data: {
        applicationId: app.id,
        requestId: `collision-${suffix}`,
        appId: "10172",
        userId: payer,
        amountPaise: 900000,
        environment: "test",
      },
    });
    assert.equal(
      (
        await applyConferenceOnlinePayCallback(
          message({ ...fields, reqId: collision.requestId }),
        )
      ).paymentToken,
      null,
    );

    await Promise.all([
      applyConferenceOnlinePayCallback(message(fields)),
      applyConferenceOnlinePayCallback(message({ ...fields, status: "F" })),
    ]);
    assert.equal(
      (
        await prisma.paymentAttempt.findUniqueOrThrow({
          where: { id: attempt.id },
        })
      ).status,
      "SETTLED",
    );
    assert.equal(
      (
        await prisma.paymentReceipt.findUniqueOrThrow({
          where: { applicationId: app.id },
        })
      ).number,
      receiptNumber,
    );
    await applyConferenceOnlinePayCallback(
      message({ ...fields, requestType: "D", totalAmt: "-9000.00" }),
    );
    assert.equal(
      (
        await prisma.paymentAttempt.findUniqueOrThrow({
          where: { id: attempt.id },
        })
      ).status,
      "REFUND",
    );
    assert.equal(
      (
        await prisma.conferenceApplication.findUniqueOrThrow({
          where: { id: app.id },
        })
      ).paymentStatus,
      "PAID",
    );
    assert.equal(await validateOnlinePayRequest(request), "INVALID");
    const direct = await prisma.conferenceApplication.create({
      data: {
        editionId: edition.id,
        email: `direct-${suffix}@example.invalid`,
        name: "Direct settlement verification",
        phone: "9999999999",
        institution: "Test",
        professionalCategory: "PROFESSOR",
        participationCategory: "ATTENDEE",
        status: "ATTENDEE",
        paymentStatus: "UNPAID",
        paymentAmountPaise: 1000000,
        paymentToken: `direct-pay-${suffix}`,
        abstractViewToken: `direct-abs-${suffix}`,
      },
    });
    ids.push(direct.id);
    await startConferenceOnlinePay(direct, { payerUserId: payer });
    const directAttempt = await prisma.paymentAttempt.findFirstOrThrow({
      where: { applicationId: direct.id },
    });
    await applyConferenceOnlinePayCallback(
      message({
        ...fields,
        requestType: "R",
        reqId: directAttempt.requestId,
        totalAmt: "10000.00",
        transId: `DIRECT-${suffix}`,
      }),
    );
    assert.equal(
      (
        await prisma.conferenceApplication.findUniqueOrThrow({
          where: { id: direct.id },
        })
      ).paymentStatus,
      "PAID",
    );
    assert.ok(
      await prisma.paymentReceipt.findUnique({
        where: { applicationId: direct.id },
      }),
    );

    const encoded = paymentRequestUrl({
      appId: "10172",
      userId: payer,
      userName: "A + B # C",
      amountDue: 90.01,
      purpose: "Test",
      reqId: "encoded-test",
    });
    assert.ok(encoded.includes("90.01"));
    assert.ok(encoded.includes("%23"));
    assert.ok(encoded.includes("%2B"));
    console.log(
      "PASS: coupon pricing, concurrent checkout, exact payer preservation, validation mismatches, callback mismatches, direct settlement, late failures, stable receipt, refund history, and amount precision.",
    );
  } finally {
    await prisma.paymentEvent.deleteMany({
      where: { applicationId: { in: ids } },
    });
    await prisma.auditLog.deleteMany({ where: { entityId: { in: ids } } });
    await prisma.edition.delete({ where: { id: edition.id } });
    if (couponId)
      await prisma.paymentCoupon.delete({ where: { id: couponId } });
    server.close();
    await prisma.$disconnect();
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
