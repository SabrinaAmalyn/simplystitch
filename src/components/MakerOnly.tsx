// ============= Full file contents =============

import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { canCreatePatterns } from "@/lib/roles";

/** Maker workspace only. Team accounts are stats-only and land on the Team page instead. */
export function MakerOnly({ children }: { children: ReactNode }) {
  const { roles, loading } = useAuth();
  if (loading) return null;
  if (!canCreatePatterns(roles)) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
