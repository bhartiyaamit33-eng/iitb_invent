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
 * ADMIN_EMAILS bootstraps the first administrator. After that, administrators
 * grant and revoke database-backed ADMIN and REVIEWER roles from `/admin/users`.
 */
export const authConfigNotes = {
  emailFrom: "conference@iitbinvent.com",
  adminEmailsEnv: "ADMIN_EMAILS",
  defaultAdmin: "admin@iitbinvent.com",
  credentialsLogin: "/login",
} as const;
