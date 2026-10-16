import { useState } from "react";
import { RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type CharacterConfig } from "@/lib/character";
import { BASE_ART, VIEWS, createLayeredCharacter, renderLayers, type View } from "@/lib/character-layers";

const VIEW_LABEL: Record<View, string> = { front: "Front", right: "Right side", back: "Back", left: "Left side" };

export function CharacterPreview({ config }: { config: CharacterConfig }) {
  const [failed, setFailed] = useState(false);
  const [viewIndex, setViewIndex] = useState(0);
  const view = VIEWS[viewIndex]!;
  const turn = (step: number) => setViewIndex((i) => (i + step + VIEWS.length) % VIEWS.length);
  const layers = renderLayers(config.layered ?? createLayeredCharacter(), view);
  const { width, height } = BASE_ART.canvas;
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full max-h-[440px] w-full" role="img" aria-label={`Character preview, ${VIEW_LABEL[view]} view`}>
        <g transform={view === "left" ? `translate(${width} 0) scale(-1 1)` : undefined}>
          {layers.map((layer) => (
            <image key={layer.id} data-layer={layer.id} data-view={view} href={layer.url} x="0" y="0" width={width} height={height} onError={() => setFailed(true)} />
          ))}
        </g>
      </svg>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" aria-label="Rotate left" onClick={() => turn(-1)}><RotateCcw /></Button>
        <span className="min-w-24 text-center text-sm text-muted-foreground" aria-live="polite">{VIEW_LABEL[view]}</span>
        <Button variant="outline" size="icon" aria-label="Rotate right" onClick={() => turn(1)}><RotateCw /></Button>
      </div>
      {failed && <p role="alert" className="text-sm text-destructive">Character artwork could not load. Please refresh.</p>}
    </div>
  );
}
