type Props = { score: number };

export default function LiveScore({ score }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        top: 18,
        left: 0,
        right: 0,
        textAlign: "center",
        zIndex: 2,
        pointerEvents: "none",
        fontFamily: "'Trebuchet MS', 'Verdana', system-ui, sans-serif",
        fontWeight: 800,
        fontSize: 56,
        color: "#fff",
        WebkitTextStroke: "3px #000",
        paintOrder: "stroke fill",
        textShadow: "0 3px 0 rgba(0,0,0,0.25)",
        letterSpacing: 2,
      }}
    >
      {score}
    </div>
  );
}
