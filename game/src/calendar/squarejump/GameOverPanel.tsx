import { RotateCcw } from "lucide-react";
import Leaderboard from "./Leaderboard";
import ScoreBox from "./ScoreBox";
import { bestForUser, type JumpScore } from "./profile";

const COLOR = "#1a73e8";

type Props = {
  user: string;
  score: number;
  scores: JumpScore[];
  onRetry: () => void;
  onClose: () => void;
};

export default function GameOverPanel({
  user,
  score,
  scores,
  onRetry,
  onClose,
}: Props) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3,
        backgroundColor: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(2px)",
        padding: "16px 16px 24px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 340,
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 22,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#d93025",
            letterSpacing: 0.5,
          }}
        >
          Game Over
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#5f6368",
            letterSpacing: 0.3,
          }}
        >
          {user}
        </div>
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          <ScoreBox label="Score" value={score} />
          <ScoreBox
            label="Dein Best"
            value={bestForUser(scores, user)}
            accent
          />
        </div>
        <Leaderboard scores={scores} currentName={user} variant="full" />
        <div
          style={{
            display: "flex",
            gap: 10,
            width: "100%",
            marginTop: 4,
          }}
        >
          <button
            onClick={onRetry}
            style={{
              flex: 1,
              height: 46,
              borderRadius: 23,
              border: "none",
              backgroundColor: COLOR,
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <RotateCcw size={18} color="#fff" />
            Nochmal
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: 46,
              borderRadius: 23,
              border: "1px solid #dadce0",
              backgroundColor: "#fff",
              color: "#3c4043",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
