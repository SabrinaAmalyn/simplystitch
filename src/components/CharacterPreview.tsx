import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Move, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type CharacterConfig } from "@/lib/character";
import { createLayeredCharacter } from "@/lib/character-layers";
import type { EarType } from "./Doll3D";

const Doll3D = lazy(() => import("./Doll3D"));

/** Keeps 3D render failures inside the preview instead of crashing the page. */
class PreviewBoundary extends Component<{ children: ReactNode; resetKey: string }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }
  override render() {
    if (this.state.failed)
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <p>The preview hit a snag.</p>
          <Button variant="outline" type="button" className="btn-ghost" onClick={() => this.setState({ failed: false })}>Reload preview</Button>
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
    <div className="relative flex h-full w-full flex-col items-center" role="img" aria-label="3D character preview">
      <div className="h-full w-full flex-1">
        {mounted && (
          <PreviewBoundary resetKey={JSON.stringify(config.colors) + String(ears) + String(config.layered?.selections.tail)}>
            <Suspense fallback={<p className="text-sm text-muted-foreground">Loading character…</p>}>
              <Doll3D config={config} ears={ears} />
            </Suspense>
          </PreviewBoundary>
        )}
      </div>
      <div className="preview-hints" aria-label="Preview gestures"><span title="Drag to rotate"><Move className="size-4" /></span><span title="Scroll or pinch to zoom"><ZoomIn className="size-4" /></span></div>
    </div>
  );
}
