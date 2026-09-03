/**
 * Auth.js is wired for credentials (email + password) in auth.ts.
 * Magic-link emails still go through SES (`lib/email/transactions.sendMagicLink`)
 * when email provider is enabled later.
 *
 * When adding OAuth/email providers:
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
  credentialsLogin: "/login",
} as const;
