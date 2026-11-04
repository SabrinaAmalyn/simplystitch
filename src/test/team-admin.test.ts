// ============= Full file contents =============

import { describe, expect, it } from "vitest";
import { inviteError, MIN_PASSWORD, passwordChangeError } from "@/lib/team-admin";

describe("team member invite", () => {
  it("accepts an email and a temporary password", () => {
    expect(inviteError({ email: "lea@simplystitch.app", password: "temp-pass-1" })).toBeNull();
  });

  it("rejects an invalid email address", () => {
    expect(inviteError({ email: "lea at example", password: "temp-pass-1" })).toMatch(/valid email/);
  });

  it(`asks for a temporary password of at least ${MIN_PASSWORD} characters`, () => {
    expect(inviteError({ email: "lea@simplystitch.app", password: "short" })).toMatch(/at least/);
  });
});

describe("forced password change", () => {
  it("asks for a real replacement, confirmed and different from the temporary one", () => {
    expect(passwordChangeError("", "brand-new-1", "brand-new-1")).toMatch(/temporary password/);
    expect(passwordChangeError("temp-pass-1", "short", "short")).toMatch(/at least/);
    expect(passwordChangeError("temp-pass-1", "temp-pass-1", "temp-pass-1")).toMatch(/different/);
    expect(passwordChangeError("temp-pass-1", "brand-new-1", "brand-new-2")).toMatch(/match/);
    expect(passwordChangeError("temp-pass-1", "brand-new-1", "brand-new-1")).toBeNull();
  });
});
