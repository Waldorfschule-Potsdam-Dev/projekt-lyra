import { motion } from 'framer-motion';
import { BRAND, BRAND_LIGHT } from '../data';
import type { Tokens } from '../types';

export function Sparkline({ t }: { t: Tokens }) {
  const points = [40, 65, 30, 80, 55, 90, 50];
  const w = 100;
  const h = 60;
  const max = Math.max(...points);
  const stepX = w / (points.length - 1);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${h - (p / max) * h * 0.85}`).join(' ');
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h + 4}`} preserveAspectRatio="none" style={{ width: '100%', height: 60 }}>
      <defs>
        <linearGradient id="sparkArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BRAND} stopOpacity="0.3" />
          <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sparkLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={BRAND} />
          <stop offset="100%" stopColor={BRAND_LIGHT} />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill="url(#sparkArea)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke="url(#sparkLine)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
      />
      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={i * stepX}
          cy={h - (p / max) * h * 0.85}
          r="2.5"
          fill={t.sparkDot}
          stroke={BRAND}
          strokeWidth="1.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6 + i * 0.05 }}
        />
      ))}
    </svg>
  );
}
