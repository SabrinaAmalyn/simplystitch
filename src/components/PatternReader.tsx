import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronDown, CircleHelp, Info, Pencil } from "lucide-react";
import { CharacterPreview, type PartFocus } from "@/components/CharacterPreview";
import type { CharacterConfig } from "@/lib/character";
import { parsePatternText, sectionBody, sectionRowKeys, withSectionBody, type ReaderItem, type ReaderRow, type ReaderSection } from "@/lib/pattern-reader";
import { resetProgress, toggleRows, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
  text: string; config: CharacterConfig; progressKey: string; name?: string | undefined;
  header?: ReactNode;
  /** Called with the full pattern text after one section's body is edited. */
  onTextChange?: (text: string) => void;
  /** Primary action placed in the preview's bottom-right corner. */
  previewAction?: ReactNode;
  /** Secondary action placed in the preview's bottom-left corner. */
  previewBack?: ReactNode;
  /** Pattern-name field placed in the preview's top-left corner. */
  previewName?: ReactNode;
};

/** Which single crochet piece a pattern section makes. */
export function focusForSection(title: string | undefined): PartFocus {
  const t = (title ?? "").toLowerCase();
  if (/ear/.test(t)) return "ears";
  if (/arm|hand/.test(t)) return "arm";
  if (/tail/.test(t)) return "tail";
  if (/leg|body|torso/.test(t)) return "body";
  if (/head|face|blush|cheek|eye|nose|mouth|whisker/.test(t)) return "head";
  return null;
}

