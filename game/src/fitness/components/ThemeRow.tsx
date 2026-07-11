import { AnimatePresence, motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { BRAND, BRAND_LIGHT } from '../data';
import type { Theme, Tokens } from '../types';

type Props = {
  t: Tokens;
  theme: Theme;
  setTheme: (t: Theme) => void;
};

export function ThemeRow({ t, theme, setTheme }: Props) {
  const isDark = theme === 'dark';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px' }}>
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: isDark ? 'linear-gradient(135deg, #2a1a14, #4a2a20)' : 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
          color: isDark ? BRAND_LIGHT : BRAND,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ rotate: -45, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 45, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? <Moon size={18} /> : <Sun size={18} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <div style={{ flex: 1, fontSize: '14px', color: t.text, fontWeight: 500 }}>Dark Mode</div>
      <motion.button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        whileTap={{ scale: 0.95 }}
        animate={{ backgroundColor: isDark ? BRAND : '#E5E5EA' }}
        transition={{ duration: 0.2 }}
        style={{
          width: 52,
          height: 30,
          borderRadius: 15,
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: 0,
        }}
      >
        <motion.div
          animate={{ x: isDark ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            position: 'absolute',
            top: 2,
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: 'white',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}
        />
      </motion.button>
    </div>
  );
}
