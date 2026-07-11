import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { Tokens } from '../types';

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  t: Tokens;
};

export function TopBar({ title, subtitle, right, t }: Props) {
  return (
    <div style={{ padding: '8px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '13px', color: t.textSoft, fontWeight: 500 }}
        >
          {subtitle ?? ''}
        </motion.div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: t.text, letterSpacing: '-0.6px', lineHeight: 1.1 }}>
          {title}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>{right}</div>
    </div>
  );
}
