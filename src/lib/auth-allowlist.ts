/**
 * v1 access gate: while ALLOWED_EMAILS is set, only those exact addresses can
 * sign in or sign up — everyone else is rejected before hitting Supabase.
 * Leave ALLOWED_EMAILS unset to open sign-up to anyone (e.g. for a public launch).
 */

const allowedEmails = (process.env.ALLOWED_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isEmailAllowed(email: string): boolean {
  if (allowedEmails.length === 0) {
    return true;
  }
  return allowedEmails.includes(email.trim().toLowerCase());
}
