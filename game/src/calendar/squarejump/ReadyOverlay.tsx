import Leaderboard from "./Leaderboard";
import type { JumpScore } from "./profile";

type Props = {
  scores: JumpScore[];
  user: string;
};

export default function ReadyOverlay({ scores, user }: Props) {
  return (
    <>
      <style>{`
        @keyframes squarejumpPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.04); }
        }
      `}</style>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          zIndex: 3,
          pointerEvents: "none",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            fontFamily: "'Trebuchet MS', 'Verdana', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 40,
            color: "#fff",
            WebkitTextStroke: "3px #000",
            paintOrder: "stroke fill",
            textShadow: "0 4px 0 rgba(0,0,0,0.25)",
            letterSpacing: 1,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          Flappy
          <br />
          Kalender
        </div>
        {scores.length > 0 && (
          <Leaderboard scores={scores} currentName={user} variant="mini" />
        )}
        <div
          style={{
            marginTop: 6,
            padding: "10px 18px",
            backgroundColor: "rgba(0,0,0,0.35)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 999,
            backdropFilter: "blur(6px)",
            animation: "squarejumpPulse 1s ease-in-out infinite",
          }}
        >
          Tippen zum Starten
        </div>
      </div>
    </>
  );
}
