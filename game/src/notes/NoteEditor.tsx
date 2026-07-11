/**
 * Editor zum Erstellen und Bearbeiten einer Notiz.
 *
 * Features:
 *  - Lokaler State für Titel und Body (debounced Auto-Save)
 *  - Live-Vorschau des gerenderten Bodies (Markdown + Auto-Links)
 *  - Robustes Speichern: Debounced + synchroner Flush bei
 *    `beforeunload` / `pagehide` (App-/Tab-Schließen) und beim
 *    Unmount (Route-Wechsel) – keine Eingabe geht verloren.
 *
 * Der Header ist bewusst minimal gehalten: nur der "Zurück"-Button.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Eye } from "lucide-react";
import type { Note } from "./types";
import { RADIUS, SPACE } from "./styles";
import { useTheme } from "./theme";
import RichBody from "./RichBody";
import { CollectClueButton } from "../components/CollectClueButton";

/** Zeit (in ms), die das Auto-Save nach der letzten Eingabe wartet. */
const AUTOSAVE_DELAY = 400;

/** Welcher Modus gerade aktiv ist. */
type ViewMode = "edit" | "preview";

interface Props {
  /** Aktuelle Notiz oder `null`, falls eine neue angelegt werden soll. */
  note: Note | null;
  /** Wird vom Auto-Save-Debounce und beim expliziten Speichern aufgerufen. */
  onSave: (patch: { id?: string; title: string; body: string }) => void;
  /** Wird genutzt, um leere, frisch erstellte Notizen wieder zu entfernen. */
  onDiscard: (id: string) => void;
}

