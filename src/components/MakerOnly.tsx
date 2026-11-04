import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { canCreatePatterns } from "@/lib/roles";

/**
 * Maker workspace only. Team accounts are stats-only and are sent to /admin,
 * except on the customizer and draft pages (allowTeam) where they design
 * official patterns — those saves go to the official showcase, never maker data.
 */
export function MakerOnly({ children, allowTeam = false }: { children: ReactNode; allowTeam?: boolean }) {
  const { roles, loading } = useAuth();
  if (loading) return null;
  if (!allowTeam && !canCreatePatterns(roles)) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
