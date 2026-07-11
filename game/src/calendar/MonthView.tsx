import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { buildMonthGrid, MONTH_NAMES_DE, WEEKDAY_LABELS_DE, COLOR, COLOR_SOFT, COLOR_TODAY } from "./dates";
import type { DayCell } from "./types";

type Props = {
  monthDate: Date;
  today: Date;
  selectedIso: string;
  onSelectDate: (iso: string) => void;
  onChangeMonth: (delta: number) => void;
  onJumpToToday: () => void;
  datesWithEvents: Set<string>;
};

const SWIPE_THRESHOLD = 50;

export default function MonthView({
  monthDate,
  today,
  selectedIso,
  onSelectDate,
  onChangeMonth,
  onJumpToToday,
  datesWithEvents,
}: Props) {
  const cells: DayCell[] = buildMonthGrid(monthDate, today);
  const monthLabel = `${MONTH_NAMES_DE[monthDate.getMonth()]} ${monthDate.getFullYear()}`;

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -300) {
      onChangeMonth(1);
    } else if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 300) {
      onChangeMonth(-1);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", backgroundColor: "#fff" }}>
      {/* Header: Navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px 12px",
          gap: 8,
        }}
      >
        <button
          onClick={() => onChangeMonth(-1)}
          aria-label="Vorheriger Monat"
          style={navBtnStyle}
        >
          <ChevronLeft size={22} color={COLOR} strokeWidth={2.2} />
        </button>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#202124",
              letterSpacing: "-0.2px",
            }}
          >
            {monthLabel}
          </span>
          <button
            onClick={onJumpToToday}
            style={{
              marginTop: 2,
              background: "none",
              border: "none",
              color: COLOR,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              padding: "2px 6px",
              borderRadius: 6,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <CalendarDays size={13} strokeWidth={2.2} />
            Heute
          </button>
        </div>

        <button
          onClick={() => onChangeMonth(1)}
          aria-label="Nächster Monat"
          style={navBtnStyle}
        >
          <ChevronRight size={22} color={COLOR} strokeWidth={2.2} />
        </button>
      </div>

      {/* Swipeable grid */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        style={{ touchAction: "pan-y", padding: "0 8px 8px" }}
      >
        {/* Weekday labels */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            marginBottom: 4,
          }}
        >
          {WEEKDAY_LABELS_DE.map((label) => (
            <div
              key={label}
              style={{
                textAlign: "center",
                fontSize: 12,
                fontWeight: 600,
                color: "#5f6368",
                padding: "6px 0",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 2,
          }}
        >
          {cells.map((cell) => {
            const isSelected = cell.iso === selectedIso;
            const hasEvents = datesWithEvents.has(cell.iso);
            const day = cell.date.getDate();

            return (
              <button
                key={cell.iso}
                onClick={() => onSelectDate(cell.iso)}
                aria-label={`Tag ${day}${hasEvents ? ", mit Terminen" : ""}`}
                aria-pressed={isSelected}
                style={{
                  position: "relative",
                  height: 46,
                  border: "none",
                  background: isSelected
                    ? COLOR
                    : cell.isToday
                    ? COLOR_TODAY
                    : "transparent",
                  borderRadius: 10,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  WebkitTapHighlightColor: "transparent",
                  transition: "background-color 0.12s ease",
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: isSelected || cell.isToday ? 600 : 400,
                    color: isSelected
                      ? "#fff"
                      : cell.inCurrentMonth
                      ? "#202124"
                      : "#bdc1c6",
                    lineHeight: 1,
                  }}
                >
                  {day}
                </span>

                {/* Event dot indicator */}
                {hasEvents && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 6,
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      gap: 2,
                    }}
                  >
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        backgroundColor: isSelected ? "#fff" : COLOR,
                      }}
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: "none",
  background: COLOR_SOFT,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  WebkitTapHighlightColor: "transparent",
  flexShrink: 0,
};
