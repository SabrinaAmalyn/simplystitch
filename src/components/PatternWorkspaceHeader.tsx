import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  back: ReactNode;
  openSections: () => void;
  mode?: "read" | "edit";
  onModeChange?: (mode: "read" | "edit") => void;
  status: string;
  actions: ReactNode;
  nameField?: ReactNode;
};

export function PatternWorkspaceHeader({ title, back, openSections, mode, onModeChange, status, actions, nameField }: Props) {
  return (
    <header className="pattern-header">
      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <Button variant="outline" size="icon" asChild>{back}</Button>
        <div className="min-w-0">
          <span className="text-sm font-semibold text-primary">Stitchling</span>
          <h1 className="truncate text-lg font-bold" title={title}>{title}</h1>
        </div>
        <Button variant="outline" size="icon" onClick={openSections} aria-label="Open pattern sections" title="Pattern sections"><Menu /></Button>
      </div>
      <div className="pattern-header-controls">
        {mode && onModeChange && (
          <div className="inline-flex shrink-0 gap-1 rounded-lg bg-muted p-1" aria-label="Pattern mode">
            <Button variant={mode === "read" ? "outline" : "ghost"} aria-pressed={mode === "read"} onClick={() => onModeChange("read")}>Read</Button>
            <Button variant={mode === "edit" ? "outline" : "ghost"} aria-pressed={mode === "edit"} onClick={() => onModeChange("edit")}>Edit</Button>
          </div>
        )}
        <span className="pattern-save-status text-sm text-muted-foreground">{status}</span>
        {nameField && <div className="pattern-name-field min-w-0">{nameField}</div>}
        <div className="pattern-header-actions">{actions}</div>
      </div>
    </header>
  );
}