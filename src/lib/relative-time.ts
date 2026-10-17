/** Short human label for when a pattern was saved, e.g. "Saved yesterday". */
export function savedLabel(savedAt: number, now: number = Date.now()): string {
  const diff = now - savedAt;
  if (diff < 60_000) return "Saved just now";
  const startOfDay = (t: number) => {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const days = Math.round((startOfDay(now) - startOfDay(savedAt)) / 86_400_000);
  if (days <= 0) return "Saved today";
  if (days === 1) return "Saved yesterday";
  if (days < 7) return `Saved ${days} days ago`;
  return `Saved ${new Date(savedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`;
}
