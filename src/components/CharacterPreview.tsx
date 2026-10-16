import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { type CharacterConfig } from "@/lib/character";
import { createLayeredCharacter } from "@/lib/character-layers";
import type { EarType } from "./Doll3D";

const Doll3D = lazy(() => import("./Doll3D"));

/** Keeps 3D render failures inside the preview instead of crashing the page. */
class PreviewBoundary extends Component<{ children: ReactNode; resetKey: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }
  render() {
    if (this.state.failed)
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <p>The preview hit a snag.</p>
          <button type="button" className="btn-ghost" onClick={() => this.setState({ failed: false })}>Reload preview</button>
        </div>
      );
    return this.props.children;
  }
}

export function CharacterPreview({ config }: { config: CharacterConfig }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const earId = (config.layered ?? createLayeredCharacter()).selections.ears;
  const ears = (earId ? earId.replace("ears-", "") : null) as EarType;
  return (
    <div className="flex h-full min-h-[360px] w-full flex-col items-center gap-2" role="img" aria-label="3D character preview">
      <div className="h-full min-h-[340px] w-full flex-1">
        {mounted && (
          <PreviewBoundary resetKey={JSON.stringify(config.colors) + String(ears)}>
            <Suspense fallback={<p className="text-sm text-muted-foreground">Loading character…</p>}>
              <Doll3D config={config} ears={ears} />
            </Suspense>
          </PreviewBoundary>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Drag to rotate · scroll or pinch to zoom</p>
    </div>
  );
}
