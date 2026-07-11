import { X } from "lucide-react";
import { CollectClueButton } from "../../components/CollectClueButton";

type Props = {
  user: string;
  showBadge: boolean;
  onClose: () => void;
};

export default function TopBar({ user, showBadge, onClose }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        zIndex: 2,
      }}
    >
      {showBadge ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.35)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            backdropFilter: "blur(6px)",
            maxWidth: 160,
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user}
          </span>
        </div>
      ) : (
        <div />
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <CollectClueButton clueId="games:squarejump" size={16} />
        </div>
        <button
          onClick={onClose}
          aria-label="Schließen"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: "rgba(0,0,0,0.35)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(6px)",
            pointerEvents: 'auto',
          }}
        >
          <X size={22} color="#fff" />
        </button>
      </div>
    </div>
  );
}
