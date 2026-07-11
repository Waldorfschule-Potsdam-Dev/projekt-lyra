import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

type Props = {
  move: number;
  exercise: number;
  stand: number;
};

export function ActivityRings({ move, exercise, stand }: Props) {
  const size = 120;
  const stroke = 12;
  const c = size / 2;
  const rings = [
    { pct: move, color: '#FF3B30', r: c - stroke / 2 - 16 },
    { pct: exercise, color: '#A8E063', r: c - stroke / 2 },
    { pct: stand, color: '#00C7BE', r: c - stroke / 2 + 16 },
  ];

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((r, i) => {
          const circ = 2 * Math.PI * r.r;
          return (
            <g key={i} transform={`rotate(-90 ${c} ${c})`}>
              <circle cx={c} cy={c} r={r.r} stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} fill="none" />
              <motion.circle
                cx={c}
                cy={c}
                r={r.r}
                stroke={r.color}
                strokeWidth={stroke}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ * (1 - r.pct) }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 + i * 0.1 }}
              />
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <Flame size={20} fill="#FFD54F" color="#FFD54F" />
        <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>72%</div>
      </div>
    </div>
  );
}
