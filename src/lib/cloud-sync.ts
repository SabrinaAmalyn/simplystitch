// Mirrors a signed-in maker's saved patterns to the cloud database.
// The local store stays the source for the UI; this only copies changes up and pulls missing ones down.
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { getStoreState, setState, subscribeStore, type SavedPattern } from "./store";

const isExample = (id: string) => id.startsWith("sample-");
const fingerprint = (p: SavedPattern) => `${p.savedAt}|${p.name}|${p.text.length}|${p.history?.length ?? 0}`;

export function toRow(p: SavedPattern, userId: string) {
  return {
    id: p.id,
    user_id: userId,
    name: p.name,
    config: p.config as unknown as Json,
    initial_text: p.initialText,
    text: p.text,
    history: (p.history ?? []) as unknown as Json,
    saved_at: new Date(p.savedAt).toISOString(),
    updated_at: new Date().toISOString(),
  };
}

type Row = ReturnType<typeof toRow>;
export function fromRow(r: Row): SavedPattern {
  return {
    id: r.id,
    name: r.name,
    savedAt: new Date(r.saved_at).getTime(),
    config: r.config as unknown as SavedPattern["config"],
    initialText: r.initial_text,
    text: r.text,
    history: (r.history as unknown as SavedPattern["history"]) ?? [],
  };
}

let userId: string | null = null;
let pushed = new Map<string, string>();
let timer: ReturnType<typeof setTimeout> | null = null;
let unsubscribe: (() => void) | null = null;

async function push() {
  if (!userId) return;
  const uid = userId;
  const lib = getStoreState().library.filter((p) => !isExample(p.id));
  const changed = lib.filter((p) => pushed.get(p.id) !== fingerprint(p));
  const removed = [...pushed.keys()].filter((id) => !lib.some((p) => p.id === id));
  if (changed.length) {
    const { error } = await supabase.from("patterns").upsert(changed.map((p) => toRow(p, uid)));
    if (!error) changed.forEach((p) => pushed.set(p.id, fingerprint(p)));
  }
  if (removed.length) {
    const { error } = await supabase.from("patterns").delete().in("id", removed);
    if (!error) removed.forEach((id) => pushed.delete(id));
  }
}

function schedule() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void push(), 800);
}

async function start(uid: string) {
  if (userId === uid) return;
  stop();
  userId = uid;
  pushed = new Map();
  // Team accounts only test the maker flow: their drafts never reach maker analytics.
  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", uid);
  if (userId !== uid) return;
  if ((roleRows ?? []).some((r) => r.role === "admin" || r.role === "super_admin")) { userId = null; return; }
  const { data } = await supabase.from("patterns").select("*").eq("user_id", uid);
  if (userId !== uid) return;
  const remote = (data ?? []).map((r) => fromRow(r as Row));
  remote.forEach((p) => pushed.set(p.id, fingerprint(p)));
  const local = getStoreState().library;
  const missing = remote.filter((r) => !local.some((l) => l.id === r.id));
  if (missing.length) {
    setState((s) => ({ ...s, library: [...s.library, ...missing].sort((a, b) => b.savedAt - a.savedAt) }));
  }
  unsubscribe = subscribeStore(schedule);
  void push();
}

function stop() {
  unsubscribe?.();
  unsubscribe = null;
  if (timer) clearTimeout(timer);
  userId = null;
}

/** Call once on the client; follows sign-in and sign-out. */
export function startCloudSync() {
  void supabase.auth.getUser().then(({ data }) => data.user && start(data.user.id));
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") stop();
    else if (session?.user) void start(session.user.id);
  });
  return () => { data.subscription.unsubscribe(); stop(); };
}
