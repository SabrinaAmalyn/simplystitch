import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BLUSH_OPTIONS, BROW_OPTIONS, EYE_OPTIONS, MOUTH_OPTIONS, NOSE_OPTIONS, partYarn, type BodyPart, type CharacterConfig } from "@/lib/character";
import { BLUSH_YARN_GROUPS } from "@/lib/yarn-palette";
import { YarnSwatches } from "@/components/YarnSwatches";
import { BrowCards, CheekCards, EyeCards, MouthCards, NoseCards } from "@/components/FaceFeatureCards";
import { LayerFeatureCards } from "@/components/LayerFeatureCards";
import { createLayeredCharacter, selectLayer } from "@/lib/character-layers";
import { PAW_SIDE_REGION, pawYarn, type PawRegion, type PawSide } from "@/lib/paw-colors";
import { Slider } from "@/components/ui/slider";
import { limbLengths, LIMB_LENGTH_MIN, LIMB_LENGTH_MAX } from "@/lib/limb-lengths";
const CATEGORIES = ["Body", "Face", "Ears", "Tail"] as const;
type Category = (typeof CATEGORIES)[number];
const SUBCATEGORIES: Partial<Record<Category, string[]>> = {
  Body: ["Head", "Torso", "Arms", "Legs", "Paws"],
  Face: ["Eyes", "Eyebrows", "Nose", "Mouth", "Cheeks"],
};
const LABELS: Partial<Record<BodyPart | PawRegion | PawSide, string>> = {
  head: "Head", body: "Body", leftArm: "Left arm", rightArm: "Right arm", leftLeg: "Left leg", rightLeg: "Right leg",
  leftEar: "Left ear", rightEar: "Right ear", leftEye: "Left eye", rightEye: "Right eye", leftBlush: "Left blush", rightBlush: "Right blush",
  brows: "Eyebrows", hands: "Hands / paws", feet: "Feet / paws", leftHand: "Left hand", rightHand: "Right hand", leftFoot: "Left foot", rightFoot: "Right foot", tail: "Tail",
};
const REGIONS: Record<string, (BodyPart | PawRegion | PawSide)[]> = {
  Head: ["head"], Torso: ["body"], Arms: ["leftArm", "rightArm"], Legs: ["leftLeg", "rightLeg"], Paws: ["leftHand", "rightHand", "leftFoot", "rightFoot"],
  Eyes: ["leftEye", "rightEye"], Eyebrows: ["brows"], Cheeks: ["leftBlush", "rightBlush"],
};

function RegionThumb({ region }: { region: string }) {
  return <svg viewBox="0 0 64 64" aria-hidden="true" className="text-primary">
    {region === "head" ? <rect x="12" y="10" width="40" height="42" rx="18" fill="currentColor" />
      : region === "body" ? <path d="M20 12Q32 5 44 12L47 39Q47 53 32 53Q17 53 17 39Z" fill="currentColor" />
      : region in PAW_SIDE_REGION ? <><rect x="23" y="9" width="18" height="46" rx="9" fill="currentColor" opacity=".25" /><path d="M23 38H41V46a9 9 0 01-18 0Z" fill="currentColor" /></>
      : <rect x="23" y="9" width="18" height="46" rx="9" fill="currentColor" transform={region.includes("Arm") ? "rotate(65 32 32)" : undefined} />}
  </svg>;
}

