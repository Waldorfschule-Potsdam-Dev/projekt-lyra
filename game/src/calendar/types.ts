export type Recurrence = "yearly";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  note?: string;
  recurrence?: Recurrence;
  createdAt: number;
};

export type DayCell = {
  date: Date;
  iso: string;
  inCurrentMonth: boolean;
  isToday: boolean;
};
