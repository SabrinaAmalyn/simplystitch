// Tiny persisted app store (character config + pattern draft).
import { useSyncExternalStore } from "react";
import { type CharacterConfig, DEFAULT_CONFIG, migratePartColors } from "./character";
import { createLayeredCharacter, normalizeLayers } from "./character-layers";

export type Draft = {
  text: string;
  /** Pattern exactly as first generated; kept so the edited version can be compared. */
  initialText?: string;
  configKey: string;
  edited: boolean;
  saved?: boolean;
  generatedAt: number;
};
export type SavedPattern = {
  id: string;
  name: string;
  savedAt: number;
  config: CharacterConfig;
  initialText: string;
  text: string;
};
/** Completed row keys per pattern version; never touches pattern text. */
export type Progress = Record<string, string[]>;
type State = { config: CharacterConfig; draft: Draft | null; previous: Draft | null; library: SavedPattern[]; progress?: Progress | undefined };

const KEY = "stitchling-state-v1";
const BASE_KEY = "stitchling-doll-base-v2";
const initial: State = { config: { ...DEFAULT_CONFIG, layered: createLayeredCharacter() }, draft: null, previous: null, library: [] };

export function defaultPatternName(library: SavedPattern[]) {
  return `SimplyStitch #${library.length + 1}`;
}

/** Adds the current character + draft to the library and returns the new id. */
export function savePatternToLibrary(name: string): string | null {
  const { draft, config } = state;
  if (!draft) return null;
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const carried = state.progress?.[progressKey(draft.text)];
  const entry: SavedPattern = {
    id,
    name: name.trim() || defaultPatternName(state.library),
    savedAt: Date.now(),
    config,
    initialText: draft.initialText ?? draft.text,
    text: draft.text,
  };
  setState((s) => {
    const next: State = { ...s, library: [entry, ...s.library], draft: s.draft && { ...s.draft, saved: true } };
    if (carried) next.progress = { ...s.progress, [`saved:${id}`]: carried };
    return next;
  });
  return id;
}

export function renamePattern(id: string, name: string) {
  const n = name.trim();
  if (!n) return;
  setState((s) => ({ ...s, library: s.library.map((p) => (p.id === id ? { ...p, name: n } : p)) }));
}

export function deletePattern(id: string) {
  setState((s) => ({ ...s, library: s.library.filter((p) => p.id !== id), progress: Object.fromEntries(Object.entries(s.progress ?? {}).filter(([k]) => k !== `saved:${id}`)) }));
}

export function loadPatternIntoCustomizer(id: string) {
  const p = state.library.find((x) => x.id === id);
  if (!p) return;
  setState((s) => ({ ...s, config: p.config }));
}
/** Stable key for one pattern version: saved id (text immutable) or a hash of draft text. */
export function progressKey(text: string, savedId?: string) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return savedId ? `saved:${savedId}` : `draft:${(h >>> 0).toString(36)}`;
}

export function toggleRows(key: string, rows: string[], done: boolean) {
  setState((s) => {
    const cur = new Set(s.progress?.[key] ?? []);
    rows.forEach((r) => (done ? cur.add(r) : cur.delete(r)));
    return { ...s, progress: { ...s.progress, [key]: Array.from(cur) } };
  });
}

export function resetProgress(key: string) {
  setState((s) => {
    const next = { ...s.progress };
    delete next[key];
    return { ...s, progress: next };
  });
}

let state: State = initial;
const listeners = new Set<() => void>();

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function setState(fn: (s: State) => State) {
  state = fn(state);
  emit();
}

let hydrated = false;
export function hydrateStore() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      state = { ...initial, ...parsed, library: Array.isArray(parsed.library) ? parsed.library : [], config: { ...DEFAULT_CONFIG, ...parsed.config, face: { ...DEFAULT_CONFIG.face, ...parsed.config?.face } } };
      if (!localStorage.getItem(BASE_KEY)) {
        state = { ...state, config: { ...state.config, ears: "none", accessories: [], colors: { ...state.config.colors, main: "peach" } } };
      }
      state = { ...state, config: { ...migratePartColors(state.config), layered: normalizeLayers(parsed.config?.layered) } };
      listeners.forEach((l) => l());
    }
    localStorage.setItem(BASE_KEY, "true");
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore corrupted storage */
  }
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => sel(state),
    () => sel(initial),
  );
}
