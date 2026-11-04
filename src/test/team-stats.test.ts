// ============= Full file contents =============

import { describe, expect, it } from "vitest";
import { memberStats, teamSummary } from "@/lib/team-stats";

const colors = (c: Record<string, string>) => ({ config: { colors: c } });

const rows = () => ({
  profiles: [
    { id: "u1", display_name: "Jane", email: "jane@example.com", created_at: "2026-01-12T08:00:00Z" },
    { id: "u2", display_name: null, email: "lea@example.com", created_at: null },
  ],
  roleRows: [
    { user_id: "u1", role: "maker" },
    { user_id: "u2", role: "maker" },
    { user_id: "u2", role: "admin" },
  ],
  patterns: [
    { user_id: "u1", ...colors({ main: "peach", eyes: "charcoal" }) },
    { user_id: "u1", ...colors({ main: "peach" }) },
    { user_id: "u2", ...colors({ main: "moss" }) },
  ],
  prefs: [
    { user_id: "u1", written_terms: "US", yarn_weight: "3 Light", hook_size: "3.0 mm" },
  ],
  yarns: [{ user_id: "u1" }, { user_id: "u1" }, { user_id: "u2" }],
});

describe("memberStats", () => {
  it("reports each account's own stats from its personal data", () => {
    const members = memberStats(rows());
    const jane = members[0]!;
    const lea = members[1]!;
    expect(jane).toMatchObject({
      displayName: "Jane",
      patternCount: 2,
      writtenTerms: "US",
      yarnWeight: "3 Light",
      hookSize: "3.0 mm",
      yarnsListed: 2,
    });
    expect(jane.topColours[0]).toEqual(["peach", 2]);
    expect(lea).toMatchObject({ patternCount: 1, yarnsListed: 1, writtenTerms: null, createdAt: null });
    expect(jane.createdAt).toBe("2026-01-12T08:00:00Z");
  });
});

describe("teamSummary", () => {
  it("totals patterns and preferences across every maker", () => {
    const summary = teamSummary(memberStats(rows()), rows().patterns);
    expect(summary).toMatchObject({ accounts: 2, admins: 1, superAdmins: 0, patterns: 3 });
    expect(summary.topColours[0]).toEqual(["peach", 2]);
    expect(summary.writtenTerms).toEqual({ US: 1 });
  });
});
