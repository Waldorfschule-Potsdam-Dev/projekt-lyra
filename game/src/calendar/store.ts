import type { CalendarEvent } from "./types";
import { buildSeedEvents } from "./seed";

const STORAGE_KEY = "escape.calendar.events.v1";
const SEED_VERSION_KEY = "escape.calendar.seedVersion";
const CLOCK_OFFSET_KEY = "escape-clock-offset";
const SEED_VERSION = 3;

function getDeviceNow(): Date {
  try {
    const raw = localStorage.getItem(CLOCK_OFFSET_KEY);
    const offset = raw ? Number(raw) : 0;
    return new Date(Date.now() + (Number.isFinite(offset) ? offset : 0));
  } catch {
    return new Date();
  }
}

function getDeviceNowMs(): number {
  try {
    const raw = localStorage.getItem(CLOCK_OFFSET_KEY);
    const offset = raw ? Number(raw) : 0;
    return Date.now() + (Number.isFinite(offset) ? offset : 0);
  } catch {
    return Date.now();
  }
}

const subscribers = new Set<() => void>();

let cache: CalendarEvent[] | null = null;

const read = (): CalendarEvent[] => {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cache = [];
      return cache;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      cache = [];
      return cache;
    }
    cache = parsed.filter(
      (e: unknown): e is CalendarEvent =>
        typeof e === "object" &&
        e !== null &&
        typeof (e as CalendarEvent).id === "string" &&
        typeof (e as CalendarEvent).title === "string" &&
        typeof (e as CalendarEvent).date === "string",
    );
    return cache;
  } catch {
    cache = [];
    return cache;
  }
};

const ensureSeeded = () => {
  try {
    const v = Number(localStorage.getItem(SEED_VERSION_KEY) || "0");
    if (v >= SEED_VERSION) return;
    const seeds = buildSeedEvents(getDeviceNow());
    const now = getDeviceNowMs();
    const newEvents: CalendarEvent[] = seeds.map((s, i) => ({
      id: `seed_${SEED_VERSION}_${i}_${Math.random().toString(36).slice(2, 8)}`,
      title: s.title,
      date: s.date,
      note: s.note,
      recurrence: s.recurrence,
      createdAt: now + i,
    }));
    write(newEvents);
    localStorage.setItem(SEED_VERSION_KEY, String(SEED_VERSION));
  } catch {
    // ignore – seeding is best-effort
  }
};

const write = (next: CalendarEvent[]) => {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / private mode errors
  }
  subscribers.forEach((cb) => cb());
};

export const subscribe = (cb: () => void) => {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
};

export const getSnapshot = (): CalendarEvent[] => {
  return read();
};

// Seed einmalig beim Modul-Load
ensureSeeded();

const makeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
};

export const createEvent = (input: {
  title: string;
  date: string;
  note?: string;
  recurrence?: CalendarEvent["recurrence"];
}): CalendarEvent => {
  const event: CalendarEvent = {
    id: makeId(),
    title: input.title.trim(),
    date: input.date,
    note: input.note?.trim() || undefined,
    recurrence: input.recurrence,
    createdAt: getDeviceNowMs(),
  };
  const next = [event, ...read()];
  write(next);
  return event;
};

export const updateEvent = (id: string, patch: Partial<Omit<CalendarEvent, "id" | "createdAt">>) => {
  const next = read().map((e) =>
    e.id === id
      ? {
          ...e,
          ...patch,
          title: patch.title !== undefined ? patch.title.trim() : e.title,
          note:
            patch.note !== undefined
              ? patch.note.trim() || undefined
              : e.note,
        }
      : e,
  );
  write(next);
};

export const removeEvent = (id: string) => {
  write(read().filter((e) => e.id !== id));
};

const mdOf = (iso: string): string => {
  const [, m, d] = iso.split("-");
  return `${m}-${d}`;
};

const eventAppliesToDate = (e: CalendarEvent, iso: string): boolean => {
  if (e.date === iso) return true;
  if (e.recurrence === "yearly" && mdOf(e.date) === mdOf(iso)) return true;
  return false;
};

export const getEventsForDate = (iso: string): CalendarEvent[] => {
  return read()
    .filter((e) => eventAppliesToDate(e, iso))
    .sort((a, b) => a.createdAt - b.createdAt);
};

export const getDatesWithEvents = (): Set<string> => {
  return new Set(read().map((e) => e.date));
};

export const eventAppliesToIso = eventAppliesToDate;
