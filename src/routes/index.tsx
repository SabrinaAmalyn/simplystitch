import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CharacterPreview } from "@/components/CharacterPreview";
import { CustomizerPanel } from "@/components/CustomizerPanel";
import { BLUSH_OPTIONS, BROW_OPTIONS, configKey, DEFAULT_CONFIG, EYE_OPTIONS, MOUTH_OPTIONS, NOSE_OPTIONS, type CharacterConfig } from "@/lib/character";
import { generatePattern, patternToText } from "@/lib/pattern";
import { setState, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { createLayeredCharacter, patternBlockers } from "@/lib/character-layers";
import { YARNS } from "@/lib/yarn-palette";
import { Dices, RotateCcw } from "lucide-react";

const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)]!;
const EAR_IDS = ["ears-human", "ears-dog", "ears-cat", "ears-bear", "ears-bunny"] as const;

function randomConfig(): CharacterConfig {
  const yarn = () => pick(YARNS).id;
  const body = yarn();
  const ears = pick([...EAR_IDS, null] as const);
  const tail = pick(["tail-round", "tail-long", null] as const);
  const layered = createLayeredCharacter();
  layered.selections.ears = ears;
  layered.selections.tail = tail;
  const blushYarn = pick(["blush", "baby-pink", "peach"] as const);
  const paw = yarn();
  return {
    ...DEFAULT_CONFIG,
    colors: {
      ...DEFAULT_CONFIG.colors,
      main: body, head: body, body, leftArm: body, rightArm: body, leftLeg: body, rightLeg: body,
      leftEar: yarn(), rightEar: yarn(), tail: yarn(), hands: paw, feet: paw,
      leftEye: "charcoal", rightEye: "charcoal", brows: "charcoal", leftBlush: blushYarn, rightBlush: blushYarn,
    },
    face: {
      ...DEFAULT_CONFIG.face,
      cheeks: Math.random() < 0.7,
      blushShape: pick(BLUSH_OPTIONS).value,
      eyeStyle: pick(EYE_OPTIONS).value,
      brow: pick(BROW_OPTIONS).value,
      nose: pick(NOSE_OPTIONS).value,
      mouth: pick(MOUTH_OPTIONS).value,
      whiskers: Math.random() < 0.3,
    },
    layered,
  };
}

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
      </header>

      <div className="creator-layout">
        <section className="preview-panel" aria-label="Character preview">
          <div className="preview-topbar md:hidden">
            <span className="preview-topbar-spacer" aria-hidden="true" />
            <Button type="button" size="sm" onClick={generate} disabled={busy || blockers.length > 0}>
              Save
            </Button>
          </div>
          <div className="character-canvas">
            <CharacterPreview config={config} />
            <div className="preview-actions">
              <Button variant="outline" size="sm" type="button" aria-label="Randomize character" onClick={() => setState((s) => ({ ...s, config: randomConfig() }))}>
                <Dices size={14} />Randomize
              </Button>
              <Button variant="outline" size="sm" type="button" aria-label="Reset character" onClick={() => setState((s) => ({ ...s, config: { ...DEFAULT_CONFIG, layered: createLayeredCharacter() } }))}>
                <RotateCcw size={14} />Reset
              </Button>
            </div>
          </div>
        </section>

        <section className="min-w-0">
          <CustomizerPanel config={config} onChange={(c) => setState((s) => ({ ...s, config: c }))} />
          <div className="workspace-actions flex flex-col gap-4">
          
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
            <Button type="button" className="hidden h-auto whitespace-normal md:inline-flex" onClick={generate} disabled={busy || blockers.length > 0}>
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
