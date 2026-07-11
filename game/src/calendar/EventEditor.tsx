import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Save, Repeat } from "lucide-react";
import type { CalendarEvent } from "./types";
import { COLOR } from "./dates";

type Mode =
  | { kind: "create"; date: string }
  | { kind: "edit"; event: CalendarEvent };

type FormInitial = {
  title: string;
  day: string;
  month: string;
  year: string;
  note: string;
  recurrence: boolean;
};

type Props = {
  mode: Mode | null;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    title: string;
    date: string;
    note?: string;
    recurrence?: CalendarEvent["recurrence"];
  }) => void;
  onDelete: (id: string) => void;
};

const DAYS_IN_MONTH = (year: number, monthIndex: number): number => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

const isValidDateParts = (day: number, month: number, year: number): boolean => {
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  if (year < 1900 || year > 2100) return false;
  return day <= DAYS_IN_MONTH(year, month - 1);
};

const partsFromIso = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { day: d, month: m, year: y };
};

const isoFromParts = (day: number, month: number, year: number): string => {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
};

const buildInitial = (mode: Mode): FormInitial => {
  if (mode.kind === "edit") {
    const p = partsFromIso(mode.event.date);
    return {
      title: mode.event.title,
      day: String(p.day),
      month: String(p.month),
      year: String(p.year),
      note: mode.event.note ?? "",
      recurrence: mode.event.recurrence === "yearly",
    };
  }
  const p = partsFromIso(mode.date);
  return {
    title: "",
    day: String(p.day),
    month: String(p.month),
    year: String(p.year),
    note: "",
    recurrence: false,
  };
};

const modeKey = (mode: Mode): string =>
  mode.kind === "edit" ? `edit-${mode.event.id}` : `create-${mode.date}`;

