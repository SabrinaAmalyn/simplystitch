/** Shared close-up selection for the reader and printed booklet. */
export type PartFocus = "head" | "body" | "legs" | "arm" | "ears" | "tail" | "blush" | null;

export function focusForSection(title: string | undefined): PartFocus {
  const t = (title ?? "").toLowerCase();
  if (/ear/.test(t)) return "ears";
  if (/arm|hand/.test(t)) return "arm";
  if (/tail/.test(t)) return "tail";
  if (/body|torso/.test(t)) return "body";
  if (/leg/.test(t)) return "legs";
  if (/blush|cheek/.test(t)) return "blush";
  if (/head|face|eye|nose|mouth|whisker/.test(t)) return "head";
  return null;
}