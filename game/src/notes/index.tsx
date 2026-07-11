/**
 * Einstiegspunkt der Notizen-App.
 *
 * Architektur:
 *
 *   `store.ts`         ← external stores (Notizen + Theme)
 *   `theme.ts`         ← Theme-Provider, Light/Dark-Tokens
 *   `index.tsx`        ← Routen + Verteilung der Callbacks
 *     ├── `NoteList`   ← Übersicht, Suche, Sortierung, FAB, Theme-Toggle
 *     └── `NoteEditor` ← Editor mit Auto-Save
 *
 * Der State lebt komplett im `store.ts`. Die Komponenten sind reine
 * Views, die ihre Daten via `useSyncExternalStore` lesen und ihre
 * Mutationen an die Store-Funktionen delegieren.
 */

import { useEffect, useMemo, useRef } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { useSyncExternalStore } from "react";
import NoteList from "./NoteList";
import NoteEditor from "./NoteEditor";
import { createNote, getSnapshot, removeNote, subscribe, upsertNote } from "./store";
import type { Note } from "./types";
import { rootStyle } from "./styles";
import { ThemeProvider, useTheme } from "./theme";

export default function NotizenApp() {
  return (
    <ThemeProvider>
      <NotizenShell />
    </ThemeProvider>
  );
}

/**
 * Innerer Shell: alles, was das aktuelle Theme braucht,
 * lebt innerhalb des `<ThemeProvider>`. So kann `useTheme()`
 * gefahrlos in den Screens aufgerufen werden.
 */
function NotizenShell() {
  /**
   * Subscribed auf den Notiz-Store. `useSyncExternalStore` sorgt dafür,
   * dass die Komponente nur dann re-rendert, wenn sich der Snapshot
   * wirklich geändert hat.
   */
  const notes = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Theme nur für den Root-Container gebraucht – hier lesen, nicht in
  // jeder Komponente, damit Updates am Theme den App-Body mitziehen.
  const { theme } = useTheme();

  // In StrictMode mountet React doppelt – das ist beim read-only
  // Subscribe harmlos, Listener werden sauber entfernt.
  useEffect(() => undefined, []);

  return (
    <div
      style={{
        ...rootStyle,
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      <Routes>
        <Route
          path="/"
          element={
            <NoteList
              notes={notes}
              onCreate={createNote}
            />
          }
        />
        <Route
          path="/:id"
          element={
            <EditNoteRoute
              notes={notes}
              onSave={upsertNote}
              onDiscard={removeNote}
            />
          }
        />
      </Routes>
    </div>
  );
}

/**
 * Route-Wrapper für "Notiz erstellen / bearbeiten".
 *
 *  - "new" erzeugt eine frische Notiz und ersetzt die URL durch
 *    `/notes/<neue-id>`, damit der Browser-Back-Button zur Liste führt.
 *  - Eine vorhandene ID lädt die passende Notiz und reicht sie an
 *    den Editor weiter.
 *  - Existiert die ID nicht (mehr), wird still auf die Liste geleitet.
 */
function EditNoteRoute({
  notes,
  onSave,
  onDiscard,
}: {
  notes: Note[];
  onSave: (patch: { id?: string; title: string; body: string }) => void;
  onDiscard: (id: string) => void;
}) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Verhindert, dass der "neue Notiz"-Flow mehrfach pro Mount
  // ausgelöst wird (defensiv gegen React-StrictMode-Doppel-Invoke
  // und instabile `navigate`-Referenzen). Ohne diesen Guard kann
  // ein zweiter Aufruf von `createNote` mit identischem `id === "new"`
  // passieren, bevor die Navigation wirksam wird – das erzeugte eine
  // ungewollte zweite Notiz und triggert weitere Re-Renders.
  const hasCreatedRef = useRef(false);

  useEffect(() => {
    if (id === "new" && !hasCreatedRef.current) {
      hasCreatedRef.current = true;
      const newId = createNote();
      navigate(`/notes/${newId}`, { replace: true });
    }
  }, [id, navigate]);

  // Aktuelle Notiz nachschlagen (memoized, damit der Editor nur dann
  // re-rendert, wenn sich der Inhalt wirklich geändert hat).
  const note = useMemo(
    () => (id && id !== "new" ? notes.find((n) => n.id === id) ?? null : null),
    [notes, id],
  );

  // Notiz nicht (mehr) vorhanden → zurück zur Liste.
  useEffect(() => {
    if (id && id !== "new" && !note) {
      navigate("/notes", { replace: true });
    }
  }, [id, note, navigate]);

  /**
   * `key` erzwingt einen frischen Mount des Editors, wenn der Nutzer
   * zu einer anderen Notiz navigiert. So wird der lokale Form-State
   * (Titel, Body) sauber zurückgesetzt – ohne prop-to-state-Sync.
   */
  return (
    <NoteEditor
      key={note?.id ?? "creating"}
      note={note}
      onSave={onSave}
      onDiscard={onDiscard}
    />
  );
}
