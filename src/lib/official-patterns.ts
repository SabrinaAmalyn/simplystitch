// Official SimplyStitch patterns designed by the team and optionally featured on the landing page.
// Kept in their own table so team designs never mix with maker analytics.
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { CharacterConfig } from "./character";
import { migratePartColors } from "./character";
import { normalizeLayers } from "./character-layers";
import { setState } from "./store";

export type OfficialPattern = {
  id: string;
  name: string;
  description: string;
  config: CharacterConfig;
  text: string;
  is_featured: boolean;
  created_at: string;
  view_count: number;
  click_count: number;
  customize_count: number;
  download_count: number;
};
export type TrackKind = "view" | "click" | "customize" | "download";

type Row = Omit<OfficialPattern, "config"> & { config: Json };
const toPattern = (r: Row): OfficialPattern => ({ ...r, config: r.config as unknown as CharacterConfig });
const COLS = "id, name, description, config, text, is_featured, created_at, view_count, click_count, customize_count, download_count";

export async function listFeatured(): Promise<OfficialPattern[]> {
  const { data } = await supabase.from("official_patterns").select(COLS).eq("is_featured", true).order("created_at", { ascending: false });
  return ((data ?? []) as Row[]).map(toPattern);
}

/** Team view: every official pattern including hidden test designs. */
export async function listAllOfficial(): Promise<OfficialPattern[]> {
  const { data } = await supabase.from("official_patterns").select(COLS).order("created_at", { ascending: false });
  return ((data ?? []) as Row[]).map(toPattern);
}

export async function getOfficial(id: string): Promise<OfficialPattern | null> {
  const { data } = await supabase.from("official_patterns").select(COLS).eq("id", id).maybeSingle();
  return data ? toPattern(data as Row) : null;
}

export async function createOfficial(input: { name: string; description: string; config: CharacterConfig; text: string; featured: boolean; userId: string }) {
  const { data, error } = await supabase.from("official_patterns").insert({
    name: input.name, description: input.description, config: input.config as unknown as Json,
    text: input.text, is_featured: input.featured, created_by: input.userId,
  }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function setFeatured(id: string, featured: boolean) {
  const { error } = await supabase.from("official_patterns").update({ is_featured: featured, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function deleteOfficial(id: string) {
  const { error } = await supabase.from("official_patterns").delete().eq("id", id);
  if (error) throw error;
}

/** Bumps an engagement counter; team members' own activity is ignored server-side. */
export function trackOfficial(id: string, kind: TrackKind) {
  void supabase.rpc("track_official_pattern", { _id: id, _kind: kind });
}

/** Per-session dedupe so refreshing the landing page doesn't inflate views. */
export function trackOnce(id: string, kind: TrackKind) {
  if (typeof window === "undefined") return;
  const key = `ss-tracked:${kind}:${id}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
  trackOfficial(id, kind);
}

const cleanConfig = (c: CharacterConfig): CharacterConfig => {
  const migrated = migratePartColors(c);
  return { ...migrated, layered: normalizeLayers(migrated.layered) };
};

/** Starts the customizer from an official design as a fresh (unsaved) character. */
export function remixOfficial(p: OfficialPattern) {
  setState((s) => ({ ...s, editingPatternId: null, config: cleanConfig(p.config) }));
}

/** Adds an official pattern to the maker's My Patterns, crediting SimplyStitch. */
export function saveOfficialToLibrary(p: OfficialPattern): string {
  const id = `official-${p.id}-${Date.now().toString(36)}`;
  setState((s) => ({
    ...s,
    library: [{ id, name: `${p.name} (by SimplyStitch)`, savedAt: Date.now(), config: cleanConfig(p.config), initialText: p.text, text: p.text }, ...s.library],
  }));
  return id;
}
