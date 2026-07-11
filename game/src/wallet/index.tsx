import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { HomeScreen, AddCardScreen, PayScreen, LockScreen, HistoryScreen } from './components';

const STORAGE_KEY = 'wallet-unlocked';

export default function WalletApp() {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleUnlock = () => {
    setUnlocked(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' }}>
      <AnimatePresence mode="wait">
        {unlocked ? (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
          >
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/add" element={<AddCardScreen />} />
              <Route path="/pay" element={<PayScreen />} />
              <Route path="/history" element={<HistoryScreen />} />
            </Routes>
          </motion.div>
        ) : (
          <LockScreen key="lock" onUnlock={handleUnlock} />
        )}
      </AnimatePresence>
    </div>
  );
}
