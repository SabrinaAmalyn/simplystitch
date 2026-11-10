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
import { ArrowLeft, Dices, PersonStanding, RotateCcw } from "lucide-react";
import { ProfileMenu } from "@/components/ProfileMenu";
import { MakerOnly } from "@/components/MakerOnly";
import { DescribeBar } from "@/components/DescribeBar";

const pick = <T,>(list: readonly T[]): T => {
  const value = list[Math.floor(Math.random() * list.length)];
  if (value === undefined) throw new Error("No random choices available.");
  return value;
};
/** Sliders move in 10% steps from 100% to 170%. */
const pickLength = () => 100 + 10 * Math.floor(Math.random() * 8);
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
  // Lengths follow the sliders' 10% steps so Randomize never produces a value the UI can't show.
  const lengths = { arms: pickLength(), legs: pickLength(), torso: pickLength() };
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
    lengths,
    layered,
  };
}

/** Desktop top-left pair; mobile controls sit in the viewer's bottom corners. */
function PreviewActions() {
  return (
    <div className="preview-actions">
      <Button
        variant="outline"
        size="sm"
        type="button"
        aria-label="Reset character"
        title="Reset"
        className="preview-action preview-reset text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={() => setState((s) => ({ ...s, editingPatternId: null, config: { ...DEFAULT_CONFIG, layered: createLayeredCharacter() } }))}
      >
        <RotateCcw size={14} />
      </Button>
      <Button
        variant="outline"
        size="sm"
        type="button"
        aria-label="Randomize character"
        title="Randomize"
        className="preview-action preview-randomize border-primary/40 font-semibold text-primary hover:bg-accent hover:text-primary"
        onClick={() => setState((s) => ({ ...s, config: randomConfig() }))}
      >
        <Dices size={14} />
      </Button>
    </div>
  );
}

export const Route = createFileRoute("/customize")({
  head: () => ({
    meta: [
      { title: "Customize your character — SimplyStitch" },
      { name: "description", content: "Pick ears, tail, face details and yarn colours, then generate a matching amigurumi crochet pattern draft." },
      { property: "og:title", content: "Customize your character — SimplyStitch" },
      { property: "og:description", content: "Choose ears, tail, facial details and yarn colours for your doll, then generate its pattern." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <MakerOnly allowTeam><Workspace /></MakerOnly>,
});

function Workspace() {
  const config = useStore((s) => s.config);
  const draft = useStore((s) => s.draft);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [armsDown, setArmsDown] = useState(false);

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
    <main className="customize-shell min-h-screen bg-background">
      <header className="hidden md:grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-4 md:px-6">
        <h1 className="min-w-0 font-logo text-2xl uppercase"><Link to="/">SimplyStitch</Link></h1>
        <ProfileMenu />
      </header>

      <div className="creator-layout">
        <section className="preview-panel" aria-label="Character preview">
          <div className="preview-topbar">
            <Button variant="outline" size="sm" asChild className="preview-back">
              <Link to="/" aria-label="Go Back" title="Go Back"><ArrowLeft size={14} /></Link>
            </Button>
            <span className="preview-topbar-spacer" aria-hidden="true" />
            <Button type="button" size="sm" onClick={generate} disabled={busy || blockers.length > 0}>
              Generate
            </Button>
          </div>
          <div className="character-canvas">
            <CharacterPreview config={config} armsDown={armsDown} />
            <PreviewActions />
            <Button type="button" variant="outline" size="icon" aria-label={armsDown ? "Raise arms" : "Lower arms"} aria-pressed={armsDown}
              title="Change pose" className="preview-pose" onClick={() => setArmsDown((v) => !v)}>
              <PersonStanding size={18} />
            </Button>
            <div className="preview-generate">
              <Button type="button" onClick={generate} disabled={busy || blockers.length > 0}>
                {busy ? "Stitching your pattern…" : "Generate"}
              </Button>
            </div>
          </div>
        </section>

        <section className="min-w-0 options-column">
          <DescribeBar onResult={(c) => setState((s) => ({ ...s, editingPatternId: null, config: c }))} />
          <CustomizerPanel config={config} onChange={(c) => setState((s) => ({ ...s, config: c }))} />
          <div className="workspace-actions flex flex-col gap-4">
            {error && <div className="alert alert-error">{error}</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
