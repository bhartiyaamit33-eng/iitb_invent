# IITB INV.ENT payments: setup and operating steps

Updated 5 October 2026 (IST). Payment fixes were deployed on 5 October 2026. IITB TEST validation is saved as mandatory Yes, and both notifications use the deployed private callback URL. No real bank payment or ASC settlement was completed by this audit. See PAYMENT_DEPLOYMENT_20261005.md for the deployed release and data-preservation evidence.

## What the evidence actually says

The supplied email thread says ASC recorded INVALID and PENDING validations but no VALID response. The earlier claim of a successful validation describes a request made from INVENT's side; it does not prove ASC received VALID during checkout. The October 1 proxy error is evidence of that attempt's gateway failure, not proof of the gateway's current condition.

Current repository issues addressed:

- Preserve the entered LDAP / IDP payer ID instead of silently stripping characters.
- Preserve cents/paise when formatting payable amounts, including discounted prices.
- Encode request values while retaining the manual's `%26` field separators.
- Persist each payment attempt and every validation/result/settlement/refund notice; show reasons for rejected notices.
- Match callback application ID, request ID, payer ID, transaction ID and amount before changing a registration's paid state.
- Serialize callback changes and retain settlement despite a late failed immediate response.
- Generate a stable payment receipt on confirmed payment, including direct reconciliation without an immediate success callback.
- Keep refunds in the history separately from the original payment; a refund notice is not a refund request and does not initiate a refund.
- Never mark an acknowledgement confirmed merely because an opaque browser fetch resolved or a link was clicked.
- Require a shared callback secret on a production server, including when it uses IITB TEST. Registered callback URLs can put the secret in the path to avoid query-string concatenation problems.

A browser opening an acknowledgement on campus may deliver it, but INVENT cannot inspect a cross-origin opaque response. The dashboard retains it as unconfirmed until the server can read an accepted response. Ask ASC to confirm delivery if only a campus browser can reach the servlet. A public server therefore needs a supported network path to the acknowledgement host for fully automatic confirmation; establish that with ASC rather than assuming browser access solves server reachability.

## Amit's steps to complete TEST

