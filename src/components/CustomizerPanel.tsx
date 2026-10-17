import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BLUSH_OPTIONS, EYE_OPTIONS, MOUTH_OPTIONS, NOSE_OPTIONS, partYarn, type BodyPart, type CharacterConfig } from "@/lib/character";
import { BLUSH_YARN_GROUPS } from "@/lib/yarn-palette";
import { YarnSwatches } from "@/components/YarnSwatches";
import { BlushCards, EyeCards, MouthCards, NoseCards } from "@/components/FaceFeatureCards";
import { CUSTOMIZATION_ITEMS, createLayeredCharacter, selectLayer } from "@/lib/character-layers";
import { PAW_REGIONS, pawYarn, type PawRegion } from "@/lib/paw-colors";

const TABS = ["Body", "Face", "Ears", "Tail"] as const;
const PART_LABEL: Record<BodyPart, string> = {
  head: "Head", body: "Body", leftArm: "Left arm", rightArm: "Right arm",
  leftLeg: "Left leg", rightLeg: "Right leg", leftEar: "Left ear", rightEar: "Right ear",
  leftInnerEar: "Left inner ear", rightInnerEar: "Right inner ear", blush: "Blush cheeks", tail: "Tail",
  leftBlush: "Left blush", rightBlush: "Right blush", leftEye: "Left eye", rightEye: "Right eye",
};
const TAB_PARTS: Record<(typeof TABS)[number], BodyPart[]> = {
  Body: ["head", "body", "leftArm", "rightArm", "leftLeg", "rightLeg"],
  Face: ["leftEye", "rightEye", "leftBlush", "rightBlush"],
  Ears: ["leftEar", "rightEar"],
  Tail: ["tail"],
};

function ColorRow({ part, config, onChange }: { part: BodyPart; config: CharacterConfig; onChange: (c: CharacterConfig) => void }) {
  const current = partYarn(config, part);
  return <YarnSwatches label={PART_LABEL[part]} current={current} defaultOpen={part === "head"}
    groups={part === "leftBlush" || part === "rightBlush" ? BLUSH_YARN_GROUPS : undefined}
    onSelect={(id) => onChange({ ...config, colors: { ...config.colors, [part]: id } })} />;
}

export function CustomizerPanel({ config, onChange }: { config: CharacterConfig; onChange: (c: CharacterConfig) => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Body");
  const layered = config.layered ?? createLayeredCharacter();
  const pickEars = (id: string | null) => onChange({ ...config, layered: selectLayer(layered, "ears", id) });
  const earItems = CUSTOMIZATION_ITEMS.filter((i) => i.slot === "ears");
  const tailItems = CUSTOMIZATION_ITEMS.filter((i) => i.slot === "tail");
  return (
    <div className="panel flex flex-col gap-5">
      <div role="tablist" aria-label="Character options" className="flex flex-wrap gap-1 rounded-full bg-muted p-1">
        {TABS.map((t) => (
          <Button key={t} variant="ghost" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={tab === t ? "tab tab-on" : "tab"}>{t}</Button>
        ))}
      </div>
      <div role="tabpanel" aria-label={tab} className="flex flex-col gap-4">
        {tab === "Face" && <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold">Show blush</span><Switch aria-label="Show blush" checked={config.face.cheeks} onCheckedChange={(cheeks) => onChange({ ...config, face: { ...config.face, cheeks } })} /></div>}
        {tab === "Face" && (
          <>
            {config.face.cheeks && <BlushCards options={BLUSH_OPTIONS} value={config.face.blushShape ?? "round"} onSelect={(blushShape) => onChange({ ...config, face: { ...config.face, blushShape } })} />}
            <EyeCards options={EYE_OPTIONS} value={config.face.eyeStyle ?? "open"} onSelect={(eyeStyle) => onChange({ ...config, face: { ...config.face, eyeStyle } })} />
            <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold">Whiskers</span><Switch aria-label="Whiskers" checked={config.face.whiskers ?? false} onCheckedChange={(whiskers) => onChange({ ...config, face: { ...config.face, whiskers } })} /></div>
            <NoseCards options={NOSE_OPTIONS} value={config.face.nose ?? "none"} onSelect={(nose) => onChange({ ...config, face: { ...config.face, nose } })} />
            <MouthCards options={MOUTH_OPTIONS} value={config.face.mouth ?? "none"} onSelect={(mouth) => onChange({ ...config, face: { ...config.face, mouth } })} />
          </>
        )}
        {tab === "Ears" && (
          <div className="grid grid-cols-3 gap-2">
            <Button variant="ghost" aria-pressed={layered.selections.ears === null} onClick={() => pickEars(null)} className={layered.selections.ears === null ? "choice choice-on" : "choice"}>None</Button>
            {earItems.map((item) => (
              <Button key={item.id} variant="ghost" aria-pressed={layered.selections.ears === item.id} onClick={() => pickEars(item.id)} className={layered.selections.ears === item.id ? "choice choice-on" : "choice"}>{item.label}</Button>
            ))}
          </div>
        )}
        {tab === "Tail" && (
          <div className="grid grid-cols-3 gap-2">
            <Button variant="ghost" aria-pressed={!layered.selections.tail} onClick={() => onChange({ ...config, layered: selectLayer(layered, "tail", null) })} className={!layered.selections.tail ? "choice choice-on" : "choice"}>None</Button>
            {tailItems.map((item) => (
              <Button key={item.id} variant="ghost" aria-pressed={layered.selections.tail === item.id} onClick={() => onChange({ ...config, layered: selectLayer(layered, "tail", item.id) })} className={layered.selections.tail === item.id ? "choice choice-on" : "choice"}>{item.label}</Button>
            ))}
          </div>
        )}
        {(tab === "Body" || tab === "Face" || (tab === "Ears" && layered.selections.ears) || (tab === "Tail" && layered.selections.tail)) && TAB_PARTS[tab].filter((p) => config.face.cheeks || (p !== "leftBlush" && p !== "rightBlush")).map((p) => <ColorRow key={p} part={p} config={config} onChange={onChange} />)}
        {tab === "Body" && PAW_REGIONS.map((region: PawRegion) => {
          const label = region === "hands" ? "Hands / paws" : "Feet / paws";
          const current = pawYarn(config, region);
          return <YarnSwatches key={region} label={label} current={current}
            onSelect={(id) => onChange({ ...config, colors: { ...config.colors, [region]: id } })} />;
        })}
      </div>
    </div>
  );
}
