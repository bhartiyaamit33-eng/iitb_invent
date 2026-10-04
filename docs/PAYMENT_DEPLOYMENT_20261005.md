# Payment deployment — 5 October 2026 (IST)

The payment fixes are deployed on iitbinvent.com. The release was built from the live server's source so its newer public layout and existing integration formats were preserved. Local unfinished public pages were not deployed.

## Data preservation

- Backed up the PostgreSQL database before changes, saved copies of server environment configuration and source, and retained previous compiled application and Prisma client artifacts.
- Off-server backup copy: `/tmp/invent-release-20261005/pre-payment.dump`, SHA-256 `16ee5c1331bb6e399333dff01088a0270a8e71896aa429b44636189d18a0c946`.
- Restored the initial backup into the separate server database `invent_backup_verify_20261005`: 223 users and 45 applications matched the live baseline.
- Fingerprinted all 24 pre-existing tables, including every pre-existing column, while the app was stopped. After the two additive migrations, every count and record fingerprint matched. A further pre-restart comparison of all 28 tables also passed.
- Applied only `20261004170000_payment_management` and `20261005090000_student_payment_category`; no seed, reset, bulk repricing, or application-data deletion was run.
- New submissions and payment attempts can legitimately change counts after the website resumes. The preservation verdict applies to the migration window, not later user activity.

Server recovery materials are in `/home/ec2-user/invent-backups/`. The successful rollout snapshot is `pre-rollout-20261004T204727Z.dump` (UTC filename; 5 October IST). The later HTTP compatibility rollout created an additional `pre-http-fix-*.dump`.

## ₹3,000 and ₹5,000 links

The same account had a 10 September ₹3,000 notification and a 17 September ₹5,000 notification. Both referred to application tokens no longer present in the live database. The old ₹3,000 default was historical; no current application had that amount at deployment.

Historical notification bodies are retained unchanged in the database. The dashboard labels payment notices as history and removes their payment actions. The current registration card remains the authoritative fee and payment link. Confirmed current inclusive totals: UG/PG/PhD ₹5,000, faculty ₹10,000, industry ₹20,000. Existing registrations were not bulk repriced.

## Gateway configuration

- Online Pay remains TEST, app ID 10172, IITB_MAIN. No switch to real-money LIVE collection.
- Saved mandatory validation Yes in the authenticated ASC portal.
- Registered the same private callback path for payment and settlement; it matches the server callback token. The secret is deliberately absent from this report.
- Preserved JSON Records, JSON sMsg, form and query request handling. Immediate notices with surcharge fields are not misclassified as settlement.
- Payer-ID conflicts now show specific guidance and prefill the original payer ID. Existing requests are preserved; incorrect IDs require organiser/ASC reconciliation before starting another request.

## Checks and boundaries

Production build passed on Node 22. Authenticated production requests for `/admin/payments`, `/admin/applications`, `/dashboard` and the ledger export returned 200 with expected page evidence. Public research fees show GST included; the legacy callback without the token returns 403.

Reticle reported verified yes locally for historical notices without payment actions, the current payment page showing ₹5,000, and conflict guidance with original ID prefill. Local synthetic lifecycle tests passed, including coupons, exact identity/amount checks, repeated callbacks, direct settlement, receipts and refund history. Reticle coverage is partial; no client store is registered.

Not established: ASC receiving a fresh VALID request, actual TEST bank completion, settlement, or confirmed acknowledgement delivery from EC2 to IITB's private network. Users must complete a campus/VPN TEST payment and ASC settlement before requesting LIVE credentials.

Automatic documents are payment receipts. Official GST invoices remain with IITB Accounts after the program ends. The dashboard prepares an Accounts export but does not send it.

## Recovery

Retain previous compiled builds and generated Prisma clients. An application rollback should use matching prior build/client/configuration and coordinate the callback registration with ASC. The new database tables and enum can remain; do not reset or reverse the database merely to roll back application code. Restore a whole database snapshot only after reviewing any submissions received after that snapshot.

The server has less than 1 GB free after retaining rollback builds. Future build/deployment planning must account for that space; database and uploaded content were not removed to make room.
