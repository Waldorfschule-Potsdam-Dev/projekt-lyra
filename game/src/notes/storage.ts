/**
 * Persistenz-Schicht für Notizen.
 *
 * Da es im Projekt Lyra kein echtes Backend gibt, nutzen wir
 * `localStorage` als dauerhaften Speicher. Diese Datei kapselt
 * sämtliche Lese-/Schreib-Operationen, sodass die UI-Komponenten
 * nichts über das Speicherformat wissen müssen.
 *
 * Vorteile dieser Trennung:
 *  - Komponenten bleiben klein und testbar.
 *  - Ein späterer Wechsel auf eine API oder IndexedDB erfordert
 *    nur Änderungen in dieser einen Datei.
 */

import type { Note } from "./types";

/** Schlüssel, unter dem alle Notizen im localStorage abgelegt werden. */
const STORAGE_KEY = "escape.notes.v1";

/**
 * Erzeugt eine einfache, aber ausreichend eindeutige ID.
 *
 * Wir nutzen `crypto.randomUUID()`, falls verfügbar (moderne Browser),
 * und fallen sonst auf einen Zeitstempel + Zufallswert zurück.
 */
function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Liest das komplette Notiz-Array aus dem localStorage.
 *
 * Fehlende oder korrupte Daten werden als leeres Array behandelt,
 * damit die App auch bei Erstnutzung oder manipuliertem Storage
 * stabil bleibt.
 */
export function loadNotes(): Note[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    // Defensive Normalisierung: fehlende Felder werden aufgefüllt,
    // damit der Rest der App keine Null-Checks überall braucht.
    return parsed
      .filter((item): item is Note => typeof item === "object" && item !== null && "id" in item)
      .map((note) => ({
        id: String(note.id ?? generateId()),
        title: String(note.title ?? ""),
        body: String(note.body ?? ""),
        createdAt: String(note.createdAt ?? new Date().toISOString()),
        updatedAt: String(note.updatedAt ?? new Date().toISOString()),
      }));
  } catch (error) {
    // Storage kann z. B. durch Browser-Quota oder Private-Mode kaputt sein.
    // Wir geben ein leeres Array zurück statt die App zu crashen.
    console.warn("[notes] Konnte Notizen nicht laden:", error);
    return [];
  }
}

/**
 * Schreibt das übergebene Notiz-Array zurück in den localStorage.
 *
 * Fehler beim Schreiben (z. B. Quota überschritten) werden geloggt,
 * aber nicht weitergeworfen – die UI soll weiter benutzbar bleiben.
 */
export function saveNotes(notes: Note[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.warn("[notes] Konnte Notizen nicht speichern:", error);
  }
}

/**
 * Erzeugt eine neue, leere Notiz mit sinnvollen Defaults.
 *
 * Wird sowohl für "Neue Notiz erstellen" als auch als Factory
 * in den Seed-Daten verwendet.
 */
export function createEmptyNote(): Note {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: "",
    body: "",
    createdAt: now,
    updatedAt: now,
  };
}
