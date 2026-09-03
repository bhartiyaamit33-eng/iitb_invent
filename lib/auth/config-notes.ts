/**
 * Auth.js (NextAuth v5) stub — full OAuth/UI in M3.
 * Magic-link emails go through SES (`lib/email/transactions.sendMagicLink`).
 *
 * When enabling Auth.js, use:
 *   sendVerificationRequest: async ({ identifier, url }) => {
 *     await sendMagicLink({ to: identifier, url });
 *   }
 *
 * And in callbacks/events: refuse role=ADMIN unless canHoldAdminRole(email);
 * if email is in ADMIN_EMAILS on first sign-in, set role ADMIN.
 */
export const authConfigNotes = {
  emailFrom: "conference@iitbinvent.com",
  adminEmailsEnv: "ADMIN_EMAILS",
  defaultAdmin: "admin@iitbinvent.com",
} as const;
