import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CharacterPreview } from "@/components/CharacterPreview";
import { CustomizerPanel } from "@/components/CustomizerPanel";
import { JourneySteps } from "@/components/JourneySteps";
import { configKey, DEFAULT_CONFIG } from "@/lib/character";
import { generatePattern, patternToText } from "@/lib/pattern";
import { setState, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { characterRecord, createLayeredCharacter, patternBlockers, selectedItems } from "@/lib/character-layers";

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
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Stitchling</h1>
        <JourneySteps active={0} />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="stage relative flex aspect-square max-h-[560px] items-center justify-center p-6 lg:aspect-auto lg:min-h-[520px]">
          <CharacterPreview config={config} />
          <Button variant="outline" type="button" className="btn-ghost absolute right-4 top-4" onClick={() => setState((s) => ({ ...s, config: { ...DEFAULT_CONFIG, layered: createLayeredCharacter() } }))}>
            Reset
          </Button>
        </section>

        <section className="flex flex-col gap-4">
          <JourneySteps active={0} size="lg" />
          <CustomizerPanel config={config} onChange={(c) => setState((s) => ({ ...s, config: c }))} />
          {selected.length > 0 && (
            <div className="flex flex-col gap-2" aria-label="Selected components">
              {selected.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 border-b border-border py-2 text-sm">
                  <span>{item.label} <span className="text-muted-foreground">· {item.placeholder ? "Sample placeholder" : "Artwork"}</span></span>
                  <Button variant="ghost" size="sm" aria-label={`Remove ${item.label}`} onClick={() => setState((s) => ({ ...s, config: { ...s.config, layered: { ...layered, selections: { ...layered.selections, [item.slot]: null } } } }))}>Remove</Button>
                </div>
              ))}
            </div>
          )}
          {blockers.length > 0 && <div className="alert text-sm"><p className="font-semibold">Pattern rules pending</p><p>{blockers[0]}</p>{selected.length > 0 && <p>Selected samples are placeholders, not crochet instructions.</p>}</div>}

          {confirming && (
            <div className="alert">
              <p className="font-semibold">You've edited your current pattern.</p>
              <p className="text-sm">Generating a new one replaces it. Your edited version stays available to restore on the pattern page.</p>
              <div className="mt-3 flex gap-2">
                <button className="btn-primary" onClick={generate}>Generate anyway</button>
                <button className="btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
              </div>
            </div>
          )}
          {error && <div className="alert alert-error">{error}</div>}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" className="btn-primary btn-lg h-auto whitespace-normal" onClick={generate} disabled={busy || blockers.length > 0}>
              {busy ? "Stitching your pattern…" : draft ? "Generate new pattern" : "Generate Pattern"}
            </Button>
            <Button variant="outline" className="btn-ghost" onClick={exportCharacter}>Save character data</Button>
            {draft && (
              <Link to="/pattern" className="btn-ghost">
                {stale ? "Open previous pattern (outdated)" : "Open pattern"}
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
