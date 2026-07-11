/**
 * External Store für Notizen.
 *
 * Wir kapseln die Notizliste in einem Modul-level Store und lesen
 * sie in den Komponenten via `useSyncExternalStore` (React 19) aus.
 *
 * Vorteile gegenüber `useState` + `useEffect`:
 *  - State-Updates sind synchron mit den Events verknüpft
 *    (kein "Racing" zwischen `setNotes` und `navigate`).
 *  - Keine `useEffect`-setState-Cascade-Renders, kein zusätzlicher
 *    Hydration-Effekt nötig.
 *  - Die Komponenten bleiben "dumm" – sie greifen nur lesend zu
 *    und delegieren Mutationen an die Store-Funktionen.
 *
 * Persistenz:
 *  - `saveNotes` wird nach JEDER Mutation aufgerufen.
 *  - `loadInitial` entscheidet, ob Seed-Daten notwendig sind.
 */

import type { Note } from "./types";
import { createEmptyNote, loadNotes, saveNotes } from "./storage";
import { seedNotes } from "./seed";

/** Schlüssel für die "First-Run"-Markierung. */
const SEED_FLAG_KEY = "escape.notes.seeded.v1";

/** localStorage-Key für den Theme-Modus (siehe auch `theme.ts`). */
const THEME_KEY = "escape.notes.theme.v1";

/** Mögliche Theme-Modi. */
export type ThemeMode = "light" | "dark";

/** Erzeugt eine stabile, eindeutige ID (Fallback, falls `crypto.randomUUID` fehlt). */
function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/* ============================================================================
 * Store-Implementierung
 * ========================================================================== */

let notes: Note[] = [];
const listeners = new Set<() => void>();

/** Initiales Befüllen aus dem localStorage (mit Seed, falls leer). */
function loadInitial(): Note[] {
  const stored = loadNotes();
  const hasSeeded =
    typeof window !== "undefined" &&
    window.localStorage.getItem(SEED_FLAG_KEY) === "1";

  if (stored.length === 0 && !hasSeeded) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SEED_FLAG_KEY, "1");
    }
    saveNotes(seedNotes);
    return seedNotes;
  }
  return stored;
}

// Direkt beim Modul-Import initialisieren – so ist der Store beim
// ersten Render bereits befüllt und es gibt keinen "leeren Blitz".
notes = loadInitial();

/** Benachrichtigt alle Subscriber, dass sich der State geändert hat. */
function notify(): void {
  listeners.forEach((listener) => listener());
}

/* ----------------------------------------------------------------------------
 * Öffentliche API
 * -------------------------------------------------------------------------- */

/** Abonniert State-Änderungen. Gibt eine Unsubscribe-Funktion zurück. */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Aktueller Snapshot – WICHTIG: stabile Referenz, bis `notify` aufgerufen wird. */
export function getSnapshot(): Note[] {
  return notes;
}

/** Erzeugt eine neue, leere Notiz und liefert ihre ID zurück. */
export function createNote(): string {
  const fresh = createEmptyNote();
  notes = [fresh, ...notes];
  saveNotes(notes);
  notify();
  return fresh.id;
}

/**
 * Aktualisiert eine bestehende Notiz (anhand `patch.id`) oder legt
 * eine neue an, falls keine ID übergeben wurde.
 *
 * Setzt `updatedAt` automatisch auf "jetzt".
 */
export function upsertNote(patch: { id?: string; title: string; body: string }): void {
  const now = new Date().toISOString();

  if (!patch.id) {
    const created: Note = {
      id: newId(),
      title: patch.title,
      body: patch.body,
      createdAt: now,
      updatedAt: now,
    };
    notes = [created, ...notes];
  } else {
    notes = notes.map((n) =>
      n.id === patch.id
        ? { ...n, title: patch.title, body: patch.body, updatedAt: now }
        : n,
    );
  }

  saveNotes(notes);
  notify();
}

/** Entfernt eine Notiz anhand ihrer ID. */
export function removeNote(id: string): void {
  const next = notes.filter((n) => n.id !== id);
  if (next.length === notes.length) return; // keine Änderung → kein notify
  notes = next;
  saveNotes(notes);
  notify();
}

/* ============================================================================
 * Theme-Store
 *
 * Bewusst getrennt vom Notiz-Store: anderer Lebenszyklus, andere
 * Persistenz-Keys, andere Subscriber. Beide folgen dem gleichen
 * `subscribe` / `getSnapshot` / `notify`-Pattern, damit
 * `useSyncExternalStore` einheitlich funktioniert.
 * ========================================================================== */

let themeMode: ThemeMode = "light";
const themeListeners = new Set<() => void>();

/** Liest den initialen Theme-Modus aus dem localStorage. */
function loadInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const raw = window.localStorage.getItem(THEME_KEY);
    return raw === "dark" ? "dark" : "light";
  } catch (error) {
    console.warn("[notes] Konnte Theme nicht laden:", error);
    return "light";
  }
}

themeMode = loadInitialTheme();

/** Abonniert Theme-Änderungen. Gibt eine Unsubscribe-Funktion zurück. */
export function subscribeTheme(listener: () => void): () => void {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

/** Aktueller Theme-Snapshot (stabile Referenz bis `notifyTheme` läuft). */
export function getThemeSnapshot(): ThemeMode {
  return themeMode;
}

/**
 * Setzt den Theme-Modus explizit und persistiert ihn.
 *
 * Kein No-Op-Check: ein wiederholter Klick auf den Toggle-Button
 * soll sicher ein notify auslösen, falls die UI an anderer Stelle
 * auf Theme-Updates lauscht.
 */
export function setTheme(mode: ThemeMode): void {
  if (themeMode === mode) return;
  themeMode = mode;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(THEME_KEY, mode);
    } catch (error) {
      console.warn("[notes] Konnte Theme nicht speichern:", error);
    }
  }
  themeListeners.forEach((listener) => listener());
}
