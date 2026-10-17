import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CharacterPreview } from "@/components/CharacterPreview";
import { CustomizerPanel } from "@/components/CustomizerPanel";
import { JourneySteps } from "@/components/JourneySteps";
import { configKey, DEFAULT_CONFIG } from "@/lib/character";
import { generatePattern, patternToText } from "@/lib/pattern";
import { setState, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { characterRecord, createLayeredCharacter, patternBlockers } from "@/lib/character-layers";
import { RotateCcw, Download } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stitchling — Design your crochet character" },
      { name: "description", content: "Customize the original Stitchling lined doll with layered artwork and save structured character selections." },
      { property: "og:title", content: "Stitchling — Design your crochet character" },
      { property: "og:description", content: "Customize the original lined doll with ears, hair, facial details, outfits and accessory layers." },
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
    <main className="min-h-screen bg-background">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-4 md:px-6">
        <h1 className="min-w-0 font-display text-2xl font-semibold">Stitchling</h1>
        <Button variant="outline" className="shrink-0" onClick={exportCharacter}><Download size={15} />Save character</Button>
      </header>

      <div className="creator-layout">
        <section className="preview-panel" aria-label="Character preview">
          <div className="character-canvas"><CharacterPreview config={config} /></div>
          <Button variant="ghost" type="button" className="mb-3" onClick={() => setState((s) => ({ ...s, config: { ...DEFAULT_CONFIG, layered: createLayeredCharacter() } }))}>
            <RotateCcw size={14} />Reset
          </Button>
        </section>

        <section className="min-w-0">
          <CustomizerPanel config={config} onChange={(c) => setState((s) => ({ ...s, config: c }))} />
          <div className="workspace-actions flex flex-col gap-4">
          <JourneySteps active={0} />
          {blockers.length > 0 && <p className="text-xs text-muted-foreground">Pattern rules pending</p>}
          {confirming && (
            <div className="alert">
              <p className="font-semibold">You've edited your current pattern.</p>
              <p className="text-sm">Generating a new one replaces it. Your edited version stays available to restore on the pattern page.</p>
              <div className="mt-3 flex gap-2">
                <Button onClick={generate}>Generate anyway</Button>
                <Button variant="outline" onClick={() => setConfirming(false)}>Cancel</Button>
              </div>
            </div>
          )}
          {error && <div className="alert alert-error">{error}</div>}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" className="h-auto whitespace-normal" onClick={generate} disabled={busy || blockers.length > 0}>
              {busy ? "Stitching your pattern…" : draft ? "Generate new pattern" : "Generate Pattern"}
            </Button>
            {draft && (
              <Link to="/pattern" className="btn-ghost">
                {stale ? "Open previous pattern (outdated)" : "Open pattern"}
              </Link>
            )}
          </div>
          </div>
        </section>
      </div>
    </main>
  );
}
