import { describe, expect, it } from "vitest";
import { isTeamMember } from "@/lib/roles";

describe("team sign-in access", () => {
  it("lets admins and super admins into the team pages", () => {
    expect(isTeamMember(["admin"])).toBe(true);
    expect(isTeamMember(["super_admin"])).toBe(true);
    expect(isTeamMember(["maker", "admin"])).toBe(true);
  });

  it("keeps makers out of the team pages", () => {
    expect(isTeamMember([])).toBe(false);
    expect(isTeamMember(["maker"])).toBe(false);
  });
});
