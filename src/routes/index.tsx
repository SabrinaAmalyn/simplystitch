import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CharacterPreview } from "@/components/CharacterPreview";
import { CustomizerPanel } from "@/components/CustomizerPanel";
import { Sparkles, Download, RotateCcw, ChevronDown, Scissors } from "lucide-react";
import { configKey, DEFAULT_CONFIG } from "@/lib/character";
import { generatePattern, patternToText } from "@/lib/pattern";
import { setState, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { characterRecord, createLayeredCharacter, patternBlockers, selectedItems } from "@/lib/character-layers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stitchling — Design your crochet character" },
      { name: "description", content: "Create your own playful Stitchling character with colourful yarns, expressive details, ears and tails." },
      { property: "og:title", content: "Stitchling — Design your crochet character" },
      { property: "og:description", content: "Make a little character of your own with colourful yarns, ears, tails and playful details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const config = useStore((s) => s.config);
  const draft = useStore((s) => s.draft);
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stale = draft && draft.configKey !== configKey(config);
  const layered = config.layered ?? createLayeredCharacter();
  const blockers = patternBlockers(layered);
  const selected = selectedItems(layered);
  const exportCharacter = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(characterRecord(layered), null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "stitchling-character.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const generate = () => {
    if (blockers.length) return;
    if (draft?.edited && stale && !confirming) return setConfirming(true);
    setConfirming(false);
    setBusy(true);
    setError(null);
    setTimeout(() => {
      try {
        const text = patternToText(generatePattern(config));
        setState((s) => ({
          ...s,
          previous: s.draft?.edited ? s.draft : s.previous,
          draft: { text, configKey: configKey(config), edited: false, generatedAt: Date.now() },
        }));
        navigate({ to: "/pattern" });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong generating the pattern.");
        setBusy(false);
      }
    }, 600);
  };

  return (
    <main className="creator-page mx-auto min-h-screen max-w-[1440px] px-4 pb-10 pt-5 md:px-8">
      <header className="creator-header flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3"><span className="brand-mark"><Sparkles /></span><h1 className="font-display text-3xl font-semibold">Stitchling</h1></div>
        <span className="hidden text-sm font-semibold text-muted-foreground sm:block">A little character. Entirely yours.</span>
      </header>
      <div className="creator-layout">
        <section className="preview-column">
          <div className="mb-4 flex items-end justify-between gap-3"><div><p className="mb-1 text-xs font-bold uppercase text-primary">Character studio</p><h2 className="font-display text-3xl font-semibold">Meet your Stitchling</h2></div><span className="studio-badge"><span />Live preview</span></div>
          <div className="stage creator-stage relative">
            <CharacterPreview config={config} />
            <Button variant="outline" type="button" title="Reset character" className="preview-reset" onClick={() => setState((s) => ({ ...s, config: { ...DEFAULT_CONFIG, layered: createLayeredCharacter() } }))}><RotateCcw />Reset</Button>
          </div>
          <div className="creator-save flex items-center justify-between gap-4"><span className="text-sm text-muted-foreground">Made with a little imagination.</span><Button type="button" onClick={exportCharacter} className="save-character"><Download />Save Character</Button></div>
        </section>
        <section className="min-w-0"><CustomizerPanel config={config} onChange={(c) => setState((s) => ({ ...s, config: c }))} /></section>
      </div>
      <details className="pattern-tools mt-8 border-t border-border pt-5">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-muted-foreground"><Scissors className="size-4" />Crochet pattern<ChevronDown className="ml-auto size-4" /></summary>
        <div className="mt-5 flex flex-col gap-4">
          {selected.length > 0 && <div aria-label="Selected components" className="flex flex-wrap gap-3">{selected.map((item) => <div key={item.id} className="flex items-center gap-2 text-sm"><span>{item.label}</span><Button variant="ghost" size="sm" aria-label={`Remove ${item.label}`} onClick={() => setState((s) => ({ ...s, config: { ...s.config, layered: { ...layered, selections: { ...layered.selections, [item.slot]: null } } } }))}>Remove</Button></div>)}</div>}
          {blockers.length > 0 && <div className="alert text-sm"><p className="font-semibold">Pattern rules pending</p><p>{blockers[0]}</p>{selected.length > 0 && <p>Selected samples are placeholders, not crochet instructions.</p>}</div>}
          {confirming && <div className="alert"><p className="font-semibold">You've edited your current pattern.</p><p className="text-sm">Generating a new one replaces it. Your edited version stays available to restore on the pattern page.</p><div className="mt-3 flex gap-2"><Button className="btn-primary" onClick={generate}>Generate anyway</Button><Button variant="outline" className="btn-ghost" onClick={() => setConfirming(false)}>Cancel</Button></div></div>}
          {error && <div className="alert alert-error">{error}</div>}
          <div className="flex flex-wrap items-center gap-3"><Button type="button" variant="outline" className="btn-ghost h-auto whitespace-normal" onClick={generate} disabled={busy || blockers.length > 0}>{busy ? "Stitching your pattern…" : draft ? "Generate new pattern" : "Generate Pattern"}</Button>{draft && <Link to="/pattern" className="btn-ghost">{stale ? "Open previous pattern (outdated)" : "Open pattern"}</Link>}</div>
        </div>
      </details>
    </main>
  );
}
