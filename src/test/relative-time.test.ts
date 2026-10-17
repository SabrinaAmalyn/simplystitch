import { describe, expect, it } from "vitest";
import { savedLabel } from "@/lib/relative-time";

const now = new Date(2026, 9, 18, 12, 0, 0).getTime();
describe("savedLabel", () => {
  it("just now under a minute", () => expect(savedLabel(now - 10_000, now)).toBe("Saved just now"));
  it("today", () => expect(savedLabel(now - 3 * 3_600_000, now)).toBe("Saved today"));
  it("yesterday", () => expect(savedLabel(now - 24 * 3_600_000, now)).toBe("Saved yesterday"));
  it("days ago", () => expect(savedLabel(now - 3 * 86_400_000, now)).toBe("Saved 3 days ago"));
});
