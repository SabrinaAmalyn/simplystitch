// Tiny persisted app store (character config + pattern draft).
import { useSyncExternalStore } from "react";
import { type CharacterConfig, DEFAULT_CONFIG, migratePartColors } from "./character";
import { createLayeredCharacter, normalizeLayers } from "./character-layers";
import { generatePattern, patternToText } from "./pattern";

const SAMPLE_KEY = "simplystitch-sample-v1";
/** Example pattern added once for first-time visitors so My Patterns is never empty. */
export function buildSamplePattern(): SavedPattern {
  const config: CharacterConfig = {
    ...DEFAULT_CONFIG,
    colors: { ...DEFAULT_CONFIG.colors, main: "cream", leftInnerEar: "blush", rightInnerEar: "blush" },
    ears: "long",
    face: { ...DEFAULT_CONFIG.face, expression: "happy", cheeks: true },
    layered: createLayeredCharacter(),
  };
  const text = patternToText(generatePattern(config));
  return { id: "sample-berry-bunny", name: "Berry Bunny (example)", savedAt: Date.now(), config, initialText: text, text };
}

export type Draft = {
  text: string;
  /** Pattern exactly as first generated; kept so the edited version can be compared. */
  initialText?: string;
  configKey: string;
  edited: boolean;
  saved?: boolean;
  generatedAt: number;
};
/** An earlier snapshot of a saved pattern, kept when it is updated. */
export type PatternRevision = { savedAt: number; name: string; config: CharacterConfig; text: string };
export type SavedPattern = {
  id: string;
  name: string;
  savedAt: number;
  config: CharacterConfig;
  initialText: string;
  text: string;
  history?: PatternRevision[];
};
/** Completed row keys per pattern version; never touches pattern text. */
export type Progress = Record<string, string[]>;
type State = {
  config: CharacterConfig;
  draft: Draft | null;
  previous: Draft | null;
  library: SavedPattern[];
  progress?: Progress | undefined;
  /** Saved pattern the customizer was opened from, so Save can update it. */
  editingPatternId?: string | null | undefined;
  hydrated?: boolean | undefined;
};

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
    const next: State = { ...s, library: [entry, ...s.library], draft: s.draft && { ...s.draft, saved: true }, editingPatternId: id };
    if (carried) next.progress = { ...s.progress, [`saved:${id}`]: carried };
    return next;
  });
  return id;
}

/** Replaces a saved pattern with the current character + draft, archiving the old version. */
export function updatePatternInLibrary(id: string, name?: string): string | null {
  const { draft, config } = state;
  const old = state.library.find((p) => p.id === id);
  if (!draft || !old) return null;
  const revision: PatternRevision = { savedAt: old.savedAt, name: old.name, config: old.config, text: old.text };
  const updated: SavedPattern = {
    ...old,
    name: name?.trim() || old.name,
    savedAt: Date.now(),
    config,
    initialText: draft.initialText ?? draft.text,
    text: draft.text,
    history: [revision, ...(old.history ?? [])],
  };
  setState((s) => {
    const progress = { ...s.progress };
    if (old.text !== draft.text) delete progress[`saved:${id}`];
    return {
      ...s,
      progress,
      library: [updated, ...s.library.filter((p) => p.id !== id)],
      draft: s.draft && { ...s.draft, saved: true },
    };
  });
  return id;
}

export function renamePattern(id: string, name: string) {
  const n = name.trim();
  if (!n) return;
  setState((s) => ({ ...s, library: s.library.map((p) => (p.id === id ? { ...p, name: n } : p)) }));
}

export function deletePattern(id: string) {
  setState((s) => ({ ...s, editingPatternId: s.editingPatternId === id ? null : s.editingPatternId, library: s.library.filter((p) => p.id !== id), progress: Object.fromEntries(Object.entries(s.progress ?? {}).filter(([k]) => k !== `saved:${id}`)) }));
}

export function loadPatternIntoCustomizer(id: string) {
  const p = state.library.find((x) => x.id === id);
  if (!p) return;
  setState((s) => ({ ...s, config: p.config, editingPatternId: id }));
}

/** Starting fresh (reset) detaches the customizer from any saved pattern. */
export function stopEditingPattern() {
  setState((s) => ({ ...s, editingPatternId: null }));
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
    if (!localStorage.getItem(SAMPLE_KEY)) {
      localStorage.setItem(SAMPLE_KEY, "true");
      if (state.library.length === 0) state = { ...state, library: [buildSamplePattern()] };
    }
    localStorage.setItem(BASE_KEY, "true");
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore corrupted storage */
  }
  state = { ...state, hydrated: true };
  listeners.forEach((l) => l());
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
