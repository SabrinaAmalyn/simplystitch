import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/ProfileMenu";

type Props = {
  title: string;
  back: ReactNode;
  status: string;
  actions: ReactNode;
  nameField?: ReactNode;
  /** Middle slot, e.g. journey steps. */
  center?: ReactNode;
  /** Show the profile icon (omit inside the account layout, which has its own). */
  profile?: boolean;
};

/** Full-width top bar matching the customizer header. */
export function PatternWorkspaceHeader({ title, back, status, actions, nameField, center, profile }: Props) {
  return (
    <header className="pattern-header">
      <div className="pattern-header-brand">
        <Button variant="outline" size="icon" asChild>{back}</Button>
        <div className="min-w-0">
          <Link to="/" className="block font-logo text-2xl uppercase leading-tight">SimplyStitch</Link>
          <span className="block truncate text-xs text-muted-foreground" title={title}>{title} · {status}</span>
        </div>
      </div>
      {center && <div className="pattern-header-center">{center}</div>}
      <div className="pattern-header-controls">
        {nameField && <div className="pattern-name-field min-w-0">{nameField}</div>}
        <div className="pattern-header-actions">{actions}</div>
        {profile && <ProfileMenu />}
      </div>
    </header>
  );
}
