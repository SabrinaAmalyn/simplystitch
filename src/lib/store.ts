// Tiny persisted app store (character config + pattern draft).
import { useSyncExternalStore } from "react";
import { type CharacterConfig, DEFAULT_CONFIG } from "./character";

export type Draft = { text: string; configKey: string; edited: boolean; generatedAt: number };
type State = { config: CharacterConfig; draft: Draft | null; previous: Draft | null };

const KEY = "stitchling-state-v1";
const initial: State = { config: DEFAULT_CONFIG, draft: null, previous: null };
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
      state = { ...initial, ...parsed, config: { ...DEFAULT_CONFIG, ...parsed.config } };
      listeners.forEach((l) => l());
    }
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
