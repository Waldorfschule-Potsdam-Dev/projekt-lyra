import { AnimatePresence, motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { BRAND } from '../data';
import type { Theme, Tokens } from '../types';
import { CircleIcon } from './CircleIcon';

type Props = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  t: Tokens;
};

export function ThemeToggleButton({ theme, setTheme, t }: Props) {
  return (
    <CircleIcon bg={t.iconBg} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.22 }}
        >
          {theme === 'dark' ? <Sun size={18} color={BRAND} /> : <Moon size={18} color={t.text} />}
        </motion.div>
      </AnimatePresence>
    </CircleIcon>
  );
}
