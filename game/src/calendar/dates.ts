import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import type { DayCell } from "./types";

export const MONTH_NAMES_DE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export const WEEKDAY_LABELS_DE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export const formatIso = (date: Date): string => format(date, "yyyy-MM-dd");

export const formatLongDate = (iso: string): string => {
  const d = parseISO(iso);
  return format(d, "EEEE, d. MMMM yyyy", { locale: de });
};

export const formatShortDate = (iso: string): string => {
  const d = parseISO(iso);
  return format(d, "d. MMMM yyyy", { locale: de });
};

export const buildMonthGrid = (monthDate: Date, today: Date): DayCell[] => {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const cells: DayCell[] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    cells.push({
      date: cursor,
      iso: formatIso(cursor),
      inCurrentMonth: isSameMonth(cursor, monthDate),
      isToday: isSameDay(cursor, today),
    });
    cursor = addDays(cursor, 1);
  }
  return cells;
};

export const COLOR = "#4285F4";
export const COLOR_SOFT = "#E8F0FE";
export const COLOR_TODAY = "#D2E3FC";