export function PatternReader({ text, config, progressKey, name, header, onTextChange, previewAction, previewBack, previewName }: Props) {
  const doc = useMemo(() => parsePatternText(text), [text]);
  const doneList = useStore((s) => s.progress?.[progressKey]);
  const done = useMemo(() => new Set(doneList ?? []), [doneList]);
  const meta = doc.sections.filter((s) => !s.parent && !/^assembly/i.test(s.title));
  const parts = doc.sections.filter((s) => s.parent);
  const assembly = doc.sections.filter((s) => /^assembly/i.test(s.title));
  const [tab, setTab] = useState<"materials" | "instructions" | "assembly">(parts.length ? "instructions" : "materials");
  const [editId, setEditId] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [partId, setPartId] = useState(parts[0]?.id);
  const part = parts.find((p) => p.id === partId) ?? parts[0];
  const groups = useMemo(() => groupParts(parts), [parts]);
  const activeGroup = groups.find((g) => g.parts.some((p) => p.id === part?.id)) ?? groups[0];

  const allKeys = useMemo(() => doc.sections.flatMap(sectionRowKeys), [doc]);
  const completed = allKeys.filter((k) => done.has(k)).length;
  const toggle = (keys: string[], value: boolean) => toggleRows(progressKey, keys, value);

  const pick = (t: "materials" | "instructions" | "assembly") => { setTab(t); setEditId(null); };
  const tabs: ["materials" | "instructions" | "assembly", string, boolean][] = [
    ["materials", "Materials", meta.length > 0],
    ["instructions", "Instructions", parts.length > 0],
    ["assembly", "Assembly", assembly.length > 0],
  ];
  const shown = tab === "materials" ? meta : tab === "assembly" ? assembly : tab === "instructions" && part ? [part] : [];
  const focus = tab === "instructions" ? focusForSection(part?.title) : null;
  const label = tab === "instructions" ? part?.title : tab === "assembly" ? "Assembled doll" : "Finished doll";

  return (
    <div className="pattern-workspace">
      {header}
      <div className="review-layout">
        <section className="review-preview" aria-label="Piece preview">
          {previewName && <div className="review-preview-name">{previewName}</div>}
          <div className="review-preview-label">
            <span className="truncate text-sm font-semibold">{label}</span>
            {name && <span className="truncate text-xs text-muted-foreground">{name}</span>}
          </div>
          <div className="review-canvas"><CharacterPreview config={config} focus={focus} /></div>
          <Button variant="outline" size="icon" className="review-guide-fab" aria-label="Pattern writing guide" title="How to write rounds when editing" onClick={() => setGuideOpen(true)}>
            <CircleHelp size={18} />
          </Button>
          {(previewBack || previewAction) && (
            <div className="review-preview-bar">
              {previewBack}
              {previewAction}
            </div>
          )}
        </section>
        <section className="review-content">
          <nav className="category-nav review-category-nav" role="tablist" aria-label="Pattern categories" style={{ gridTemplateColumns: `repeat(${tabs.filter(([, , on]) => on).length}, minmax(0, 1fr)) auto` }}>
            {tabs.filter(([, , on]) => on).map(([id, text]) => (
              <Button key={id} variant="ghost" role="tab" aria-selected={tab === id} className={`category-tab ${tab === id ? "category-active" : ""}`} onClick={() => pick(id)}>{text}</Button>
            ))}
            <Button variant="ghost" size="icon" className="review-guide-btn" aria-label="Pattern writing guide" title="How to write rounds when editing" onClick={() => setGuideOpen(true)}>
              <CircleHelp size={16} />
            </Button>
          </nav>
          {tab === "instructions" && groups.length > 1 && (
            <nav className="subcategory-nav" role="tablist" aria-label="Pattern groups">
              {groups.map((g) => (
                <Button key={g.id} variant="ghost" role="tab" aria-selected={activeGroup?.id === g.id} className={`subcategory-tab ${activeGroup?.id === g.id ? "subcategory-active" : ""}`} onClick={() => { setPartId(g.parts[0]?.id); setEditId(null); }}>{g.label}</Button>
              ))}
            </nav>
          )}
          {tab === "instructions" && activeGroup && activeGroup.parts.length > 1 && (
            <nav className="subcategory-nav piece-nav" role="tablist" aria-label="Pattern pieces">
              {activeGroup.parts.map((p) => (
                <Button key={p.id} variant="ghost" role="tab" aria-selected={part?.id === p.id} className={`subcategory-tab ${part?.id === p.id ? "subcategory-active" : ""}`} onClick={() => { setPartId(p.id); setEditId(null); }}>{shortTitle(p.title)}</Button>
              ))}
            </nav>
          )}
          <div className="review-body">
            <article className="reader-instructions">
              {shown.map((s) => {
                const idx = Number(s.id.match(/^sec-(\d+)-/)?.[1]);
                return (
                  <SectionView
                    key={s.id + (editId === s.id ? ":edit" : "")}
                    s={s}
                    done={done}
                    toggle={toggle}
                    editing={editId === s.id}
                    initialBody={Number.isFinite(idx) ? sectionBody(text, idx) : ""}
                    onStart={() => setEditId(s.id)}
                    onDone={() => setEditId(null)}
                    onChange={(body) => { if (Number.isFinite(idx)) onTextChange?.(withSectionBody(text, idx, body)); }}
                  />
                );
              })}
              {completed > 0 && (
                <Button variant="ghost" className="self-start text-sm" onClick={() => confirm("Clear all row progress for this pattern?") && resetProgress(progressKey)}>Clear progress</Button>
              )}
            </article>
          </div>
          <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>How to write your pattern</DialogTitle>
                <DialogDescription>Follow this format when you edit a section so your rounds stay tickable and the stitch counts keep working.</DialogDescription>
              </DialogHeader>
              <dl className="flex flex-col gap-3 text-sm">
                <div>
                  <dt className="font-semibold">R4: 2 sc, inc (24)</dt>
                  <dd className="text-muted-foreground">One round per line. Start with the round number, a colon, then the stitches. End with the total stitch count in brackets — that's what makes the round tickable.</dd>
                </div>
                <div>
                  <dt className="font-semibold">R5: (2 sc, inc) × 6 (24)</dt>
                  <dd className="text-muted-foreground">Put a repeated sequence in brackets with × and how many times. The count in brackets at the end is what you should have when the round finishes.</dd>
                </div>
                <div>
                  <dt className="font-semibold">R6–R8: sc around (24)</dt>
                  <dd className="text-muted-foreground">Use a dash to group identical rounds into one line — they become a collapsible group with a tick for each round.</dd>
                </div>
                <div>
                  <dt className="font-semibold">MR, sc, inc, dec, ch, st</dt>
                  <dd className="text-muted-foreground">Magic ring, single crochet, increase (2 sc in one stitch), decrease (2 stitches together), chain, stitch.</dd>
                </div>
                <div>
                  <dt className="font-semibold">Lines without R numbers</dt>
                  <dd className="text-muted-foreground">Anything else — like "Stuff firmly" or "Fasten off" — shows as a plain note under the rounds.</dd>
                </div>
              </dl>
            </DialogContent>
          </Dialog>
        </section>
      </div>
    </div>
  );
}

const GROUPS = [
  { id: "body", label: "Body", test: /head|leg|body|torso|arm|hand/i },
  { id: "ears", label: "Ears", test: /ear/i },
  { id: "tail", label: "Tail", test: /tail/i },
  { id: "face", label: "Face", test: /blush|cheek|face|eye|nose|mouth|whisker|brow/i },
];

/** Groups pieces like the customizer categories; unmatched pieces get an "Other" group. */
export function groupParts<T extends { title: string }>(parts: T[]) {
  const out: { id: string; label: string; parts: T[] }[] = [];
  for (const p of parts) {
    const t = p.title;
    const g = /ear/i.test(t) ? GROUPS[1]! : /tail/i.test(t) ? GROUPS[2]! : GROUPS.find((x) => x.test.test(t)) ?? { id: "other", label: "Other" };
    let bucket = out.find((b) => b.id === g.id);
    if (!bucket) out.push((bucket = { id: g.id, label: g.label, parts: [] }));
    bucket.parts.push(p);
  }
  return out;
}

