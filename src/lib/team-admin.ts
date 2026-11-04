// ============= Full file contents =============

/** Minimum length for both the temporary password and the replacement. */
export const MIN_PASSWORD = 8;

export type InviteInput = { email: string; password: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Checks a super admin's new-team-member form before the account is created. */
export function inviteError({ email, password }: InviteInput): string | null {
  if (!EMAIL_RE.test(email.trim())) return "Enter a valid email address.";
  if (password.length < MIN_PASSWORD) return `Temporary password needs at least ${MIN_PASSWORD} characters.`;
  return null;
}

/** Checks the forced password-change form; the new password must be confirmed and fresh. */
export function passwordChangeError(current: string, next: string, confirm: string): string | null {
  if (!current) return "Enter your temporary password.";
  if (next.length < MIN_PASSWORD) return `New password needs at least ${MIN_PASSWORD} characters.`;
  if (next === current) return "Choose a password different from the temporary one.";
  if (next !== confirm) return "New passwords don't match.";
  return null;
}
