import { lazy, Suspense, useEffect, useState } from "react";
import { type CharacterConfig } from "@/lib/character";
import { createLayeredCharacter } from "@/lib/character-layers";
import type { EarType } from "./Doll3D";

const Doll3D = lazy(() => import("./Doll3D"));

export function CharacterPreview({ config }: { config: CharacterConfig }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const earId = (config.layered ?? createLayeredCharacter()).selections.ears;
  const ears = (earId ? earId.replace("ears-", "") : null) as EarType;
  return (
    <div className="flex h-full min-h-[360px] w-full flex-col items-center gap-2" role="img" aria-label="3D character preview">
      <div className="h-full min-h-[340px] w-full flex-1">
        {mounted && (
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading character…</p>}>
            <Doll3D config={config} ears={ears} />
          </Suspense>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Drag to rotate · scroll or pinch to zoom</p>
    </div>
  );
}
