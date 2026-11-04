import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { memberStats, type MemberStats, type PatternRow, type PrefsRow, type RoleRow, type YarnRow } from "@/lib/team-stats";

export type TeamMemberRow = MemberStats & { mustChangePassword: boolean };

/** Loads every account's stats for the team console (team RLS grants read access). */
export function useTeamData() {
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState<TeamMemberRow[]>([]);
  const [patterns, setPatterns] = useState<PatternRow[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const [{ data: profiles }, { data: roleRows }, { data: patternRows }, { data: prefs }, { data: yarns }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, email, must_change_password").order("created_at"),
      supabase.from("user_roles").select("user_id, role") as PromiseLike<{ data: RoleRow[] | null }>,
      supabase.from("patterns").select("user_id, config") as PromiseLike<{ data: PatternRow[] | null }>,
      supabase.from("maker_preferences").select("user_id, written_terms, yarn_weight, hook_size") as PromiseLike<{ data: PrefsRow[] | null }>,
      supabase.from("maker_yarns").select("user_id") as PromiseLike<{ data: YarnRow[] | null }>,
    ]);
    const pats = (patternRows ?? []).map((p) => ({ user_id: p.user_id, config: p.config as unknown as PatternRow["config"] }));
    const flags = new Map((profiles ?? []).map((p) => [p.id, Boolean(p.must_change_password)]));
    setPatterns(pats);
    setMembers(
      memberStats({ profiles: profiles ?? [], roleRows: roleRows ?? [], patterns: pats, prefs: prefs ?? [], yarns: yarns ?? [] })
        .map((m) => ({ ...m, mustChangePassword: flags.get(m.id) ?? false })),
    );
    setReady(true);
  }, []);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);
  return { members, patterns, ready, reload: load };
}

export const isTeamRow = (m: MemberStats) => m.roles.includes("admin") || m.roles.includes("super_admin");
