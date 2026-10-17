import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BLUSH_OPTIONS, BROW_OPTIONS, EYE_OPTIONS, MOUTH_OPTIONS, NOSE_OPTIONS, partYarn, type BodyPart, type CharacterConfig } from "@/lib/character";
import { BLUSH_YARN_GROUPS } from "@/lib/yarn-palette";
import { YarnSwatches } from "@/components/YarnSwatches";
import { BlushCards, BrowCards, EyeCards, MouthCards, NoseCards, WhiskerCards } from "@/components/FaceFeatureCards";
import { LayerFeatureCards, LayerThumb } from "@/components/LayerFeatureCards";
import { createLayeredCharacter, selectLayer, selectedItems } from "@/lib/character-layers";
import { pawYarn, type PawRegion } from "@/lib/paw-colors";
import { CircleUserRound, Smile, Rabbit, Spline, X } from "lucide-react";

const CATEGORIES = ["Body", "Face", "Ears", "Tail"] as const;
type Category = (typeof CATEGORIES)[number];
const SUBCATEGORIES: Record<Category, string[]> = {
  Body: ["Head", "Torso", "Arms", "Legs", "Paws"],
  Face: ["Eyes", "Eyebrows", "Nose", "Mouth", "Blush", "Whiskers"],
  Ears: ["Style"], Tail: ["Style"],
};
const ICONS = { Body: CircleUserRound, Face: Smile, Ears: Rabbit, Tail: Spline };
const LABELS: Partial<Record<BodyPart | PawRegion, string>> = {
  head: "Head", body: "Body", leftArm: "Left arm", rightArm: "Right arm", leftLeg: "Left leg", rightLeg: "Right leg",
  leftEar: "Left ear", rightEar: "Right ear", leftEye: "Left eye", rightEye: "Right eye", leftBlush: "Left blush", rightBlush: "Right blush",
  brows: "Eyebrows", hands: "Hands / paws", feet: "Feet / paws", tail: "Tail",
};
const REGIONS: Record<string, (BodyPart | PawRegion)[]> = {
  Head: ["head"], Torso: ["body"], Arms: ["leftArm", "rightArm"], Legs: ["leftLeg", "rightLeg"], Paws: ["hands", "feet"],
  Eyes: ["leftEye", "rightEye"], Eyebrows: ["brows"], Blush: ["leftBlush", "rightBlush"],
};

function RegionThumb({ region }: { region: string }) {
  return <svg viewBox="0 0 64 64" aria-hidden="true" className="text-primary">
    {region === "head" ? <rect x="12" y="10" width="40" height="42" rx="18" fill="currentColor" />
      : region === "body" ? <path d="M20 12Q32 5 44 12L47 39Q47 53 32 53Q17 53 17 39Z" fill="currentColor" />
      : region === "hands" || region === "feet" ? <><rect x="23" y="9" width="18" height="46" rx="9" fill="currentColor" opacity=".25" /><path d="M23 38H41V46a9 9 0 01-18 0Z" fill="currentColor" /></>
      : <rect x="23" y="9" width="18" height="46" rx="9" fill="currentColor" transform={region.includes("Arm") ? "rotate(65 32 32)" : undefined} />}
  </svg>;
}