export function CustomizerPanel({ config, onChange }: { config: CharacterConfig; onChange: (c: CharacterConfig) => void }) {
  const [category, setCategory] = useState<Category>("Body");
  const [sub, setSub] = useState("Head");
  const [regionIndex, setRegionIndex] = useState(0);
  const layered = config.layered ?? createLayeredCharacter();
  const lengths = limbLengths(config);
  const lengthGroup = category === "Body" && sub === "Arms" ? "arms" : category === "Body" && sub === "Legs" ? "legs" : null;
  const regions = category === "Ears" ? ["leftEar", "rightEar"] as BodyPart[] : category === "Tail" ? ["tail"] as BodyPart[] : REGIONS[sub] ?? [];
  const region = regions[regionIndex] ?? regions[0];
  const current = region && region in PAW_SIDE_REGION ? pawYarn(config, region as PawSide) : region ? partYarn(config, region) : undefined;
  const changeFace = (patch: Partial<CharacterConfig["face"]>) => onChange({ ...config, face: { ...config.face, ...patch } });
  const pickCategory = (next: Category) => { setCategory(next); setSub(SUBCATEGORIES[next]?.[0] ?? ""); setRegionIndex(0); };
  const paletteVisible = current && (sub !== "Cheeks" || config.face.cheeks) && (category !== "Ears" || layered.selections.ears) && (category !== "Tail" || layered.selections.tail);

  return <div className="customization-workspace">
    <nav role="tablist" aria-label="Character options" className="category-nav">
      {CATEGORIES.map((name) => <Button key={name} variant="ghost" role="tab" aria-selected={category === name}
        onClick={() => pickCategory(name)} className={`category-tab ${category === name ? "category-active" : ""}`}>{name}</Button>)}
    </nav>
    {SUBCATEGORIES[category] ? <nav role="tablist" aria-label={`${category} subcategories`} className="subcategory-nav">
      {SUBCATEGORIES[category]?.map((name) => <Button key={name} variant="ghost" role="tab" aria-selected={sub === name}
        onClick={() => { setSub(name); setRegionIndex(0); }} className={`subcategory-tab ${sub === name ? "subcategory-active" : ""}`}>{name}</Button>)}
    </nav> : null}
    <div role="tabpanel" aria-label={sub ? `${category}: ${sub}` : category} className="workspace-content">
      <section className="feature-area">
        {category === "Body" && <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label={`${sub} region`}>
          {regions.map((part, index) => <Button key={part} variant="ghost" role="radio" aria-checked={region === part} onClick={() => setRegionIndex(index)}
            className={`feature-card ${region === part ? "choice-on" : ""}`}><RegionThumb region={part} /><span>{LABELS[part]}</span></Button>)}
        </div>}
        {category === "Face" && <>
          {sub === "Eyes" && <EyeCards options={EYE_OPTIONS} value={config.face.eyeStyle ?? "open"} onSelect={(eyeStyle) => changeFace({ eyeStyle })} />}
          {sub === "Eyebrows" && <BrowCards options={BROW_OPTIONS} value={config.face.brow ?? "none"} onSelect={(brow) => changeFace({ brow })} />}
          {sub === "Nose" && <NoseCards options={NOSE_OPTIONS} value={config.face.nose ?? "none"} onSelect={(nose) => changeFace({ nose })} />}
          {sub === "Mouth" && <MouthCards options={MOUTH_OPTIONS} value={config.face.mouth ?? "none"} onSelect={(mouth) => changeFace({ mouth })} />}
          {sub === "Cheeks" && <CheekCards options={[{ value: "none", label: "None" }, ...BLUSH_OPTIONS, { value: "whiskers", label: "Whiskers" }]}
            value={config.face.cheeks ? config.face.blushShape ?? "round" : config.face.whiskers ? "whiskers" : "none"}
            onSelect={(v) => changeFace(v === "none" ? { cheeks: false, whiskers: false } : v === "whiskers" ? { cheeks: false, whiskers: true } : { cheeks: true, blushShape: v, whiskers: false })} />}
        </>}
        {(category === "Ears" || category === "Tail") && <LayerFeatureCards slot={category === "Ears" ? "ears" : "tail"} config={config}
          value={category === "Ears" ? layered.selections.ears : layered.selections.tail}
          onSelect={(id) => onChange({ ...config, layered: selectLayer(layered, category === "Ears" ? "ears" : "tail", id) })} />}
      </section>
      {lengthGroup && <div className="mt-5 mb-3 space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm font-medium">
          <label id={`${lengthGroup}-length-label`}>{lengthGroup === "arms" ? "Arm length" : "Leg length"}</label>
          <span className="tabular-nums text-muted-foreground">{lengths[lengthGroup]}%</span>
        </div>
        <Slider aria-labelledby={`${lengthGroup}-length-label`} min={LIMB_LENGTH_MIN} max={LIMB_LENGTH_MAX} step={10}
          value={[lengths[lengthGroup]]} onValueChange={([value]) => {
            if (value === undefined) return;
            onChange({ ...config, lengths: { ...lengths, [lengthGroup]: value } });
          }} className="h-8" />
        <div className="flex justify-between text-xs text-muted-foreground"><span>100%</span><span>170%</span></div>
      </div>}
      {paletteVisible && region && <section className="palette-area">
        {category !== "Body" && regions.length > 1 && <div className="mb-4 flex gap-2" role="group" aria-label="Colour region">{regions.map((part, index) =>
          <Button key={part} variant="outline" size="sm" aria-pressed={region === part} className={region === part ? "region-active" : ""} onClick={() => setRegionIndex(index)}>{LABELS[part]}</Button>)}</div>}
        <YarnSwatches compact label={LABELS[region] ?? region} current={current} groups={sub === "Cheeks" ? BLUSH_YARN_GROUPS : undefined}
          onSelect={(id) => onChange({ ...config, colors: { ...config.colors, [region]: id } })} />
      </section>}
    </div>
  </div>;
}
