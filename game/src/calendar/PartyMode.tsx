type Props = { active: boolean };

export default function PartyMode({ active }: Props) {
  if (!active) return null;

  return (
    <>
      <style>{`
        @keyframes partyShake {
          0%   { transform: scale(1.02) translate(0,0) rotate(0deg); }
          10%  { transform: scale(1.02) translate(-12px, 6px) rotate(-2deg); }
          20%  { transform: scale(1.02) translate(11px, -5px) rotate(1.6deg); }
          30%  { transform: scale(1.02) translate(-9px, -10px) rotate(-1.2deg); }
          40%  { transform: scale(1.02) translate(8px, 11px) rotate(1.8deg); }
          50%  { transform: scale(1.02) translate(-12px, 4px) rotate(-1.4deg); }
          60%  { transform: scale(1.02) translate(6px, -10px) rotate(0.8deg); }
          70%  { transform: scale(1.02) translate(-5px, 8px) rotate(-1.7deg); }
          80%  { transform: scale(1.02) translate(10px, -6px) rotate(1.2deg); }
          90%  { transform: scale(1.02) translate(-4px, 7px) rotate(-0.7deg); }
          100% { transform: scale(1.02) translate(0,0) rotate(0deg); }
        }
        @keyframes partyFlow {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes partyPulse {
          0%, 100% { opacity: 0.7; }
          50%      { opacity: 0.95; }
        }
      `}</style>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(110deg, #ff0040, #ff8c00, #ffd700, #00ff80, #00bfff, #8a2be2, #ff0040)",
          backgroundSize: "250% 100%",
          animation:
            "partyFlow 1.2s linear infinite, partyPulse 0.6s ease-in-out infinite",
          mixBlendMode: "screen",
          pointerEvents: "none",
          zIndex: 250,
        }}
      />
    </>
  );
}
