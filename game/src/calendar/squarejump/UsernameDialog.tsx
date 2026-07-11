import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";

type Props = {
  onSubmit: (name: string) => void;
};

const MAX_LEN = 16;

export default function UsernameDialog({ onSubmit }: Props) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Enter" && value.trim().length > 0) {
        e.preventDefault();
        onSubmit(value.trim().slice(0, MAX_LEN));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [value, onSubmit]);

  const canSubmit = value.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(value.trim().slice(0, MAX_LEN));
  };

  return (
    <motion.div
      key="username-dialog"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 340,
          backgroundColor: "#fff",
          borderRadius: 22,
          padding: 26,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "#fef7e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <User size={32} color="#b06000" />
        </div>
        <div
          style={{
            fontFamily: "'Trebuchet MS', 'Verdana', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 24,
            color: "#202124",
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          Wähle deinen Namen
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#5f6368",
            textAlign: "center",
            marginTop: -10,
          }}
        >
          Wird auf der Bestenliste angezeigt.
        </div>
        <input
          autoFocus
          maxLength={MAX_LEN}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Dein Name"
          style={{
            width: "100%",
            height: 48,
            borderRadius: 14,
            border: "2px solid #dadce0",
            padding: "0 16px",
            fontSize: 16,
            fontWeight: 600,
            color: "#202124",
            backgroundColor: "#f8f9fa",
            outline: "none",
            boxSizing: "border-box",
            textAlign: "center",
            letterSpacing: 0.3,
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            width: "100%",
            height: 50,
            borderRadius: 25,
            border: "none",
            backgroundColor: canSubmit ? "#1a73e8" : "#c4c7c5",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed",
            letterSpacing: 0.4,
          }}
        >
          Los
        </button>
      </div>
    </motion.div>
  );
}
