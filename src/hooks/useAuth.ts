import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/roles";

export type { AppRole };

/** Current signed-in user plus their roles (roles read from the protected roles table). */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async (u: User | null) => {
      if (!active) return;
      setUser(u);
      if (!u) { setRoles([]); setLoading(false); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id);
      if (!active) return;
      setRoles((data ?? []).map((r) => r.role as AppRole));
      setLoading(false);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setTimeout(() => load(session?.user ?? null), 0);
    });
    supabase.auth.getUser().then(({ data }) => load(data.user));
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  const isSuperAdmin = roles.includes("super_admin");
  const isAdmin = isSuperAdmin || roles.includes("admin");
  return { user, roles, loading, isAdmin, isSuperAdmin };
}

export function roleLabel(roles: AppRole[]) {
  if (roles.includes("super_admin")) return "Super Admin";
  if (roles.includes("admin")) return "Admin";
  return "Maker";
}
