// ============= Full file contents =============

export type AppRole = "maker" | "admin" | "super_admin";

/** Only admins and super admins may use the team sign-in and Team pages. */
export function isTeamMember(roles: AppRole[]) {
  return roles.includes("admin") || roles.includes("super_admin");
}

/** Team accounts are stats-only: they see maker analytics, never the pattern tools. */
export function canCreatePatterns(roles: AppRole[]) {
  return !isTeamMember(roles);
}
