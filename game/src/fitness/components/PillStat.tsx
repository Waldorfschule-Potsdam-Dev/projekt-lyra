type Props = {
  n: string;
  l: string;
  highlight?: boolean;
};

export function PillStat({ n, l, highlight }: Props) {
  return (
    <div
      style={{
        padding: highlight ? '6px 14px' : '0',
        borderRadius: highlight ? '12px' : '0',
        backgroundColor: highlight ? 'rgba(255,255,255,0.12)' : 'transparent',
      }}
    >
      <div style={{ fontSize: '20px', fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>{n}</div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '2px', fontWeight: 500 }}>{l}</div>
    </div>
  );
}