const shortTitle = (t: string) => t.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s*[—–-].*$/, "").trim() || t;

type SectionEditProps = {
  s: ReaderSection; done: Set<string>; toggle: (k: string[], v: boolean) => void;
  editing: boolean; initialBody: string; onStart: () => void; onDone: () => void; onChange: (body: string) => void;
};

function SectionView({ s, done, toggle, editing, initialBody, onStart, onDone, onChange }: SectionEditProps) {
  const [draft, setDraft] = useState(initialBody);
  return (
    <section id={s.id} className="reader-section">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold">{s.title}</h2>
        <Button variant="ghost" size="icon" className="reader-edit-btn shrink-0" aria-label={editing ? `Done editing ${s.title}` : `Edit ${s.title}`} aria-pressed={editing} title={editing ? "Done editing" : "Edit this section"} onClick={editing ? onDone : onStart}>
          <Pencil size={16} />
        </Button>
      </div>
      {editing ? (
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            aria-label={`Edit ${s.title}`}
            className="min-h-[30vh] w-full resize-y rounded-lg border border-border bg-background p-4 font-sans text-base leading-relaxed outline-none focus:ring-2 focus:ring-ring"
            value={draft}
            onChange={(e) => { setDraft(e.target.value); onChange(e.target.value); }}
          />
          <Button variant="outline" className="self-start" onClick={onDone}>Done</Button>
        </div>
      ) : (
        <div className="mt-3 flex flex-col">
          {s.yarn && (
            <div className="reader-note">
              <Info size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <p><span className="font-semibold">Yarn:</span> {s.yarn}</p>
            </div>
          )}
          {s.items.map((item, i) => <ItemView key={i} item={item} done={done} toggle={toggle} />)}
        </div>
      )}
    </section>
  );
}

export function ItemView({ item, done, toggle, current }: { item: ReaderItem; done: Set<string>; toggle: (k: string[], v: boolean) => void; current?: string | undefined }) {
  const [open, setOpen] = useState(false);
  const hasCurrent = item.kind === "group" && item.rows.some((r) => r.key === current);
  if (item.kind === "note")
    return (
      <div className="reader-note">
        <Info size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
        <p>{item.text}</p>
      </div>
    );
  if (item.kind === "text") return <p className="py-1 leading-relaxed">{item.text}</p>;
  if (item.kind === "list")
    return (
      <ul className="flex flex-col gap-1">
        {item.items.map((t, i) => <li key={i} className="py-1.5 leading-relaxed">{t}</li>)}
      </ul>
    );
  if (item.kind === "row") return <RowView row={item.row} current={current === item.row.key} done={done.has(item.row.key)} onToggle={(v) => toggle([item.row.key], v)} />;

  const keys = item.rows.map((r) => r.key);
  const n = keys.filter((k) => done.has(k)).length;
  const all = n === keys.length;
  return (
    <div className={open ? "rounded-lg bg-primary/5" : ""}>
      <div className={`reader-row ${all ? "reader-row-done" : ""} ${hasCurrent && !open ? "reader-row-current" : ""}`}>
        <Button variant="ghost" className="reader-badge flex items-center gap-1" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={`${open ? "Hide" : "Show"} rounds ${item.badge}`}>
          {item.badge}
          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </Button>
        <Button variant="ghost" className="reader-group-toggle" aria-pressed={all} onClick={() => toggle(keys, !all)}>
          <span className="reader-text flex-1">{item.text}{item.count !== undefined && <span className="reader-count"> ({item.count})</span>}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{n}/{keys.length}</span>
        </Button>
      </div>
      {open && <div className="reader-subrounds">{item.rows.map((r) => <RowView key={r.key} row={r} current={current === r.key} done={done.has(r.key)} onToggle={(v) => toggle([r.key], v)} />)}</div>}
    </div>
  );
}

export function RowView({ row, done, onToggle, current }: { row: ReaderRow; done: boolean; onToggle: (v: boolean) => void; current?: boolean }) {
  return (
    <Button variant="ghost" className={`reader-row w-full text-left ${done ? "reader-row-done" : ""} ${current ? "reader-row-current" : ""}`} aria-current={current ? "step" : undefined} aria-label={`Round ${row.badge}: ${row.text}${done ? ", completed" : ""}`} onClick={() => onToggle(!done)} aria-pressed={done}>
      <span className="reader-badge">{done ? <Check size={14} /> : row.badge}</span>
      <span className="reader-text flex-1">{row.text}{row.count !== undefined && <span className="reader-count"> ({row.count})</span>}</span>
    </Button>
  );
}
