import { useEffect, useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/roles";

export type { AppRole };

type AuthState = { user: User | null; roles: AppRole[]; loading: boolean };

// One shared auth store for the whole app. Per-component state made every page
// change start "loading" again (blank screen / wrong page flashes) and token
// refreshes on tab focus briefly wiped roles.
let state: AuthState = { user: null, roles: [], loading: true };
const listeners = new Set<() => void>();
const SERVER: AuthState = { user: null, roles: [], loading: true };
let started = false;
let loadedFor: string | null | undefined;

function set(next: AuthState) {
  state = next;
  listeners.forEach((l) => l());
}

async function load(u: User | null) {
  const id = u?.id ?? null;
  if (id === loadedFor && !state.loading) {
    if (u && state.user !== u) set({ ...state, user: u });
    return;
  }
  loadedFor = id;
  if (!u) { set({ user: null, roles: [], loading: false }); return; }
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id);
  if (loadedFor !== id) return;
  set({ user: u, roles: (data ?? []).map((r) => r.role as AppRole), loading: false });
}

function start() {
  if (started) return;
  started = true;
  supabase.auth.onAuthStateChange((_e, session) => {
    setTimeout(() => void load(session?.user ?? null), 0);
  });
  void supabase.auth.getUser().then(({ data }) => load(data.user));
}

/** Current signed-in user plus their roles (roles read from the protected roles table). */
export function useAuth() {
  useEffect(start, []);
  const s = useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => state,
    () => SERVER,
  );
  const isSuperAdmin = s.roles.includes("super_admin");
  const isAdmin = isSuperAdmin || s.roles.includes("admin");
  return { user: s.user, roles: s.roles, loading: s.loading, isAdmin, isSuperAdmin };
}

export function roleLabel(roles: AppRole[]) {
  if (roles.includes("super_admin")) return "Super Admin";
  if (roles.includes("admin")) return "Admin";
  return "Maker";
}