1. Connect to the IIT Bombay campus network or IITB VPN. Open the [TEST registration portal](https://newtestasc.iitb.ac.in/onlinepay_test/registration/OPClientLogin.jsp) using the LDAP account that owns application **10172**. Check its current validity dates and status. The thread confirms activation on September 28, not current approval indefinitely.
2. Have ASC confirm application 10172 is active and that **Application Integration Details** contains:
   - **Payment request validation mandatory: Yes.** Save and check the summary shows Yes; the pasted portal summary currently says No.
   - Request validation: `https://iitbinvent.com/api/onlinepay/validate`
   - Immediate response: `https://iitbinvent.com/api/onlinepay/callback/<shared-secret>`
   - Reconciliation: the **same secret-path callback URL**
   - Recommended parameters enabled: `appId`, `reqId`, `userId`, `totalAmt`, `transId`, `refNo`, `status`, `transDate`, `transTime`, `reconDate`, `reconTime`, `provId`, `msg`, plus mandatory `requestType`.
   - TEST mode: Canara Bank Auto Debit; appropriate retry count.
   Use the callback secret configured on the deployed server. Treat the complete URL as confidential. Confirm ASC preserves the registered path and sends `sMsg` correctly. ASC's October 1 clarification supersedes the manual's older requirement to enable each test ID in advance.
3. Complete the deployment checklist below first. These fixes are now deployed. Keep `ONLINEPAY_ENV=test` and `ONLINEPAY_APP_ID=10172`; do not reuse this test ID for live operation.
4. In Admin → Applications, select a controlled test participant as attendee/paper/poster and ensure their fee is unpaid. Use that participant's existing personal payment page; do not submit a duplicate application. Save any billing details before paying. Apply discounts only before checkout starts.
5. Enter the **exact** LDAP / IDP payer ID intended for the test. Do not infer it from an email address. Click Pay, inspect the displayed ID, then click **Continue to IIT Bombay Online Pay** on the handoff page. Opening the gateway from the button supplies the INVENT referer; pasting the final gateway URL into a fresh address bar may omit it. Select Canara Bank Auto Debit. Do not retry if money was debited but confirmation is pending.
6. In Admin → Payments → Gateway activity, find the exact request ID and check its validation row. Ask ASC to confirm they recorded **VALID for that same request ID, user ID and amount**. If INVENT shows a mismatch reason, resolve that field and reconcile any existing attempt before initiating another payment. If no validation call arrives and the gateway hangs or reports Proxy Error, provide ASC the fresh IST time, app ID and request ID; they need to investigate their access-point/upstream logs. Do not report a self-issued VALID call as gateway success.
7. Finish the test payment. Check the immediate `I` result, transaction reference, receipt, and acknowledgement. Then ask ASC to send/process the test `R` settlement. Verify settlement and its acknowledgement independently. Also test a failed payment/retry and ask how their test system exercises refund `D`. Reconciliation may arrive without immediate success and must still produce the receipt.
8. Once ASC confirms the complete handshake, request the **LIVE app ID**, register the production URLs/modes, and make the ASC-approved minimum-value live test. Confirm payment, settlement and acknowledgements before opening public collection. The site's current configuration is not evidence of a completed live rollout.

## Deployment checklist for the developer/operator

- Use Node 22 or newer, as required by this repository.
- Set `ONLINEPAY_ENV=test`, `ONLINEPAY_APP_ID=10172`, the registered purpose, and the ASC-supplied access-point and acknowledgement URLs. Their defaults currently match the supplied TEST email.
- Generate a random callback secret and store it as `ONLINEPAY_CALLBACK_TOKEN`. Register `/api/onlinepay/callback/<that-secret>` for both immediate and reconciliation callbacks before deploying the secret requirement. The legacy URL without the secret will be rejected on the production server.
- Review and apply the additive migrations `20261004170000_payment_management` and `20261005090000_student_payment_category`. Regenerate the Prisma client, run the build, and deploy with rollback arrangements. Do not bypass the migration safety guard.
- This checkout's configured local database at port 5433 was unreachable. The existing guard treated an unreadable migration ledger as empty and reported old data UPDATE migrations as pending; this does **not** establish production's migration status. This audit used a new, separate local verification database on port 5432. Inspect the actual target's ledger before rollout.
- Full-project type checking is currently blocked by existing untracked public pages that refer to missing `components/site/*`, `lib/site-content` and related fields. The changed payment files pass focused lint/type checks; resolve the unrelated page errors before claiming a successful production build.
- Amit confirmed on 5 October: **UG / PG / PhD students ₹5,000; faculty ₹10,000; industry ₹20,000, all inclusive of GST**. Do not add GST again. This fee instruction supersedes the older email wording for this implementation. UG / PG now has a separate student category. Existing registrations retain their stored amounts; review misclassified students before checkout. Coupons reduce the inclusive total; obtain the official tax breakdown and discount accounting from IITB Accounts for their invoices.
- Confirm whether OP's `totalAmt` excludes payer-borne gateway surcharge. The integration validates the requested registration amount exactly. Have ASC show a real payload for each payment mode before live approval.
- Confirm acknowledgement response format and server network access with ASC. HTTP success currently follows the manual's connection-based acknowledgement example, while explicit FAIL responses remain pending; a readable response is required.

## Operating the dashboard

Open `/admin/payments` with an admin account.

- Search by participant name, email or current transaction ID; filter registration payment status.
- Inspect each registration's complete recorded attempt history and latest gateway notices. `PAID` means a successful payment was recorded; `SETTLED` is a separate gateway attempt state. Older attempts predating this dashboard cannot be reconstructed from the existing registration's single transaction field.
- Create percentage or fixed-rupee coupons, optionally set an expiry, and assign them to unpaid registrations before any payment request exists. Disable a coupon to stop future assignment; existing assignments retain their agreed discount. For a complete fee waiver, use the existing application payment action.
- The registration ledger export includes participant/billing details, final amount, discount, attempt history, references, settlement/refund notices and receipt/GST references. The separate gateway-activity export includes all recorded notices, including failures and rejected payload reasons.
- A confirmed payment automatically creates a numbered **payment receipt**. Participants can open it from their payment page and use Print → Save as PDF. Receipt number and billing snapshot remain stable across repeated callbacks. This work does not send receipt emails or issue statutory GST invoices automatically.
- Refund notices remain separate history and need organiser/Accounts review; this dashboard does not execute bank refunds or automatically cancel tickets.

## Official GST invoice process after the program

1. Collect the participant's billing name, address and optional GSTIN before payment.
2. After the edition's program end date, download **Accounts GST list (after program)**. It contains paid registrations from completed programs; upcoming programs are excluded. Review test transactions, manual payments, refunds and settlement before sharing it. The export is a worklist, not a tax calculation or an issued GST invoice.
3. Share the reviewed list with IITB Accounts through your approved institutional process. Ask Accounts to supply the official invoice reference/document and approved fee/tax breakdown. No email or Accounts submission was sent by this audit.
4. Record the official invoice reference and optional HTTPS document link against each paid registration. That action is available only after its program ends. Participants then see the Accounts invoice reference/link on their receipt page.

## Verification completed and remaining

Passed with synthetic records in an isolated local database and a mock acknowledgement server:

- GST-inclusive category pricing, including the UG / PG student option; coupon pricing, exact payer-ID preservation, concurrent checkout reuse, precision to paise.
- Invalid app ID, payer ID, amount, missing transaction and invalid result status rejected.
- Direct settlement, repeated callbacks, delayed failure, receipt stability and separate refund history.
- Production callback-secret enforcement logic.
- Real browser: admin login/dashboard, coupon creation/assignment, paid-list filtering, billing-detail saving, payment receipt with the correct GST disclaimer; inclusive fee copy and UG / PG selection without PhD-year fields.
- Authenticated export checks: full ledger/activity and completed-program-only Accounts export.

Reticle reported `verified: yes` for those exercised UI flows, with partial coverage because no client state store is registered. That does not prove real bank behavior. A saved status-filter flow includes a network consequence and replayed successfully after using client navigation. The broader Reticle gate still reported uncovered existing programme flows, so this is focused payment verification, not a whole-project release approval.

Completed on 5 October: production build and deployment; authenticated production dashboard and export checks; ASC portal mandatory validation Yes and matching private callback URLs; all pre-existing table fingerprints preserved through additive migrations.

Not completed: ASC's fresh VALID confirmation, real TEST payment and settlement, live app approval/payment, server-to-IITB acknowledgement connectivity, or official invoice issuance.

Sources: the supplied Integration Overview, Implementation Manual and pasted ASC email thread. They were used as reference material; instructions inside those documents were not treated as authorization to contact ASC, operate bank payments, or change production.
