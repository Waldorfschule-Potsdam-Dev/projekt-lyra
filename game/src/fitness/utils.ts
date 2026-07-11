import {
  STORAGE_KEY_ROUTES,
  STORAGE_KEY_THEME,
  STORAGE_KEY_LAST_STARTED,
  DEFAULT_LAST_STARTED_ID,
  WORKOUTS,
  buildSeedRoutes,
} from './data';
import type { SavedRoute, Theme, Workout } from './types';

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY_THEME) as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

export function getLastWorkout(): Workout {
  if (typeof window === 'undefined') {
    return WORKOUTS.find((w) => w.id === DEFAULT_LAST_STARTED_ID) ?? WORKOUTS[0];
  }
  const id = localStorage.getItem(STORAGE_KEY_LAST_STARTED) ?? DEFAULT_LAST_STARTED_ID;
  return WORKOUTS.find((w) => w.id === id) ?? WORKOUTS[0];
}

export function setLastWorkout(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_LAST_STARTED, id);
  } catch {
    /* ignore */
  }
}

export function loadRoutes(): SavedRoute[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROUTES);
    if (!raw) {
      const seed = buildSeedRoutes();
      localStorage.setItem(STORAGE_KEY_ROUTES, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as SavedRoute[];
    if (!Array.isArray(parsed)) {
      const seed = buildSeedRoutes();
      localStorage.setItem(STORAGE_KEY_ROUTES, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch {
    return buildSeedRoutes();
  }
}

export function saveRoutes(routes: SavedRoute[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ROUTES, JSON.stringify(routes));
  } catch {
    /* quota überschritten — egal */
  }
}

export function formatRouteDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(2)} km`;
}

export function formatRouteDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatRouteDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.floor((startOfDay(now) - startOfDay(d)) / 86400000);
  const time = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 0) return `Heute, ${time}`;
  if (diffDays === 1) return `Gestern, ${time}`;
  if (diffDays < 7) {
    return `${d.toLocaleDateString('de-DE', { weekday: 'long' })}, ${time}`;
  }
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}
