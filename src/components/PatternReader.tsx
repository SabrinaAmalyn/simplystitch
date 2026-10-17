import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, Info, Menu, X } from "lucide-react";
import { CharacterPreview } from "@/components/CharacterPreview";
import type { CharacterConfig } from "@/lib/character";
import { parsePatternText, sectionRowKeys, type ReaderItem, type ReaderRow, type ReaderSection } from "@/lib/pattern-reader";
import { resetProgress, toggleRows, useStore } from "@/lib/store";

type Props = { text: string; config: CharacterConfig; progressKey: string; name?: string };

export function PatternReader({ text, config, progressKey, name }: Props) {
  const doc = useMemo(() => parsePatternText(text), [text]);
  const doneList = useStore((s) => s.progress?.[progressKey]);
  const done = useMemo(() => new Set(doneList ?? []), [doneList]);
  const [showPreview, setShowPreview] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [active, setActive] = useState(doc.sections[0]?.id);

  const allKeys = useMemo(() => doc.sections.flatMap(sectionRowKeys), [doc]);
  const total = allKeys.length;
  const completed = allKeys.filter((k) => done.has(k)).length;

  useEffect(() => {
    const els = doc.sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [doc]);

  const go = (id: string) => {
    setDrawer(false);
    setActive(id);
    setCollapsed((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };
  const toggleCollapse = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggle = (keys: string[], value: boolean) => toggleRows(progressKey, keys, value);

  const meta = doc.sections.filter((s) => !s.parent && !/^assembly/i.test(s.title));
  const parts = doc.sections.filter((s) => s.parent);
  const assembly = doc.sections.filter((s) => /^assembly/i.test(s.title));

  return (
    <div className="flex flex-col gap-4">
      <section className="panel">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-xl font-semibold">{name || doc.title}</h2>
            {name && <p className="truncate text-sm text-muted-foreground">{doc.title}</p>}
          </div>
          <button className="btn-ghost shrink-0" onClick={() => setShowPreview((v) => !v)} aria-expanded={showPreview}>
            {showPreview ? <ChevronUp size={16} /> : <ChevronDown size={16} />} {showPreview ? "Hide character" : "Show character"}
          </button>
        </div>
        {showPreview && <div className="mt-3 h-64 w-full md:h-80"><CharacterPreview config={config} /></div>}
      </section>

      <div className="reader-bar">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Project progress</span>
            <span className="text-muted-foreground">{completed}/{total} rows</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed}>
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${total ? (completed / total) * 100 : 0}%` }} />
          </div>
        </div>
        <button className="btn-ghost shrink-0" onClick={() => setDrawer(true)} aria-label="Open pattern sections"><Menu size={18} /> Go to</button>
      </div>

      <article className="panel flex flex-col gap-8">
        {doc.sections.map((s) => (
          <SectionView key={s.id} s={s} done={done} toggle={toggle} />
        ))}
        {completed > 0 && (
          <button className="btn-ghost self-start text-sm" onClick={() => confirm("Clear all row progress for this pattern?") && resetProgress(progressKey)}>Clear progress</button>
        )}
      </article>

      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30" onClick={() => setDrawer(false)}>
          <nav className="flex h-full w-[min(22rem,90vw)] flex-col overflow-y-auto border-l border-border bg-card p-4" onClick={(e) => e.stopPropagation()} aria-label="Pattern sections">
            <div className="mb-3 flex items-center justify-between gap-2 border-b border-border pb-3">
              <h3 className="font-display text-lg font-semibold">{name || doc.title}</h3>
              <button className="btn-ghost" onClick={() => setDrawer(false)} aria-label="Close"><X size={18} /></button>
            </div>
            {meta.map((s) => <NavItem key={s.id} s={s} active={active === s.id} onGo={go} done={done} />)}
            {parts.length > 0 && <p className="mt-2 px-3 py-2 text-sm font-semibold">Instructions</p>}
            {parts.map((s) => <NavItem key={s.id} s={s} active={active === s.id} onGo={go} done={done} indent />)}
            {assembly.map((s) => <NavItem key={s.id} s={s} active={active === s.id} onGo={go} done={done} />)}
          </nav>
        </div>
      )}
    </div>
  );
}

function NavItem({ s, active, onGo, done, indent }: { s: ReaderSection; active: boolean; onGo: (id: string) => void; done: Set<string>; indent?: boolean }) {
  const keys = sectionRowKeys(s);
  const n = keys.filter((k) => done.has(k)).length;
  return (
    <button
      onClick={() => onGo(s.id)}
      aria-current={active ? "true" : undefined}
      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm ${indent ? "pl-7" : ""} ${active ? "bg-primary/15 font-semibold text-foreground" : "hover:bg-muted"}`}
    >
      <span>{s.title}</span>
      {keys.length > 0 && <span className="text-xs text-muted-foreground">{n}/{keys.length}</span>}
    </button>
  );
}

function SectionView({ s, done, toggle }: { s: ReaderSection; done: Set<string>; toggle: (k: string[], v: boolean) => void }) {
  const keys = sectionRowKeys(s);
  const n = keys.filter((k) => done.has(k)).length;
  const finished = keys.length > 0 && n === keys.length;
  return (
    <section id={s.id} className="scroll-mt-24">
      <h3 className={`font-display text-2xl font-semibold ${finished ? "text-muted-foreground line-through" : ""}`}>{s.title}</h3>
      {s.yarn && <p className="mt-0.5 text-sm text-muted-foreground">Yarn: {s.yarn}</p>}
      {keys.length > 0 && <p className="mt-1 text-sm font-medium text-primary">{s.title.replace(/\s*\(.*\)$/, "")} · {n}/{keys.length} {/^assembly/i.test(s.title) ? "steps" : "rounds"} completed</p>}
      <div className="mt-3 flex flex-col">
        {s.items.map((item, i) => <ItemView key={i} item={item} done={done} toggle={toggle} />)}
      </div>
    </section>
  );
}

function ItemView({ item, done, toggle }: { item: ReaderItem; done: Set<string>; toggle: (k: string[], v: boolean) => void }) {
  const [open, setOpen] = useState(false);
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
      <ul className="flex flex-col">
        {item.items.map((t, i) => <li key={i} className="border-b border-border/60 py-2 leading-relaxed last:border-0">{t}</li>)}
      </ul>
    );
  if (item.kind === "row") return <RowView row={item.row} done={done.has(item.row.key)} onToggle={(v) => toggle([item.row.key], v)} />;

  const keys = item.rows.map((r) => r.key);
  const n = keys.filter((k) => done.has(k)).length;
  const all = n === keys.length;
  return (
    <div className={open ? "rounded-xl bg-primary/5" : ""}>
      <div className={`reader-row ${all ? "reader-row-done" : ""}`}>
        <button className="reader-badge flex items-center gap-1" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={`${open ? "Hide" : "Show"} rounds ${item.badge}`}>
          {item.badge}
          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <button className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => toggle(keys, !all)}>
          <span className="reader-text flex-1">{item.text}{item.count !== undefined && <span className="reader-count"> ({item.count})</span>}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{n}/{keys.length}</span>
        </button>
      </div>
      {open && <div className="pl-6">{item.rows.map((r) => <RowView key={r.key} row={r} done={done.has(r.key)} onToggle={(v) => toggle([r.key], v)} />)}</div>}
    </div>
  );
}

function RowView({ row, done, onToggle }: { row: ReaderRow; done: boolean; onToggle: (v: boolean) => void }) {
  return (
    <button className={`reader-row w-full text-left ${done ? "reader-row-done" : ""}`} onClick={() => onToggle(!done)} aria-pressed={done}>
      <span className="reader-badge">{done ? <Check size={14} /> : row.badge}</span>
      <span className="reader-text flex-1">{row.text}{row.count !== undefined && <span className="reader-count"> ({row.count})</span>}</span>
    </button>
  );
}
