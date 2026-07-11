import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { Tokens } from '../types';

type Props = {
  icon: LucideIcon;
  label: string;
  value: string;
  grad: [string, string];
  delay: number;
  t: Tokens;
};

export function StatCard({ icon: Icon, label, value, grad, delay, t }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        backgroundColor: t.card,
        borderRadius: '20px',
        padding: '14px 12px',
        boxShadow: t.shadow,
        border: `1px solid ${t.cardBorder}`,
      }}
    >
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${grad[0]} 0%, ${grad[1]} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 6px 14px ${grad[0]}44`,
          marginBottom: '10px',
        }}
      >
        <Icon size={16} color="white" />
      </div>
      <div style={{ fontSize: '18px', fontWeight: 800, color: t.text, letterSpacing: '-0.3px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: t.textSoft, marginTop: '2px' }}>{label}</div>
    </motion.div>
  );
}
