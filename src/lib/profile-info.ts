import { colourUsage } from "@/lib/maker-insights";

type PatternForProfile = {
  id: string;
  name: string;
  savedAt: number;
  config: { colors: Record<string, string | undefined> };
};

type Identity = {
  profileName?: string | null;
  metadataName?: unknown;
  email?: string | null;
};

function clean(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function titleCaseWords(words: string[]): string {
  return words
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function profileDisplayName({ profileName, metadataName, email }: Identity): string {
  const profile = clean(profileName);
  if (profile) return profile;

  const metadata = clean(metadataName);
  if (metadata) return metadata;

  const localPart = clean(email).split("@")[0] ?? "";
  const fallback = titleCaseWords(localPart.split(/[._+-]+/));
  return fallback || "Maker";
}

export function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "M";
  const first = parts[0]?.charAt(0) ?? "M";
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) ?? "" : "";
  return (first + last).toUpperCase();
}

export function isSamplePattern(id: string): boolean {
  return id === "sample-berry-bunny" || id.startsWith("sample");
}

function timeAgo(timestamp: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;

  return new Date(timestamp).toLocaleDateString("en-MY", { dateStyle: "medium" });
}

export function memberSinceLabel(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-MY", { dateStyle: "medium" }).format(date);
}

export function profileActivity<T extends { id: string; name: string; savedAt: number }>(
  patterns: T[],
  now = Date.now(),
): Array<{ id: string; what: string; when: string }> {
  return patterns
    .filter((pattern) => !isSamplePattern(pattern.id))
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, 5)
    .map((pattern) => ({
      id: pattern.id,
      what: `Saved “${pattern.name}”`,
      when: timeAgo(pattern.savedAt, now),
    }));
}

export function profileStats(
  patterns: PatternForProfile[],
  yarns: Array<{ color_id: string }>,
): {
  savedPatterns: number;
  yarnsListed: number;
  coloursUsed: number;
  topColourId: string | null;
} {
  const mine = patterns.filter((pattern) => !isSamplePattern(pattern.id));
  const usage = colourUsage(mine);
  const top = Object.entries(usage).sort((a, b) => b[1] - a[1])[0];
  return {
    savedPatterns: mine.length,
    yarnsListed: yarns.length,
    coloursUsed: Object.keys(usage).length,
    topColourId: top?.[0] ?? null,
  };
}
