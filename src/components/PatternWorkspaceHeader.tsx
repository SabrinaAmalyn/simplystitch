import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  back: ReactNode;
  status: string;
  actions: ReactNode;
  nameField?: ReactNode;
};

export function PatternWorkspaceHeader({ title, back, status, actions, nameField }: Props) {
  return (
    <header className="pattern-header">
      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <Button variant="outline" size="icon" asChild>{back}</Button>
        <div className="min-w-0">
          <span className="text-sm font-semibold text-primary">Stitchling</span>
          <h1 className="truncate text-lg font-bold" title={title}>{title}</h1>
        </div>
      </div>
      <div className="pattern-header-controls pattern-header-saved">
        <span className="pattern-save-status text-sm text-muted-foreground">{status}</span>
        {nameField && <div className="pattern-name-field min-w-0">{nameField}</div>}
        <div className="pattern-header-actions">{actions}</div>
      </div>
    </header>
  );
}