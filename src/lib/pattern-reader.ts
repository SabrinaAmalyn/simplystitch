// Parses pattern text (generated or edited — the text is the source of truth) into
// a structured, read-only model for the interactive reader. Never alters content.

export type ReaderRow = { key: string; badge: string; text: string; count?: number | undefined };
export type ReaderItem =
  | { kind: "row"; row: ReaderRow }
  | { kind: "group"; key: string; badge: string; text: string; count?: number | undefined; rows: ReaderRow[] }
  | { kind: "note"; text: string }
  | { kind: "text"; text: string }
  | { kind: "list"; items: string[] };
export type ReaderSection = { id: string; title: string; yarn?: string | undefined; items: ReaderItem[]; trackable: boolean; parent?: string | undefined };
export type ReaderDoc = { title: string; sections: ReaderSection[] };

const slug = (s: string, i: number) => `sec-${i}-${s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
const ROUND = /^(R\d+(?:\s*[–-]\s*R?\d+)?|Join|Round \d+(?:\s*[–-]\s*\d+)?):\s(.*)$/i;
const RANGE = /^(R|Round )?(\d+)\s*[–-]\s*(?:R)?(\d+)$/i;

/** Returns the individual round numbers for a range label like "R4–R6", else null. */
export function expandRange(label: string): number[] | null {
  const m = label.trim().match(RANGE);
  if (!m?.[2] || !m[3]) return null;
  const a = +m[2], b = +m[3];
  if (b <= a || b - a > 60) return null;
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

function splitCount(text: string): { text: string; count?: number | undefined } {
  const m = text.match(/^(.*?)\s*\((\d+)\)\s*$/);
  return m?.[1] && m[2] ? { text: m[1], count: +m[2] } : { text };
}

const badgeOf = (label: string) => label.replace(/^R(?=\d)/i, "").replace(/\s*[–-]\s*R?/i, "–").replace(/^Round /i, "");

export function parsePatternText(src: string): ReaderDoc {
  const lines = src.split("\n");
  let title = "Pattern";
  const sections: ReaderSection[] = [];
  // No Introduction section: lines before the first "## " heading (title line,
  // draft banner, etc.) are skipped, not collected into a leading section.
  let cur: ReaderSection | null = null;
  const push = (item: ReaderItem) => {
    if (!cur) return;
    const last = cur.items[cur.items.length - 1];
    if (item.kind === "list" && last?.kind === "list") last.items.push(...item.items);
    else cur.items.push(item);
  };

  for (const raw of lines) {
    const l = raw.trimEnd();
    if (!l.trim()) continue;
    if (l.startsWith("# ")) { title = l.slice(2).trim(); continue; }
    if (l.startsWith("## ")) {
      const h = l.slice(3).trim();
      const [name = "", yarn] = h.split(/\s+—\s+yarn:\s+/);
      const meta = /^(materials|abbreviations|measurements|introduction)$/i.test(name.trim());
      const assembly = /^assembly/i.test(name.trim());
      const sec: ReaderSection = { id: slug(name, sections.length), title: name.trim(), items: [], trackable: !meta };
      if (yarn !== undefined) sec.yarn = yarn;
      if (!meta && !assembly) sec.parent = "Instructions";
      cur = sec;
      sections.push(cur);
      continue;
    }
    const note = l.match(/^Note:\s*(.*)$/i);
    if (note) { push({ kind: "note", text: note[1] ?? "" }); continue; }
    if (/^DRAFT/.test(l)) { push({ kind: "note", text: l }); continue; }
    const bullet = l.match(/^[-*]\s+(.*)$/);
    if (bullet) { push({ kind: "list", items: [bullet[1] ?? ""] }); continue; }
    const r = l.match(ROUND);
    if (r && cur?.trackable) {
      const label = (r[1] ?? "").trim();
      const { text, count } = splitCount(r[2] ?? "");
      const nums = expandRange(label);
      const base = `${cur!.id}:${label}`;
      if (nums) {
        push({ kind: "group", key: base, badge: badgeOf(label), text, count, rows: nums.map((n) => ({ key: `${base}:${n}`, badge: String(n), text, count })) });
      } else push({ kind: "row", row: { key: base, badge: badgeOf(label), text, count } });
      continue;
    }
    const step = l.match(/^(\d+)\.\s+(.*)$/);
    if (step) {
      if (cur?.trackable) push({ kind: "row", row: { key: `${cur.id}:step${step[1]}`, badge: step[1] ?? "", text: step[2] ?? "" } });
      else push({ kind: "list", items: [`${step[1] ?? ""}. ${step[2] ?? ""}`] });
      continue;
    }
    push({ kind: "text", text: l });
  }
  return { title, sections: sections.filter((s) => s.items.length) };
}

/** Every completable row key in a section (group children, not the group itself). */
export function sectionRowKeys(s: ReaderSection): string[] {
  return s.items.flatMap((i) => (i.kind === "row" ? [i.row.key] : i.kind === "group" ? i.rows.map((r) => r.key) : []));
}

export type SectionSlice = { headingIndex: number; bodyStart: number; end: number };

/** Slices of raw text owned by each "## " section, in heading order (body excludes the heading line). */
export function sectionSlices(src: string): SectionSlice[] {
  const lines = src.split("\n");
  const slices: SectionSlice[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("## ")) continue;
    const prev = slices[slices.length - 1];
    if (prev) prev.end = i;
    slices.push({ headingIndex: slices.length, bodyStart: i + 1, end: lines.length });
  }
  return slices;
}

const trimBlank = (lines: string[]) => {
  let a = 0, b = lines.length;
  while (a < b && !lines[a]?.trim()) a++;
  while (b > a && !lines[b - 1]?.trim()) b--;
  return lines.slice(a, b);
};

/** The editable body lines of one section (heading order index), blank edges removed. */
export function sectionBody(src: string, headingIndex: number): string {
  const s = sectionSlices(src)[headingIndex];
  if (!s) return "";
  return trimBlank(src.split("\n").slice(s.bodyStart, s.end)).join("\n");
}

/** Replaces one section's body, keeping the heading and every other section byte-identical. */
export function withSectionBody(src: string, headingIndex: number, body: string): string {
  const s = sectionSlices(src)[headingIndex];
  if (!s) return src;
  const lines = src.split("\n");
  const next = [...lines.slice(0, s.bodyStart), ...trimBlank(body.split("\n")), ""];
  const tail = trimBlank(lines.slice(s.end));
  return [...next, ...tail].join("\n");
}
