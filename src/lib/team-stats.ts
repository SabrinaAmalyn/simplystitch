// ============= Full file contents =============

import { colourUsage } from "@/lib/maker-insights";

export type ProfileRow = { id: string; display_name: string | null; email: string | null };
export type RoleRow = { user_id: string; role: string };
export type PatternRow = { user_id: string; config: { colors: Record<string, string | undefined> } };
export type PrefsRow = { user_id: string; written_terms: string; yarn_weight: string; hook_size: string };
export type YarnRow = { user_id: string };

export type MemberStats = {
  id: string;
  displayName: string | null;
  email: string | null;
  roles: string[];
  patternCount: number;
  topColours: Array<[string, number]>;
  writtenTerms: string | null;
  yarnWeight: string | null;
  hookSize: string | null;
  yarnsListed: number;
};

const sorted = (tally: Record<string, number>): Array<[string, number]> =>
  Object.entries(tally).sort((a, b) => b[1] - a[1]);

/** Each account's own profile numbers: saved patterns, colours and stitching preferences. */
export function memberStats(rows: {
  profiles: ProfileRow[];
  roleRows: RoleRow[];
  patterns: PatternRow[];
  prefs: PrefsRow[];
  yarns: YarnRow[];
}): MemberStats[] {
  return rows.profiles.map((p) => {
    const patterns = rows.patterns.filter((x) => x.user_id === p.id);
    const prefs = rows.prefs.find((x) => x.user_id === p.id);
    return {
      id: p.id,
      displayName: p.display_name,
      email: p.email,
      roles: rows.roleRows.filter((r) => r.user_id === p.id).map((r) => r.role),
      patternCount: patterns.length,
      topColours: sorted(colourUsage(patterns)).slice(0, 5),
      writtenTerms: prefs?.written_terms ?? null,
      yarnWeight: prefs?.yarn_weight ?? null,
      hookSize: prefs?.hook_size ?? null,
      yarnsListed: rows.yarns.filter((y) => y.user_id === p.id).length,
    };
  });
}

export type TeamSummary = {
  accounts: number;
  admins: number;
  superAdmins: number;
  patterns: number;
  topColours: Array<[string, number]>;
  writtenTerms: Record<string, number>;
  yarnWeights: Record<string, number>;
  hookSizes: Record<string, number>;
};

const count = (values: Array<string | null>) => {
  const tally: Record<string, number> = {};
  for (const v of values) if (v) tally[v] = (tally[v] ?? 0) + 1;
  return tally;
};

/** Aggregates across every maker account, for the team console. */
export function teamSummary(members: MemberStats[], patterns: PatternRow[]): TeamSummary {
  return {
    accounts: members.length,
    admins: members.filter((m) => m.roles.includes("admin")).length,
    superAdmins: members.filter((m) => m.roles.includes("super_admin")).length,
    patterns: patterns.length,
    topColours: sorted(colourUsage(patterns)).slice(0, 8),
    writtenTerms: count(members.map((m) => m.writtenTerms)),
    yarnWeights: count(members.map((m) => m.yarnWeight)),
    hookSizes: count(members.map((m) => m.hookSize)),
  };
}
