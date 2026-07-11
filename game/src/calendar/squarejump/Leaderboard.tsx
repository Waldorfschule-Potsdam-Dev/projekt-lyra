import { Trophy, Medal } from "lucide-react";
import type { JumpScore } from "./profile";

type Props = {
  scores: JumpScore[];
  currentName: string | null;
  variant: "mini" | "full";
  liveScore?: number;
};

function rankColor(rank: number): string {
  if (rank === 0) return "#f4b400";
  if (rank === 1) return "#9aa0a6";
  if (rank === 2) return "#a87900";
  return "#5f6368";
}

function rowBg(rank: number, highlight: boolean): string {
  if (highlight) return "#fef7e0";
  return rank % 2 === 0 ? "#f8f9fa" : "#ffffff";
}

export default function Leaderboard({
  scores,
  currentName,
  variant,
  liveScore,
}: Props) {
  const limit = variant === "mini" ? 3 : 5;
  const isFull = variant === "full";
  const isMini = variant === "mini";

  if (scores.length === 0 && isMini) return null;

  const visible = scores.slice(0, limit);
  const yourBest = currentName
    ? scores.filter((s) => s.name === currentName).sort((a, b) => b.score - a.score)[0]
    : null;
  const youInList = !!yourBest && visible.some((s) => s.ts === yourBest.ts);
  const youNotInList =
    isFull && !!yourBest && !youInList && (yourBest.score < visible[visible.length - 1]?.score || visible.length < limit);
  const youRow = youNotInList ? yourBest : null;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: isMini ? 6 : 10,
      }}
    >
      {isFull && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#5f6368",
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 2,
          }}
        >
          <Trophy size={14} color="#f4b400" />
          Bestenliste
        </div>
      )}

      <div
        style={{
          width: "100%",
          maxWidth: 320,
          backgroundColor: "#fff",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid #e8eaed",
        }}
      >
        {visible.map((s, i) => {
          const highlight = currentName !== null && s.name === currentName;
          return (
            <div
              key={s.ts}
              style={{
                display: "grid",
                gridTemplateColumns: "28px 1fr auto",
                alignItems: "center",
                gap: 10,
                padding: isMini ? "6px 12px" : "10px 14px",
                backgroundColor: rowBg(i, highlight),
                borderTop: i > 0 ? "1px solid #f1f3f4" : "none",
              }}
            >
              <div
                style={{
                  fontSize: isMini ? 12 : 14,
                  fontWeight: 800,
                  color: rankColor(i),
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {i < 3 && isFull ? <Medal size={14} color={rankColor(i)} /> : null}
                {i + 1}
              </div>
              <div
                style={{
                  fontSize: isMini ? 12 : 14,
                  fontWeight: highlight ? 800 : 600,
                  color: highlight ? "#b06000" : "#202124",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {s.name}
              </div>
              <div
                style={{
                  fontSize: isMini ? 13 : 15,
                  fontWeight: 800,
                  color: highlight ? "#b06000" : "#202124",
                }}
              >
                {s.score}
              </div>
            </div>
          );
        })}

        {youRow && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "28px 1fr auto",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              backgroundColor: "#fef7e0",
              borderTop: "1px solid #f1f3f4",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: "#b06000" }}>…</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#b06000",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {youRow.name} (du)
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#b06000" }}>
              {youRow.score}
            </div>
          </div>
        )}

        {isFull && currentName && liveScore !== undefined && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "28px 1fr auto",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              backgroundColor: "#e8f0fe",
              borderTop: "1px solid #d2e3fc",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1a73e8" }}>•</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#1a73e8",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {currentName} (aktuell)
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1a73e8" }}>
              {liveScore}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
