import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Info, Menu } from "lucide-react";
import { ItemView, groupParts } from "@/components/PatternReader";
import type { CharacterConfig } from "@/lib/character";
import { parsePatternText, sectionRowKeys, type ReaderSection } from "@/lib/pattern-reader";
import { resetProgress, toggleRows, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Props = { text: string; config?: CharacterConfig; progressKey: string; name: string; header?: ReactNode };

const ORDER = [/^introduction|overview/i, /^measurements/i, /^materials/i, /^abbreviations/i, null, /^assembly|finishing/i, /notes/i];
const rank = (s: ReaderSection) => (s.parent ? 4 : Math.max(0, ORDER.findIndex((r) => r && r.test(s.title))));

/** Continuous, scrolling pattern document with a table of contents and progress. */
export function PatternDocument({ text, progressKey, name, header }: Props) {
  const doc = useMemo(() => parsePatternText(text), [text]);
  const sections = useMemo(() => [...doc.sections].sort((a, b) => rank(a) - rank(b)), [doc]);
  const doneList = useStore((s) => s.progress?.[progressKey]);
  const done = useMemo(() => new Set(doneList ?? []), [doneList]);
  const allKeys = useMemo(() => sections.flatMap(sectionRowKeys), [sections]);
  const current = allKeys.find((k) => !done.has(k));
  const completed = allKeys.filter((k) => done.has(k)).length;
  const toggle = (keys: string[], v: boolean) => toggleRows(progressKey, keys, v);

  const [active, setActive] = useState(sections[0]?.id);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id);
    }, { rootMargin: "-90px 0px -60% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  const go = (id: string) => {
    setNavOpen(false);
    setActive(id);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), navOpen ? 250 : 0);
  };

  const top = sections.filter((s) => !s.parent);
  const parts = sections.filter((s) => s.parent);
  const groups = groupParts(parts);

  const toc = (
    <nav aria-label="Pattern sections" className="doc-toc-list">
      {top.filter((s) => rank(s) < 4).map((s) => <TocLink key={s.id} s={s} active={active === s.id} onGo={go} />)}
      {parts.length > 0 && (
        <>
          <button type="button" className={`doc-toc-link ${parts.some((p) => p.id === active) ? "doc-toc-active" : ""}`} onClick={() => go(parts[0]!.id)}>Instructions</button>
          {groups.map((g) => (
            <div key={g.id}>
              {groups.length > 1 && <p className="doc-toc-group">{g.label}</p>}
              {g.parts.map((p) => <TocLink key={p.id} s={p} active={active === p.id} onGo={go} nested done={sectionRowKeys(p).every((k) => done.has(k))} />)}
            </div>
          ))}
        </>
      )}
      {top.filter((s) => rank(s) > 4).map((s) => <TocLink key={s.id} s={s} active={active === s.id} onGo={go} />)}
    </nav>
  );

  return (
    <div className="pattern-workspace">
      {header}
      <div className="doc-layout">
        <article className="doc-main" aria-label={name}>
          <div className="doc-progress" aria-live="polite">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">{completed} of {allKeys.length} rounds done</span>
              {completed > 0 && <Button variant="ghost" size="sm" onClick={() => confirm("Clear all row progress for this pattern?") && resetProgress(progressKey)}>Clear</Button>}
            </div>
            <div className="doc-progress-track"><div className="doc-progress-fill" style={{ width: `${allKeys.length ? (completed / allKeys.length) * 100 : 0}%` }} /></div>
          </div>
          {sections.map((s, i) => {
            const keys = sectionRowKeys(s);
            const n = keys.filter((k) => done.has(k)).length;
            const firstPart = s.parent && sections.findIndex((x) => x.parent) === i;
            return (
              <section key={s.id} id={s.id} className="doc-section" aria-labelledby={`${s.id}-h`}>
                {firstPart && <p className="doc-kicker">Instructions</p>}
                <div className="flex items-baseline justify-between gap-3">
                  <h2 id={`${s.id}-h`} className="text-2xl font-bold md:text-3xl">{s.title}</h2>
                  {keys.length > 0 && <span className="shrink-0 text-sm text-muted-foreground">{n}/{keys.length}</span>}
                </div>
                <div className="mt-3 flex flex-col">
                  {s.yarn && (
                    <div className="reader-note">
                      <Info size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                      <p><span className="font-semibold">Yarn:</span> {s.yarn}</p>
                    </div>
                  )}
                  {s.items.map((item, j) => <ItemView key={j} item={item} done={done} toggle={toggle} current={current} />)}
                </div>
              </section>
            );
          })}
        </article>

        <aside className="doc-side" aria-label="Table of contents">
          <div className="doc-card">
            <div className="doc-toc-scroll">{toc}</div>
          </div>
        </aside>
      </div>

      <Button className="doc-goto" onClick={() => setNavOpen(true)} aria-haspopup="dialog"><Menu /> Go to</Button>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="bottom" className="doc-sheet">
          <SheetHeader><SheetTitle className="text-center">Contents</SheetTitle></SheetHeader>
          <div className="doc-sheet-scroll">{toc}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function TocLink({ s, active, onGo, nested, done }: { s: ReaderSection; active: boolean; onGo: (id: string) => void; nested?: boolean; done?: boolean }) {
  return (
    <button type="button" aria-current={active ? "location" : undefined} className={`doc-toc-link ${nested ? "doc-toc-nested" : ""} ${active ? "doc-toc-active" : ""}`} onClick={() => onGo(s.id)}>
      <span className="truncate">{s.title}</span>
      {done && <span className="text-xs text-primary" aria-label="complete">✓</span>}
    </button>
  );
}
