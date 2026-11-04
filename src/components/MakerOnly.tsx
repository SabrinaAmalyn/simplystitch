// ============= Full file contents =============

import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { canCreatePatterns } from "@/lib/roles";

/**
 * Maker workspace only. Team accounts are stats-only: they see maker analytics
 * on the Team page and can never open the customizer or create patterns.
 */
export function MakerOnly({ children }: { children: ReactNode }) {
  const { roles, loading } = useAuth();
  if (loading) return null;
  if (!canCreatePatterns(roles)) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
