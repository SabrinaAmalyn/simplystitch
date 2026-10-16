import { useState } from "react";
import { type CharacterConfig } from "@/lib/character";
import { BASE_ART, createLayeredCharacter, renderLayers } from "@/lib/character-layers";
import maskAsset from "@/assets/character/base-display-mask-corrected.png.asset.json";

export function CharacterPreview({ config }: { config: CharacterConfig }) {
  const [failed, setFailed] = useState(false);
  const layers = renderLayers(config.layered ?? createLayeredCharacter());
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <svg viewBox={`0 0 ${BASE_ART.canvas.width} ${BASE_ART.canvas.height}`} className="h-full max-h-[480px] w-full" role="img" aria-label="Layered crochet character preview">
        <defs>
          <mask id="canonical-base-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="360" style={{ maskType: "alpha" }}>
            <image href={maskAsset.url} x="0" y="0" width="256" height="360" />
          </mask>
        </defs>
        {layers.map((layer) => layer.base ? (
          <image key={layer.id} data-layer={layer.id} data-base-source={BASE_ART.url} href={BASE_ART.url} x="0" y="0" width={BASE_ART.source.width} height={BASE_ART.source.height} preserveAspectRatio="none" mask="url(#canonical-base-mask)" onError={() => setFailed(true)} />
        ) : (
          <image key={layer.id} data-layer={layer.id} href={layer.url} x="0" y="0" width={BASE_ART.canvas.width} height={BASE_ART.canvas.height} onError={() => setFailed(true)} />
        ))}
      </svg>
      {failed && <p role="alert" className="text-sm text-destructive">Character artwork could not load. Please refresh.</p>}
    </div>
  );
}
