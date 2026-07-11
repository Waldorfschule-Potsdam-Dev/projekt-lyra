/**
 * Notizliste (Übersicht).
 *
 * Zeigt:
 *  - Suchleiste oben (filtert live nach Titel und Inhalt)
 *  - Sortier-Toggle (neueste/älteste zuerst)
 *  - Scroll-Liste aller Notizen mit Titel, Vorschau und Datum
 *  - FAB (Floating Action Button) zum Anlegen einer neuen Notiz
 *  - Empty State, falls keine Notizen vorhanden sind
 *
 * Designsprache: modern, minimalistisch – weicher Kartenradius,
 * dezente Schatten, subtle Hover-Lifts, ruhige Typografie.
 */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, ArrowDownUp, FileText, Moon, Sun } from "lucide-react";
import type { Note, SortOrder } from "./types";
import { RADIUS, SPACE } from "./styles";
import { useTheme } from "./theme";

interface Props {
  notes: Note[];
  onCreate: () => string;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function previewOf(body: string): string {
  const trimmed = body.replace(/\s+/g, " ").trim();
  if (trimmed.length <= 90) return trimmed;
  return `${trimmed.slice(0, 90)}…`;
}

export default function NoteList({ notes, onCreate }: Props) {
  const navigate = useNavigate();
  const { theme, mode, toggleTheme } = useTheme();

  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const visibleNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? notes.filter(
          (n) =>
            n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
        )
      : notes;
    const sorted = [...filtered].sort((a, b) => {
      const diff = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return sortOrder === "newest" ? diff : -diff;
    });
    return sorted;
  }, [notes, query, sortOrder]);

  const handleCreate = () => {
    const newId = onCreate();
    navigate(`/notes/${newId}`);
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
      <header
        style={{
          padding: `${SPACE.xl}px ${SPACE.xl}px ${SPACE.lg}px`,
          display: "flex",
          flexDirection: "column",
          gap: SPACE.lg,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: SPACE.sm,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: -0.6,
              color: theme.text,
              lineHeight: 1.1,
            }}
          >
            Notizen
          </h1>

          <div style={{ display: "inline-flex", gap: SPACE.sm, alignItems: "center" }}>
            <HeaderIconButton
              onClick={toggleTheme}
              ariaLabel={mode === "dark" ? "Light Mode aktivieren" : "Dark Mode aktivieren"}
              title={mode === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {mode === "dark" ? (
                <Sun size={16} strokeWidth={1.8} />
              ) : (
                <Moon size={16} strokeWidth={1.8} />
              )}
            </HeaderIconButton>

            <HeaderPillButton
              onClick={() => setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))}
              ariaLabel="Sortierung umschalten"
            >
              <ArrowDownUp size={14} strokeWidth={1.8} />
              <span>{sortOrder === "newest" ? "Neueste" : "Älteste"}</span>
            </HeaderPillButton>
          </div>
        </div>

        <SearchInput value={query} onChange={setQuery} />
      </header>

      {/* ============== Notizliste ============== */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: `0 ${SPACE.xl}px`,
        }}
      >
        {visibleNotes.length === 0 ? (
          <EmptyState hasQuery={query.trim().length > 0} />
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, paddingBottom: 120 }}>
            <AnimatePresence initial={false}>
              {visibleNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onOpen={() => navigate(`/notes/${note.id}`)}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </main>

      {/* ============== FAB (Neue Notiz) ============== */}
      <motion.button
        type="button"
        onClick={handleCreate}
        aria-label="Neue Notiz erstellen"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        style={{
          position: "absolute",
          right: SPACE.xl,
          bottom: SPACE.xl,
          width: 60,
          height: 60,
          borderRadius: RADIUS.pill,
          border: "none",
          background: theme.accentStrong,
          color: theme.text,
          boxShadow: "0 8px 24px rgba(245, 197, 24, 0.45)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Plus size={28} strokeWidth={2.2} />
      </motion.button>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Hilfskomponenten (lokal, damit NoteList selbst übersichtlich bleibt).
 * -------------------------------------------------------------------------- */

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const { theme } = useTheme();
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: SPACE.sm,
        padding: "12px 16px",
        backgroundColor: theme.surfaceElevated,
        borderRadius: RADIUS.md,
        border: `1px solid ${theme.border}`,
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      <Search size={16} strokeWidth={1.8} color={theme.textMuted} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Suchen…"
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 15,
          color: theme.text,
        }}
      />
    </label>
  );
}

function HeaderIconButton({
  onClick,
  ariaLabel,
  title,
  children,
}: {
  onClick: () => void;
  ariaLabel: string;
  title: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 38,
        height: 38,
        padding: 0,
        border: `1px solid ${theme.border}`,
        borderRadius: RADIUS.pill,
        background: theme.surface,
        color: theme.textMuted,
        cursor: "pointer",
      }}
    >
      {children}
    </motion.button>
  );
}

function HeaderPillButton({
  onClick,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 14px",
        border: `1px solid ${theme.border}`,
        borderRadius: RADIUS.pill,
        background: theme.surface,
        color: theme.textMuted,
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {children}
    </motion.button>
  );
}

function NoteCard({
  note,
  onOpen,
}: {
  note: Note;
  onOpen: () => void;
}) {
  const { theme } = useTheme();
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover={{ y: -1 }}
      style={{
        background: theme.surface,
        borderRadius: RADIUS.lg,
        padding: `${SPACE.lg}px ${SPACE.lg}px`,
        marginBottom: SPACE.md,
        boxShadow: `0 1px 3px ${theme.shadow}`,
        display: "flex",
        alignItems: "center",
        gap: SPACE.md,
        cursor: "pointer",
      }}
      onClick={onOpen}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: SPACE.sm,
            marginBottom: 4,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: theme.text,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              letterSpacing: -0.1,
            }}
          >
            {note.title || "Ohne Titel"}
          </h2>
          <span
            style={{
              fontSize: 12,
              color: theme.textMuted,
              whiteSpace: "nowrap",
              fontWeight: 500,
            }}
          >
            {formatDate(note.updatedAt)}
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.5,
            color: theme.textMuted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {previewOf(note.body) || "Keine weiteren Inhalte"}
        </p>
      </div>
    </motion.li>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  const { theme, mode } = useTheme();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: `${SPACE.xxl}px ${SPACE.lg}px`,
        color: theme.textMuted,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: RADIUS.pill,
          background: mode === "dark" ? theme.accent : "#FFF3C4",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: SPACE.lg,
        }}
      >
        <FileText size={32} strokeWidth={1.5} color={theme.accentStrong} />
      </div>
      <h2 style={{ margin: 0, fontSize: 18, color: theme.text, fontWeight: 600 }}>
        {hasQuery ? "Keine Treffer" : "Noch keine Notizen"}
      </h2>
      <p style={{ margin: `${SPACE.xs}px 0 0`, fontSize: 14, maxWidth: 280, lineHeight: 1.5 }}>
        {hasQuery
          ? "Versuche einen anderen Suchbegriff."
          : "Tippe unten rechts auf das Plus, um deine erste Notiz zu erstellen."}
      </p>
    </div>
  );
}
