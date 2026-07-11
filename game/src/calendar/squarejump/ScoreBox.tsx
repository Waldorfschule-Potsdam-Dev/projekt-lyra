type Props = {
  label: string;
  value: number;
  accent?: boolean;
};

export default function ScoreBox({ label, value, accent }: Props) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 14,
        backgroundColor: accent ? "#fef7e0" : "#f1f3f4",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#5f6368",
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: accent ? "#b06000" : "#202124",
        }}
      >
        {value}
      </span>
    </div>
  );
}
