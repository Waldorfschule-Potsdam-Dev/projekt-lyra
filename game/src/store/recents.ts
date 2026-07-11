import { create } from 'zustand';

const STORAGE_KEY = 'escape-recents';
const MAX_RECENTS = 8;

export type Recent = {
  id: string;
  path: string;
  openedAt: number;
};

type RecentsState = {
  recents: Recent[];
  push: (app: { id: string; path: string }) => void;
  removeById: (id: string) => void;
  clear: () => void;
};

function loadRecents(): Recent[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const result: Recent[] = [];
    for (const r of parsed) {
      if (
        r &&
        typeof r.id === 'string' &&
        typeof r.path === 'string' &&
        !seen.has(r.id)
      ) {
        seen.add(r.id);
        result.push({
          id: r.id,
          path: r.path,
          openedAt: typeof r.openedAt === 'number' ? r.openedAt : Date.now(),
        });
      }
      if (result.length >= MAX_RECENTS) break;
    }
    return result;
  } catch {
    return [];
  }
}

function saveRecents(recents: Recent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recents));
  } catch {
    // quota / privacy mode
  }
}

export const useRecents = create<RecentsState>((set, get) => ({
  recents: loadRecents(),

  push: (app) => {
    const filtered = get().recents.filter((r) => r.id !== app.id);
    const next: Recent[] = [
      { id: app.id, path: app.path, openedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENTS);
    saveRecents(next);
    set({ recents: next });
  },

  removeById: (id) => {
    const next = get().recents.filter((r) => r.id !== id);
    saveRecents(next);
    set({ recents: next });
  },

  clear: () => {
    saveRecents([]);
    set({ recents: [] });
  },
}));
