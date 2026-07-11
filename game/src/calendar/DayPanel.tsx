import { Plus, Calendar as CalIcon, Trash2, Repeat } from "lucide-react";
import { formatLongDate, COLOR } from "./dates";
import type { CalendarEvent } from "./types";

type Props = {
  selectedIso: string;
  events: CalendarEvent[];
  onCreate: () => void;
  onEdit: (event: CalendarEvent) => void;
};

export default function DayPanel({ selectedIso, events, onCreate, onEdit }: Props) {
  const heading = formatLongDate(selectedIso);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        borderTop: "1px solid #e8eaed",
        minHeight: 0,
      }}
    >
      {/* Panel header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px 8px",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <CalIcon size={16} color={COLOR} strokeWidth={2.2} />
          <h2
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#202124",
              textTransform: "uppercase",
              letterSpacing: 0.4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {heading}
          </h2>
        </div>
        <span
          style={{
            fontSize: 12,
            color: "#5f6368",
            fontWeight: 500,
            backgroundColor: "#f1f3f4",
            borderRadius: 999,
            padding: "2px 8px",
            flexShrink: 0,
          }}
        >
          {events.length} {events.length === 1 ? "Termin" : "Termine"}
        </span>
      </div>

      {/* Event list / empty state */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "4px 12px 12px",
          minHeight: 0,
        }}
      >
        {events.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 16px",
              textAlign: "center",
              color: "#5f6368",
              minHeight: 120,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: "#f1f3f4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <CalIcon size={26} color="#9aa0a6" strokeWidth={1.8} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#3c4043", marginBottom: 4 }}>
              Keine Termine
            </div>
            <div style={{ fontSize: 13, color: "#5f6368", lineHeight: 1.4 }}>
              Tippe auf „Neuer Termin", um einen hinzuzufügen.
            </div>
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {events.map((event) => (
              <li key={event.id}>
                <button
                  onClick={() => onEdit(event)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    backgroundColor: "#fff",
                    border: "1px solid #e8eaed",
                    borderLeft: `4px solid ${COLOR}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: event.note ? 2 : 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "#202124",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {event.title}
                      </span>
                      {event.recurrence === "yearly" && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                            fontSize: 11,
                            fontWeight: 600,
                            color: COLOR,
                            backgroundColor: "#E8F0FE",
                            padding: "2px 7px",
                            borderRadius: 999,
                            flexShrink: 0,
                            textTransform: "uppercase",
                            letterSpacing: 0.3,
                          }}
                        >
                          <Repeat size={11} strokeWidth={2.4} />
                          jährlich
                        </span>
                      )}
                    </div>
                    {event.note && (
                      <div
                        style={{
                          fontSize: 13,
                          color: "#5f6368",
                          lineHeight: 1.35,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {event.note}
                      </div>
                    )}
                  </div>
                  <Trash2
                    size={16}
                    color="#bdc1c6"
                    strokeWidth={2}
                    style={{ flexShrink: 0 }}
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add button */}
      <div style={{ padding: "8px 12px 16px" }}>
        <button
          onClick={onCreate}
          style={{
            width: "100%",
            height: 48,
            border: "none",
            borderRadius: 24,
            backgroundColor: COLOR,
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            WebkitTapHighlightColor: "transparent",
            boxShadow: "0 2px 8px rgba(66, 133, 244, 0.35)",
          }}
        >
          <Plus size={20} color="#fff" strokeWidth={2.4} />
          Neuer Termin
        </button>
      </div>
    </div>
  );
}
