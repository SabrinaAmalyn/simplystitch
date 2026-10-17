import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { ProfileMenu } from "@/components/ProfileMenu";

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
      whiskers: false,
    },
    layered,
  };
}

/**
 * Randomize / Reset pair. Rendered once inside the preview canvas (desktop) and
 * once inside the mobile preview top bar; CSS decides which one is visible so
 * the buttons always sit in the preview's upper-right corner.
 */
function PreviewActions() {
  return (
    <div className="preview-actions">
      <Button
        variant="outline"
        size="sm"
        type="button"
        aria-label="Reset character"
        title="Reset"
        className="preview-action text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={() => setState((s) => ({ ...s, config: { ...DEFAULT_CONFIG, layered: createLayeredCharacter() } }))}
      >
        <RotateCcw size={14} />
        <span className="preview-action-label">Reset</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        type="button"
        aria-label="Randomize character"
        title="Randomize"
        className="preview-action border-primary/40 font-semibold text-primary hover:bg-accent hover:text-primary"
        onClick={() => setState((s) => ({ ...s, config: randomConfig() }))}
      >
        <Dices size={14} />
        <span className="preview-action-label">Randomize</span>
      </Button>
    </div>
  );
}

export const Route = createFileRoute("/customize")({
  head: () => ({
    meta: [
      { title: "Customize your character — Stitchling" },
      { name: "description", content: "Pick ears, tail, face details and yarn colours, then generate a matching amigurumi crochet pattern draft." },
      { property: "og:title", content: "Customize your character — Stitchling" },
      { property: "og:description", content: "Choose ears, tail, facial details and yarn colours for your doll, then generate its pattern." },
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const layered = config.layered ?? createLayeredCharacter();
  const blockers = patternBlockers(layered);

  const generate = () => {
    if (blockers.length) return;
    setBusy(true);
    setError(null);
    setTimeout(() => {
      try {
        const text = patternToText(generatePattern(config));
        setState((s) => ({
          ...s,
          previous: s.draft?.edited ? s.draft : s.previous,
          draft: { text, initialText: text, configKey: configKey(config), edited: false, saved: false, generatedAt: Date.now() },
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
        <ProfileMenu />
      </header>

      <div className="creator-layout">
        <section className="preview-panel" aria-label="Character preview">
          <div className="preview-topbar">
            <span className="preview-topbar-spacer" aria-hidden="true" />
            <PreviewActions />
            <Button type="button" size="sm" onClick={generate} disabled={busy || blockers.length > 0}>
              Generate
            </Button>
          </div>
          <div className="character-canvas">
            <CharacterPreview config={config} />
            <PreviewActions />
            <div className="preview-generate">
              <Button type="button" onClick={generate} disabled={busy || blockers.length > 0}>
                {busy ? "Stitching your pattern…" : "Generate"}
              </Button>
            </div>
          </div>
        </section>

        <section className="min-w-0">
          <CustomizerPanel config={config} onChange={(c) => setState((s) => ({ ...s, config: c }))} />
          <div className="workspace-actions flex flex-col gap-4">
            {error && <div className="alert alert-error">{error}</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
