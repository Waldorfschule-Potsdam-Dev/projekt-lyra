import { motion } from 'framer-motion';
import { Activity, Dumbbell, User, type LucideIcon } from 'lucide-react';
import { BRAND, BRAND_LIGHT } from '../data';
import type { Tokens } from '../types';

const ITEMS: { id: 'overview' | 'trainings' | 'profile'; label: string; Icon: LucideIcon }[] = [
  { id: 'overview', label: 'Übersicht', Icon: Activity },
  { id: 'trainings', label: 'Trainings', Icon: Dumbbell },
  { id: 'profile', label: 'Profil', Icon: User },
];

type Props = {
  active: 'overview' | 'trainings' | 'profile';
  onChange: (id: 'overview' | 'trainings' | 'profile') => void;
  t: Tokens;
};

export function BottomNav({ active, onChange, t }: Props) {
  return (
    <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16, zIndex: 50 }}>
      <motion.div
        animate={{
          backgroundColor: t.nav,
          borderColor: t.navBorder,
          boxShadow: t.shadowNav,
        }}
        transition={{ duration: 0.25 }}
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '8px',
          borderRadius: '24px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid',
        }}
      >
        {ITEMS.map((it) => {
          const isActive = active === it.id;
          return (
            <motion.button
              key={it.id}
              onClick={() => onChange(it.id)}
              whileTap={{ scale: 0.92 }}
              style={{
                flex: 1,
                position: 'relative',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="fitness-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '18px',
                    background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)`,
                    boxShadow: `0 8px 20px ${BRAND}55`,
                  }}
                />
              )}
              <motion.div
                animate={{ color: isActive ? '#FFFFFF' : t.textSoft }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '10px 4px',
                }}
              >
                <it.Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                <span style={{ fontSize: '11px', fontWeight: isActive ? 700 : 500, letterSpacing: '0.1px' }}>
                  {it.label}
                </span>
              </motion.div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