export default function NoteEditor({ note, onSave, onDiscard }: Props) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isNew = !note;

  // Lokaler Form-State – entkoppelt die Eingabe vom globalen Notiz-State,
  // damit Tipp-Latenzen und Auto-Save getrennt voneinander laufen können.
  const [title, setTitle] = useState<string>(note?.title ?? "");
  const [body, setBody] = useState<string>(note?.body ?? "");
  const [mode, setMode] = useState<ViewMode>("edit");

  /**
   * Refs für "immer aktuelle" Werte.
   *
   * Die Save-Handler (Flush bei beforeunload / pagehide / Unmount)
   * lesen über diese Refs, damit sie nicht in stale Closures die
   * Werte vom Mount-Zeitpunkt verwenden.
   */
  const titleRef = useRef(title);
  const bodyRef = useRef(body);
  const idRef = useRef<string | undefined>(note?.id);
  const isNewRef = useRef(isNew);
  useEffect(() => {
    titleRef.current = title;
  }, [title]);
  useEffect(() => {
    bodyRef.current = body;
  }, [body]);
  useEffect(() => {
    idRef.current = note?.id;
  }, [note?.id]);
  useEffect(() => {
    isNewRef.current = isNew;
  }, [isNew]);

  /**
   * Synchroner Save – liest aktuelle Werte aus den Refs.
   *
   * Wird sowohl für den debounced Save (Tipp-Pause) als auch
   * für den sofortigen Flush beim Verlassen genutzt.
   */
  const flushSave = useCallback(() => {
    const t = titleRef.current;
    const b = bodyRef.current;
    const id = idRef.current;
    if (!isNewRef.current || t.trim() || b.trim()) {
      onSave({ id, title: t, body: b });
    }
  }, [onSave]);

  /* -------------------------------------------------------------------------
   * Auto-Save (debounced) + beforeunload / pagehide / Unmount-Flush
   * ----------------------------------------------------------------------- */

  useEffect(() => {
    const timer = setTimeout(flushSave, AUTOSAVE_DELAY);
    return () => clearTimeout(timer);
  }, [title, body, flushSave]);

  useEffect(() => {
    const flush = () => flushSave();
    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
      // Unmount = Route-Wechsel → letzten Stand sofort persistieren,
      // damit auch Tipp-Eingaben aus den letzten <400 ms nicht verloren gehen.
      flush();
    };
  }, [flushSave]);

  /* -------------------------------------------------------------------------
   * Zurück-Handler
   * ----------------------------------------------------------------------- */

  const handleBack = () => {
    // Frisch angelegte, komplett leere Notizen direkt wieder entfernen,
    // damit die Liste nicht mit "Geistereinträgen" zugemüllt wird.
    if (
      isNewRef.current &&
      !titleRef.current.trim() &&
      !bodyRef.current.trim() &&
      idRef.current
    ) {
      onDiscard(idRef.current);
    } else {
      flushSave();
    }
    navigate("/notes");
  };

  /* -------------------------------------------------------------------------
   * Render
   * ----------------------------------------------------------------------- */

  const headerStyle = useMemo<React.CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      padding: `${SPACE.md}px ${SPACE.lg}px`,
      borderBottom: `1px solid ${theme.border}`,
      background: theme.surface,
    }),
    [theme],
  );

  const ghostButton: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    border: "none",
    background: "transparent",
    color: theme.text,
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    borderRadius: RADIUS.pill,
    transition: "background 0.15s, color 0.15s",
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      {/* ============== Header ============== */}
      <header style={headerStyle}>
        <button
          type="button"
          onClick={handleBack}
          aria-label="Zurück zur Notizliste"
          style={ghostButton}
        >
          <ArrowLeft size={20} strokeWidth={1.8} />
          <span>Notizen</span>
        </button>
      </header>

      {/* ============== Editor-Body ============== */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: `${SPACE.xl}px ${SPACE.xl}px ${SPACE.xxl}px`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: SPACE.md }}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Titel"
            aria-label="Titel"
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 28,
              fontWeight: 700,
              color: theme.text,
              letterSpacing: -0.4,
              lineHeight: 1.2,
            }}
          />
          {note?.id === "seed-21" && <CollectClueButton clueId="notes:lyra" />}
        </div>

        {/* Tab-Switcher: Bearbeiten ↔ Vorschau */}
        <div
          role="tablist"
          aria-label="Ansicht wechseln"
          style={{
            display: "inline-flex",
            gap: 4,
            padding: 4,
            background: theme.surfaceElevated,
            borderRadius: RADIUS.pill,
            marginBottom: SPACE.lg,
          }}
        >
          <TabButton
            active={mode === "edit"}
            onClick={() => setMode("edit")}
            icon={<Pencil size={14} strokeWidth={2} />}
            label="Bearbeiten"
          />
          <TabButton
            active={mode === "preview"}
            onClick={() => setMode("preview")}
            icon={<Eye size={14} strokeWidth={2} />}
            label="Vorschau"
          />
        </div>

        {mode === "edit" ? (
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Schreib deine Gedanken auf…"
            aria-label="Notizinhalt"
            style={{
              width: "100%",
              minHeight: "55vh",
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 16,
              lineHeight: 1.7,
              color: theme.text,
              resize: "none",
              fontFamily: "inherit",
            }}
          />
        ) : (
          <div
            style={{
              minHeight: "55vh",
              padding: `${SPACE.md}px 0`,
            }}
          >
            <RichBody body={body} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * TabButton – kleiner interner Button für den Modus-Switcher.
 * Eigene Komponente, damit beide Tabs konsistent gestylt sind und
 * der aktive Tab eine klare Hervorhebung bekommt.
 * -------------------------------------------------------------------------- */
function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  const { theme } = useTheme();
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        border: "none",
        background: active ? theme.surface : "transparent",
        color: active ? theme.text : theme.textMuted,
        fontSize: 13,
        fontWeight: 600,
        borderRadius: RADIUS.pill,
        cursor: "pointer",
        boxShadow: active ? `0 1px 3px ${theme.shadow}` : "none",
        transition: "background 0.15s, color 0.15s, box-shadow 0.15s",
      }}
    >
      {icon}
      {label}
    </button>
  );
}