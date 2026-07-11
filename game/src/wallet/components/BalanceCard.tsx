import { useBalance, formatEUR } from '../data';

export function BalanceCard() {
  const [b] = useBalance();
  const giro = b.giro;
  const spar = b.spar;
  const total = giro + spar;
  return (
    <div
      style={{
        margin: '12px 16px 0',
        padding: '16px 18px',
        backgroundColor: '#fff',
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#5f6368',
          letterSpacing: 0.6,
          marginBottom: 4,
        }}
      >
        GESAMTKONTOSTAND
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: '#202124',
          letterSpacing: -0.5,
          marginBottom: 14,
        }}
      >
        {formatEUR(total)}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          paddingTop: 12,
          borderTop: '1px solid #ececec',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: '#5f6368', marginBottom: 2 }}>Girokonto</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#202124' }}>
            {formatEUR(giro)}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#5f6368', marginBottom: 2 }}>Sparkonto</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#202124' }}>
            {formatEUR(spar)}
          </div>
        </div>
      </div>
    </div>
  );
}
