# Registration and payments

How a delegate registers and pays for IITB INV.ENT, and what organisers set up
and watch. Rewritten in October 2026 on the pattern of the department's other
conference sites (ODTL 2026, IBS 2027 / biophy, ALD-M2M); the October 4–5
implementation described in `PAYMENT_DEPLOYMENT_20261005.md` is retired.

## The flow

```
iitbinvent.com → Log in / create account → /register (multi-step form)
  │
  ├─ Attendee only ──▶ fee due now → proforma invoice emailed → /conference/pay/<token>
  │
  └─ Paper / poster / other ──▶ abstract (title + PDF) → organisers review
                                  └─ shortlisted ─▶ fee due → proforma invoice emailed

/conference/pay/<token>   recompute amount → mint registration ID → link to OnlinePay
/api/onlinepay/validate   gateway asks "is this request valid?" → VALID / INVALID
/api/onlinepay/payack     gateway notice → ACK servlet → GatewayPayment row
                          → if confirmed: PAID, ticket, receipt email
```

- **Registration form** (`/register`, where every login lands): About you →
  Position → Participation → Abstract (skipped for attendees) → Review →
  **Complete registration**.
- **Fees** (GST inclusive, by professional category, `lib/conference.ts`):
  students / PhD / postdoc ₹5,000; faculty and other ₹10,000; industry ₹20,000.
- **Registration ID** (`sUserId` at the gateway): `<initials>_inv27_<6 digits>`,
  minted once per registration and printed on the proforma, the payment page,
  the receipt and the admin desk.
- **Proforma invoice**: emailed when the fee becomes due, with the registration
  ID, category, amount and a personal *Pay registration fee* link. Selecting a
  presenter in the admin desk sends it, carrying the organisers' message.

## Gateway rules

The **LIVE** gateway (`https://portal.iitb.ac.in/onlinepay/`) is the default.
**Testing** uses TEST app 10172 on the TEST host
(`https://newtestasc.iitb.ac.in/onlinepay_test/`), which resolves on the IITB
network only. The EC2 server cannot reach it, so testing runs on the LAN copy
(`https://www.som.iitb.ac.in/invent`, proxied to `10.127.1.23/invent`), which
can; the payer's browser must be on the IITB network too.

- The pay page links straight to `commJsp/v2_accessPoint.jsp?sMsg=…` with a fresh
  request ID per page load.
- **Validation** returns VALID only for our app ID, a registration whose fee is
  due now, and exactly that registration's amount. Anything else, including a
  registration that has already paid, is INVALID.
- **Notices** (`requestType` I, R, D) are acknowledged at
  `OnlinePayAckServlet` first. A transaction counts as **paid only when that ACK
  confirms it**; the servlet answers `FAIL` for a transaction it did not issue,
  so a hand-typed callback cannot mark anyone paid. One row per `transId` in
  `GatewayPayment`; a repeat notice never turns a recorded success into a failure.
- Reconciliation (R) alone also settles a fee, as on the reference sites. D
  notices are acknowledged and stored, and change nothing.
- A confirmed payment smaller than the amount due is recorded but does not mark
  the registration paid.

## Settings (`.env` on the server)

| Variable | Value |
| --- | --- |
| `ONLINEPAY_APP_ID` | The app ID ASC issued. Empty = checkout off. `10172` (TEST) only works with the TEST host below. |
| `ONLINEPAY_GATEWAY_URL` | Gateway base URL. Unset = LIVE. Testing: `https://newtestasc.iitb.ac.in/onlinepay_test/`. |
| `ONLINEPAY_PURPOSE` | Optional; defaults to `IITB INV.ENT conference registration`. Keep stable. |

For TEST app 10172 on the LAN copy, register:

- Validation URL: `https://www.som.iitb.ac.in/invent/api/onlinepay/validate`
- Return URL: `https://www.som.iitb.ac.in/invent/api/onlinepay/payack`

For the LIVE app on iitbinvent.com, register, with *payment request validation mandatory: Yes*:

- Validation URL: `https://iitbinvent.com/api/onlinepay/validate`
- Return URL (immediate and reconciliation): `https://iitbinvent.com/api/onlinepay/payack`

No secret is part of either URL. A notice only counts once ASC's ACK servlet
(`https://portal.iitb.ac.in/onlinepay/OnlinePayAckServlet`) confirms the
transaction, exactly as on the reference sites. The older
`/api/onlinepay/callback` paths still work and run the same handler.

## Admin → Payments

- One row per gateway transaction: participant, registration ID, amount, status,
  transaction / bank reference, reconciliation and whether the receipt was emailed.
- **Not confirmed** rows (success reported but the ACK failed, e.g. a timeout)
  have **Re-check with gateway**, which re-sends the ACK and settles the
  registration if the gateway now confirms it.
- Registrations with more than one confirmed payment are flagged for refund.
- **Download CSV** exports every transaction for reconciliation with ASC's report.
- Offline payments and waivers stay on each application's page (*Mark paid*, *Waive*).

## Checking it

`scripts/verify-payments.ts` drives registration and payment end to end against a
local server, a throwaway database and a mock gateway (setup steps at the top of
the file). It refuses to run against anything that is not local.
