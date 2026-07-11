import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Routes, Route } from "react-router-dom";
import {
  subscribe,
  getSnapshot,
  createEvent,
  updateEvent,
  removeEvent,
  eventAppliesToIso,
} from "./store";
import MonthView from "./MonthView";
import DayPanel from "./DayPanel";
import EventEditor from "./EventEditor";
import PartyMode from "./PartyMode";
import SquareJump from "./SquareJump";
import DoodleJump from "./DoodleJump";
import SlotMachine from "./SlotMachine";
import { buildMonthGrid, formatIso } from "./dates";
import type { CalendarEvent } from "./types";
import { useClock } from "../store/clock";

type EditorMode =
  | { kind: "create"; date: string }
  | { kind: "edit"; event: CalendarEvent }
  | null;

const PARTY_DATE = "2026-07-06";
const PARTY_DURATION_MS = 3000;
const FLAPPY_TITLE = "squarejump";
const DOODLE_TITLE = "doodle";
const SAHUR_TITLE = "slots";

export default function KalenderApp() {
  const deviceNowMs = useClock((s) => s.now);

  // Monats-Ansicht + Auswahl (initial = zentrale Gerätezeit, danach benutzergesteuert)
  const [monthDate, setMonthDate] = useState<Date>(() => new Date(deviceNowMs));
  const [selectedIso, setSelectedIso] = useState<string>(() =>
    formatIso(new Date(deviceNowMs)),
  );
  const [editor, setEditor] = useState<EditorMode>(null);
  const [party, setParty] = useState(false);
  const [squarejump, setFlappy] = useState(false);
  const [doodle, setDoodle] = useState(false);
  const [sahur, setSahur] = useState(false);

  // Party-Modus: startet bei Termin-Erstellung am 06.07.2026,
  // endet automatisch nach 3 Sekunden.
  useEffect(() => {
    if (!party) return;
    const timer = setTimeout(() => setParty(false), PARTY_DURATION_MS);
    return () => clearTimeout(timer);
  }, [party]);

  // "Heute" folgt der zentralen Gerätezeit, damit die Markierung
  // reagiert, wenn die Zeit in den Einstellungen geändert wird.
  const today = useMemo(() => new Date(deviceNowMs), [deviceNowMs]);
  const todayIso = useMemo(() => formatIso(today), [today]);

  // Subscribe to localStorage-backed event store
  const events = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const datesWithEvents = useMemo(() => {
    const grid = buildMonthGrid(monthDate, today);
    const set = new Set<string>();
    for (const cell of grid) {
      for (const e of events) {
        if (eventAppliesToIso(e, cell.iso)) {
          set.add(cell.iso);
          break;
        }
      }
    }
    return set;
  }, [events, monthDate, today]);

  const eventsForSelected = useMemo(
    () =>
      events
        .filter((e) => eventAppliesToIso(e, selectedIso))
        .sort((a, b) => a.createdAt - b.createdAt),
    [events, selectedIso],
  );

  const handleChangeMonth = (delta: number) => {
    setMonthDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + delta);
      return next;
    });
  };

  const handleSelectDate = (iso: string) => {
    setSelectedIso(iso);
    // keep the month view in sync with the selection
    const [y, m, d] = iso.split("-").map(Number);
    setMonthDate((prev) => {
      if (prev.getFullYear() === y && prev.getMonth() === m - 1) return prev;
      return new Date(y, m - 1, d);
    });
  };

  const handleJumpToToday = () => {
    const iso = todayIso;
    setSelectedIso(iso);
    setMonthDate(today);
  };

  const handleCreate = () => {
    setEditor({ kind: "create", date: selectedIso });
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditor({ kind: "edit", event });
    // Bei wiederkehrenden Terminen das aktuell sichtbare Datum beibehalten,
    // damit der Nutzer nicht zum Anker-Datum (z.B. 2026-03-17) zurückspringt.
    if (event.date !== selectedIso && event.recurrence !== "yearly") {
      setSelectedIso(event.date);
    }
  };

  const handleClose = () => setEditor(null);

  const handleSave = (data: {
    id?: string;
    title: string;
    date: string;
    note?: string;
    recurrence?: CalendarEvent["recurrence"];
  }) => {
    if (data.id) {
      updateEvent(data.id, {
        title: data.title,
        date: data.date,
        note: data.note,
        recurrence: data.recurrence,
      });
    } else {
      createEvent({
        title: data.title,
        date: data.date,
        note: data.note,
        recurrence: data.recurrence,
      });
      // Easter Egg: Termin am 06.07.2026 → 3s Party-Modus
      if (data.date === PARTY_DATE) {
        setParty(true);
      }
      // Easter Egg: Termin mit Titel "Schwanz" → Square Jump
      if (data.title.trim().toLowerCase() === FLAPPY_TITLE) {
        setFlappy(true);
      }
      // Easter Egg: Termin mit Titel "Eichelkäse" → Doodle Jump
      if (data.title.trim().toLowerCase() === DOODLE_TITLE) {
        setDoodle(true);
      }
      // Easter Egg: Termin mit exaktem Titel "sahur" → Slot Machine
      if (data.title.trim() === SAHUR_TITLE) {
        setSahur(true);
      }
      // Falls Termin in einem anderen Monat angelegt wurde,
      // zur Übersicht dorthin springen.
      const [y, m] = data.date.split("-").map(Number);
      setMonthDate((prev) => {
        if (prev.getFullYear() === y && prev.getMonth() === m - 1) return prev;
        return new Date(y, m - 1, 1);
      });
      setSelectedIso(data.date);
    }
    setEditor(null);
  };

  const handleDelete = (id: string) => {
    removeEvent(id);
    setEditor(null);
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        overflow: "hidden",
        transformOrigin: "center",
        animation: party ? "partyShake 0.18s infinite" : undefined,
      }}
    >
      <Routes>
        <Route
          path="/"
          element={
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                backgroundColor: "#fafafa",
              }}
            >
              <MonthView
                monthDate={monthDate}
                today={today}
                selectedIso={selectedIso}
                onSelectDate={handleSelectDate}
                onChangeMonth={handleChangeMonth}
                onJumpToToday={handleJumpToToday}
                datesWithEvents={datesWithEvents}
              />
              <DayPanel
                selectedIso={selectedIso}
                events={eventsForSelected}
                onCreate={handleCreate}
                onEdit={handleEdit}
              />
            </div>
          }
        />
      </Routes>

      <PartyMode active={party} />

      <SquareJump active={squarejump} onClose={() => setFlappy(false)} />

      <DoodleJump active={doodle} onClose={() => setDoodle(false)} />

      <SlotMachine active={sahur} onClose={() => setSahur(false)} />

      <EventEditor
        mode={editor}
        onClose={handleClose}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
