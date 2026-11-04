import { describe, expect, it } from "vitest";
import {
  memberSinceLabel,
  profileActivity,
  profileDisplayName,
  profileInitials,
  profileStats,
} from "@/lib/profile-info";

const NOW = Date.UTC(2026, 10, 4, 12);

describe("maker profile information", () => {
  it("uses the saved account display name before sign-up metadata and email", () => {
    expect(
      profileDisplayName({
        profileName: "Sabrina Rizal",
        metadataName: "Ignored",
        email: "ignored@example.com",
      }),
    ).toBe("Sabrina Rizal");
  });

  it("falls back to sign-up metadata, then a readable email name", () => {
    expect(profileDisplayName({ metadataName: "Sabrina", email: "ignored@example.com" })).toBe("Sabrina");
    expect(profileDisplayName({ email: "sabrina.rizal@example.com" })).toBe("Sabrina Rizal");
  });

  it("makes initials from the actual displayed name", () => {
    expect(profileInitials("Sabrina Rizal")).toBe("SR");
    expect(profileInitials("Sabrina")).toBe("S");
    expect(profileInitials("sabrina.rizal@example.com")).toBe("S");
  });

  it("counts saved patterns, listed yarns, colours used, and the most-used colour", () => {
    const patterns = [
      {
        id: "sample-berry-bunny",
        name: "Sample",
        savedAt: NOW,
        config: { colors: { main: "peach" } },
      },
      {
        id: "p1",
        name: "Fox",
        savedAt: NOW - 1000,
        config: { colors: { main: "cream", body: "grey" } },
      },
      {
        id: "p2",
        name: "Bear",
        savedAt: NOW - 2000,
        config: { colors: { main: "cream" } },
      },
    ];

    expect(profileStats(patterns, [{ color_id: "cream" }])).toEqual({
      savedPatterns: 2,
      yarnsListed: 1,
      coloursUsed: 2,
      topColourId: "cream",
    });
  });

  it("shows actual recent activity and excludes sample patterns", () => {
    const patterns = [
      { id: "sample-berry-bunny", name: "Sample", savedAt: NOW - 1000 },
      { id: "a", name: "Fox", savedAt: NOW - 2 * 86_400_000 },
      { id: "b", name: "Bear", savedAt: NOW - 60 * 60_000 },
    ];

    expect(profileActivity(patterns, NOW)).toEqual([
      { id: "b", what: "Saved “Bear”", when: "1 hour ago" },
      { id: "a", what: "Saved “Fox”", when: "2 days ago" },
    ]);
  });

  it("keeps the member-since label readable", () => {
    expect(memberSinceLabel("2026-11-04T00:00:00Z")).toMatch(/2026/);
    expect(memberSinceLabel(null)).toBe("—");
  });
});