export function CustomizerPanel({ config, onChange }: { config: CharacterConfig; onChange: (c: CharacterConfig) => void }) {
  const [category, setCategory] = useState<Category>("Body");
  const [sub, setSub] = useState("Head");
  const [regionIndex, setRegionIndex] = useState(0);
  const layered = config.layered ?? createLayeredCharacter();
  const regions = category === "Ears" ? ["leftEar", "rightEar"] as BodyPart[] : category === "Tail" ? ["tail"] as BodyPart[] : REGIONS[sub] ?? [];
  const region = regions[regionIndex] ?? regions[0];
  const current = region === "hands" || region === "feet" ? pawYarn(config, region) : region ? partYarn(config, region) : undefined;
  const changeFace = (patch: Partial<CharacterConfig["face"]>) => onChange({ ...config, face: { ...config.face, ...patch } });
  const pickCategory = (next: Category) => { setCategory(next); setSub(SUBCATEGORIES[next][0] ?? "Style"); setRegionIndex(0); };
  const relevant = selectedItems(layered).filter((item) => item.slot === category.toLowerCase());
  const paletteVisible = current && (sub !== "Blush" || config.face.cheeks) && (category !== "Ears" || layered.selections.ears) && (category !== "Tail" || layered.selections.tail);

  return <div className="customization-workspace">
    <nav role="tablist" aria-label="Character options" className="category-nav">
      {CATEGORIES.map((name) => { const Icon = ICONS[name]; return <Button key={name} variant="ghost" role="tab" aria-selected={category === name}
        onClick={() => pickCategory(name)} className={`category-tab ${category === name ? "category-active" : ""}`}><Icon size={16} /><span>{name}</span></Button>; })}
    </nav>
    <nav role="tablist" aria-label={`${category} subcategories`} className="subcategory-nav">
      {SUBCATEGORIES[category].map((name) => <Button key={name} variant="ghost" role="tab" aria-selected={sub === name}
        onClick={() => { setSub(name); setRegionIndex(0); }} className={`subcategory-tab ${sub === name ? "subcategory-active" : ""}`}>{name}</Button>)}
    </nav>
    <div role="tabpanel" aria-label={`${category}: ${sub}`} className="workspace-content">
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
          {sub === "Blush" && <BlushCards options={[{ value: "none", label: "None" }, ...BLUSH_OPTIONS]} value={config.face.cheeks ? config.face.blushShape ?? "round" : "none"}
            onSelect={(blushShape) => changeFace(blushShape === "none" ? { cheeks: false } : { cheeks: true, blushShape })} />}
          {sub === "Whiskers" && <WhiskerCards options={[{ value: "none", label: "None" }, { value: "whiskers", label: "Whiskers" }]}
            value={config.face.whiskers ? "whiskers" : "none"} onSelect={(value) => changeFace({ whiskers: value === "whiskers" })} />}
        </>}
        {(category === "Ears" || category === "Tail") && <LayerFeatureCards slot={category === "Ears" ? "ears" : "tail"} config={config}
          value={category === "Ears" ? layered.selections.ears : layered.selections.tail}
          onSelect={(id) => onChange({ ...config, layered: selectLayer(layered, category === "Ears" ? "ears" : "tail", id) })} />}
      </section>
      {paletteVisible && region && <section className="palette-area">
        {category !== "Body" && regions.length > 1 && <div className="mb-4 flex gap-2" role="group" aria-label="Colour region">{regions.map((part, index) =>
          <Button key={part} variant="outline" size="sm" aria-pressed={region === part} className={region === part ? "region-active" : ""} onClick={() => setRegionIndex(index)}>{LABELS[part]}</Button>)}</div>}
        <YarnSwatches compact label={LABELS[region] ?? region} current={current} groups={sub === "Blush" ? BLUSH_YARN_GROUPS : undefined}
          onSelect={(id) => onChange({ ...config, colors: { ...config.colors, [region]: id } })} />
      </section>}
      {relevant.length > 0 && <section className="layered-area" aria-label="Selected components">
        <h3 className="mb-3 text-sm font-semibold">Layered items</h3>
        <div className="grid grid-cols-3 gap-2">{relevant.map((item) => <div key={item.id} className="relative flex min-w-0 flex-col items-center gap-2 rounded-md border border-primary bg-primary/5 px-2 py-4">
          <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true"><LayerThumb id={item.id} color={partYarn(config, item.slot === "ears" ? "leftEar" : "tail").hex} /></svg><span className="text-xs">{item.label}</span>
          <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-6 w-6" aria-label={`Remove ${item.label}`}
            onClick={() => onChange({ ...config, layered: selectLayer(layered, item.slot, null) })}><X size={12} /></Button>
        </div>)}</div>
      </section>}
    </div>
  </div>;
}
