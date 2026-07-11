import { motion } from 'framer-motion';

type Props = {
  color: string;
  label: string;
  value: number;
  suffix: string;
  pct: number;
};

export function RingLegend({ color, label, value, suffix, pct }: Props) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <div style={{ fontSize: '11px', opacity: 0.75, fontWeight: 500 }}>{label}</div>
      </div>
      <div style={{ fontSize: '15px', fontWeight: 700 }}>
        {value} <span style={{ fontSize: '11px', fontWeight: 500, opacity: 0.7 }}>{suffix}</span>
      </div>
      <div style={{ marginTop: '4px', height: '4px', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          style={{ height: '100%', backgroundColor: color }}
        />
      </div>
    </div>
  );
}