export default function EventEditor({ mode, onClose, onSave, onDelete }: Props) {
  const initial = useMemo(() => (mode ? buildInitial(mode) : null), [mode]);
  const isEdit = mode?.kind === "edit";
  const formKey = mode ? modeKey(mode) : null;

  return (
    <AnimatePresence>
      {mode && initial && formKey && (
        <motion.div
          key="editor-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(32, 33, 36, 0.45)",
            zIndex: 100,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <motion.div
            key="editor-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 300) onClose();
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxHeight: "90%",
              backgroundColor: "#fff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              touchAction: "none",
            }}
          >
            <EventForm
              key={formKey}
              initial={initial}
              isEdit={isEdit}
              mode={mode}
              onClose={onClose}
              onSave={onSave}
              onDelete={onDelete}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EventForm({
  initial,
  isEdit,
  mode,
  onClose,
  onSave,
  onDelete,
}: {
  initial: FormInitial;
  isEdit: boolean;
  mode: Mode;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    title: string;
    date: string;
    note?: string;
    recurrence?: CalendarEvent["recurrence"];
  }) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [day, setDay] = useState(initial.day);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);
  const [note, setNote] = useState(initial.note);
  const [recurrence, setRecurrence] = useState(initial.recurrence);
  const [touched, setTouched] = useState(false);

  const dayNum = Number(day);
  const monthNum = Number(month);
  const yearNum = Number(year);

  const dateValid = useMemo(
    () => isValidDateParts(dayNum, monthNum, yearNum),
    [dayNum, monthNum, yearNum],
  );
  const titleValid = title.trim().length > 0;
  const canSave = dateValid && titleValid;

  const handleSave = () => {
    if (!canSave) {
      setTouched(true);
      return;
    }
    onSave({
      id: mode.kind === "edit" ? mode.event.id : undefined,
      title: title.trim(),
      date: isoFromParts(dayNum, monthNum, yearNum),
      note: note.trim() || undefined,
      recurrence: recurrence ? "yearly" : undefined,
    });
  };

  const handleDelete = () => {
    if (mode.kind === "edit") {
      const ok = window.confirm(`„${mode.event.title}" wirklich löschen?`);
      if (ok) onDelete(mode.event.id);
    }
  };

  return (
    <>
      {/* Drag handle */}
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: "#dadce0",
          }}
        />
      </div>

      {/* Sheet header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 16px 12px",
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 600, color: "#202124" }}>
          {isEdit ? "Termin bearbeiten" : "Neuer Termin"}
        </span>
        <button onClick={onClose} aria-label="Schließen" style={iconBtnStyle}>
          <X size={20} color="#5f6368" />
        </button>
      </div>

      {/* Form body */}
      <div
        style={{
          padding: "4px 20px 20px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <Field label="Titel" required>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel (Tipp: squarejump, doodle, slots)"
            autoFocus={!isEdit}
            style={inputStyle(!titleValid && touched)}
          />
          {!titleValid && touched && (
            <FieldHint>Bitte einen Titel eingeben.</FieldHint>
          )}
        </Field>

        <Field label="Datum" required>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1.4fr", gap: 10 }}>
            <NumberField
              label="Tag"
              value={day}
              onChange={setDay}
              min={1}
              max={31}
              placeholder="TT"
              invalid={!dateValid && touched}
            />
            <NumberField
              label="Monat"
              value={month}
              onChange={setMonth}
              min={1}
              max={12}
              placeholder="MM"
              invalid={!dateValid && touched}
            />
            <NumberField
              label="Jahr"
              value={year}
              onChange={setYear}
              min={1900}
              max={2100}
              placeholder="JJJJ"
              invalid={!dateValid && touched}
            />
          </div>
          {!dateValid && touched && (
            <FieldHint>Bitte ein gültiges Datum eingeben.</FieldHint>
          )}
        </Field>

        <Field label="Notiz" hint="optional">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Kurze Notiz zum Termin…"
            rows={3}
            style={{
              ...inputStyle(false),
              resize: "none",
              fontFamily: "inherit",
              lineHeight: 1.4,
              minHeight: 70,
            }}
          />
        </Field>

        <button
          type="button"
          onClick={() => setRecurrence((v) => !v)}
          aria-pressed={recurrence}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            border: `1px solid ${recurrence ? COLOR : "#dadce0"}`,
            borderRadius: 12,
            backgroundColor: recurrence ? "#E8F0FE" : "#fff",
            cursor: "pointer",
            textAlign: "left",
            WebkitTapHighlightColor: "transparent",
            transition: "background-color 0.15s, border-color 0.15s",
          }}
        >
          <Repeat size={18} color={recurrence ? COLOR : "#5f6368"} strokeWidth={2.2} />
          <span style={{ flex: 1, fontSize: 14, color: "#202124", fontWeight: 500 }}>
            Jährlich wiederholen
          </span>
          <span
            aria-hidden
            style={{
              width: 36,
              height: 20,
              borderRadius: 999,
              backgroundColor: recurrence ? COLOR : "#dadce0",
              position: "relative",
              flexShrink: 0,
              transition: "background-color 0.15s",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 2,
                left: recurrence ? 18 : 2,
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: "#fff",
                transition: "left 0.15s",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            />
          </span>
        </button>
      </div>

      {/* Footer actions */}
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "12px 16px 20px",
          borderTop: "1px solid #f1f3f4",
          backgroundColor: "#fff",
        }}
      >
        {isEdit && (
          <button
            onClick={handleDelete}
            aria-label="Termin löschen"
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "1px solid #f1f3f4",
              backgroundColor: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Trash2 size={20} color="#d93025" />
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 24,
            border: "none",
            backgroundColor: canSave ? COLOR : "#dadce0",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            cursor: canSave ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Save size={18} color="#fff" strokeWidth={2.2} />
          Speichern
        </button>
      </div>
    </>
  );
}

const inputStyle = (invalid: boolean): React.CSSProperties => ({
  width: "100%",
  height: 44,
  padding: "0 14px",
  border: `1px solid ${invalid ? "#d93025" : "#dadce0"}`,
  borderRadius: 12,
  fontSize: 15,
  color: "#202124",
  outline: "none",
  backgroundColor: "#fff",
  transition: "border-color 0.15s",
});

const iconBtnStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "#5f6368",
          display: "flex",
          gap: 4,
        }}
      >
        {label}
        {required && <span style={{ color: "#d93025" }}>*</span>}
        {hint && <span style={{ color: "#9aa0a6", fontWeight: 400 }}>({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, color: "#d93025", marginTop: 2 }}>{children}</div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  placeholder,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min: number;
  max: number;
  placeholder: string;
  invalid: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          fontSize: 11,
          color: "#9aa0a6",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") {
            onChange("");
            return;
          }
          if (!/^\d{0,4}$/.test(v)) return;
          onChange(v);
        }}
        onBlur={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n) && e.target.value !== "") {
            if (n < min) onChange(String(min));
            else if (n > max) onChange(String(max));
          }
        }}
        placeholder={placeholder}
        min={min}
        max={max}
        style={{
          ...inputStyle(invalid),
          textAlign: "center",
          fontWeight: 500,
        }}
      />
    </div>
  );
}
