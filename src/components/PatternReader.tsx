import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronUp, Info, Menu, X } from "lucide-react";
import { CharacterPreview } from "@/components/CharacterPreview";
import type { CharacterConfig } from "@/lib/character";
import { parsePatternText, sectionRowKeys, type ReaderItem, type ReaderRow, type ReaderSection } from "@/lib/pattern-reader";
import { resetProgress, toggleRows, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Props = { text: string; config: CharacterConfig; progressKey: string; name?: string | undefined; toolbar?: (openSections: () => void) => ReactNode; editing?: ReactNode; onNavigateSection?: () => void };

export function PatternReader({ text, config, progressKey, name, toolbar, editing, onNavigateSection }: Props) {
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
    onNavigateSection?.();
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
    <div className="pattern-workspace">
      {toolbar?.(() => setDrawer(true))}
      {editing || <>
      <section className="reader-preview">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold">{name || doc.title}</h2>
            {name && <p className="truncate text-sm text-muted-foreground">{doc.title}</p>}
          </div>
          <Button variant="ghost" className="shrink-0" onClick={() => setShowPreview((v) => !v)} aria-expanded={showPreview}>
            {showPreview ? <ChevronUp size={16} /> : <ChevronDown size={16} />} {showPreview ? "Hide character" : "Show character"}
          </Button>
        </div>
        {showPreview && <div className="reader-character"><CharacterPreview config={config} /></div>}
      </section>

      <div className="reader-bar">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Project progress</span>
            <span className="text-muted-foreground">{completed}/{total} completed</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Project progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed}>
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${total ? (completed / total) * 100 : 0}%` }} />
          </div>
        </div>
        {!toolbar && <Button variant="ghost" size="icon" onClick={() => setDrawer(true)} aria-label="Open pattern sections"><Menu size={18} /></Button>}
      </div>

      <div className="reader-columns">
        <article className="reader-instructions">
          {doc.sections.map((s) => (
            <SectionView key={s.id} s={s} done={done} toggle={toggle} collapsed={collapsed.has(s.id)} onToggleCollapse={() => toggleCollapse(s.id)} />
          ))}
          {completed > 0 && (
            <Button variant="ghost" className="self-start text-sm" onClick={() => confirm("Clear all row progress for this pattern?") && resetProgress(progressKey)}>Clear progress</Button>
          )}
        </article>
        <nav className="reader-navigation" aria-label="Pattern sections">
          <h2 className="mb-3 px-3 text-lg font-bold">Pattern sections</h2>
          <NavList meta={meta} parts={parts} assembly={assembly} active={active} go={go} done={done} />
        </nav>
      </div>

      </>}
      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent className="w-[min(22rem,90vw)] overflow-y-auto bg-card">
          <SheetHeader><SheetTitle className="font-sans">Pattern sections</SheetTitle></SheetHeader>
          <nav className="mt-5" aria-label="Pattern sections">
            <NavList meta={meta} parts={parts} assembly={assembly} active={active} go={go} done={done} />
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NavList({ meta, parts, assembly, active, go, done }: { meta: ReaderSection[]; parts: ReaderSection[]; assembly: ReaderSection[]; active?: string | undefined; go: (id: string) => void; done: Set<string> }) {
  return (
    <div className="flex flex-col">
      {meta.map((s) => <NavItem key={s.id} s={s} active={active === s.id} onGo={go} done={done} />)}
      {parts.length > 0 && <p className="mt-2 px-3 py-2 text-sm font-semibold">Instructions</p>}
      {parts.map((s) => <NavItem key={s.id} s={s} active={active === s.id} onGo={go} done={done} indent />)}
      {assembly.map((s) => <NavItem key={s.id} s={s} active={active === s.id} onGo={go} done={done} />)}
    </div>
  );
}

function NavItem({ s, active, onGo, done, indent }: { s: ReaderSection; active: boolean; onGo: (id: string) => void; done: Set<string>; indent?: boolean }) {
  const keys = sectionRowKeys(s);
  const n = keys.filter((k) => done.has(k)).length;
  return (
    <Button variant="ghost"
      onClick={() => onGo(s.id)}
      aria-current={active ? "true" : undefined}
      className={`reader-nav-item ${active ? "bg-accent font-semibold text-accent-foreground" : ""}`}
    >
      <span className="min-w-0 whitespace-normal">{s.title}</span>
      {keys.length > 0 && <span className="shrink-0 text-sm text-muted-foreground">{n}/{keys.length}</span>}
    </Button>
  );
}

function SectionView({ s, done, toggle, collapsed, onToggleCollapse }: { s: ReaderSection; done: Set<string>; toggle: (k: string[], v: boolean) => void; collapsed: boolean; onToggleCollapse: () => void }) {
  const keys = sectionRowKeys(s);
  const n = keys.filter((k) => done.has(k)).length;
  const finished = keys.length > 0 && n === keys.length;
  return (
    <section id={s.id} className="reader-section scroll-mt-24">
      <Button variant="ghost" className="reader-section-heading" onClick={onToggleCollapse} aria-expanded={!collapsed}>
        <span className="min-w-0">
          <span className={`text-xl font-bold ${finished ? "text-muted-foreground line-through" : ""}`}>{s.title}</span>
          {s.yarn && <span className="mt-0.5 block text-sm text-muted-foreground">Yarn: {s.yarn}</span>}
          {keys.length > 0 && <span className="mt-1 block text-sm font-medium text-muted-foreground">{n}/{keys.length} {/^assembly/i.test(s.title) ? "steps" : "rounds"} completed</span>}
        </span>
        <ChevronDown size={20} className={`mt-1.5 shrink-0 text-muted-foreground transition-transform ${collapsed ? "" : "rotate-180"}`} aria-hidden />
      </Button>
      {!collapsed && (
        <div className="mt-3 flex flex-col">
          {s.items.map((item, i) => <ItemView key={i} item={item} done={done} toggle={toggle} />)}
        </div>
      )}
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
      <ul className="flex flex-col gap-1">
        {item.items.map((t, i) => <li key={i} className="py-1.5 leading-relaxed">{t}</li>)}
      </ul>
    );
  if (item.kind === "row") return <RowView row={item.row} done={done.has(item.row.key)} onToggle={(v) => toggle([item.row.key], v)} />;

  const keys = item.rows.map((r) => r.key);
  const n = keys.filter((k) => done.has(k)).length;
  const all = n === keys.length;
  return (
    <div className={open ? "rounded-lg bg-primary/5" : ""}>
      <div className={`reader-row ${all ? "reader-row-done" : ""}`}>
        <Button variant="ghost" className="reader-badge flex items-center gap-1" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={`${open ? "Hide" : "Show"} rounds ${item.badge}`}>
          {item.badge}
          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </Button>
        <Button variant="ghost" className="reader-group-toggle" aria-pressed={all} onClick={() => toggle(keys, !all)}>
          <span className="reader-text flex-1">{item.text}{item.count !== undefined && <span className="reader-count"> ({item.count})</span>}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{n}/{keys.length}</span>
        </Button>
      </div>
      {open && <div className="reader-subrounds">{item.rows.map((r) => <RowView key={r.key} row={r} done={done.has(r.key)} onToggle={(v) => toggle([r.key], v)} />)}</div>}
    </div>
  );
}

function RowView({ row, done, onToggle }: { row: ReaderRow; done: boolean; onToggle: (v: boolean) => void }) {
  return (
    <Button variant="ghost" className={`reader-row w-full text-left ${done ? "reader-row-done" : ""}`} onClick={() => onToggle(!done)} aria-pressed={done}>
      <span className="reader-badge">{done ? <Check size={14} /> : row.badge}</span>
      <span className="reader-text flex-1">{row.text}{row.count !== undefined && <span className="reader-count"> ({row.count})</span>}</span>
    </Button>
  );
}
