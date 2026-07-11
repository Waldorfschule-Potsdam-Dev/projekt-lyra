import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

type Props = {
  children: ReactNode;
  bg: string;
  size?: number;
  onClick?: () => void;
};

export function CircleIcon({ children, bg, size = 40, onClick }: Props) {
  return (
    <motion.div
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        cursor: onClick ? 'pointer' : 'default',
        border: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {children}
    </motion.div>
  );
}
