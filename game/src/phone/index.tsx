import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Hash, List } from 'lucide-react';
import Keypad from './Keypad';
import CallLog from './CallLog';
import { buildSeedCallLog, lookupName } from './data';
import type { CallEntry } from './types';

const UNKNOWN_NUMBER_AUDIO = '/uploads/datengeister-8b5d3fa8.mp3';

let idSeed = 0;
const genId = () => `c_${Date.now()}_${++idSeed}`;

export default function TelefonApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callLog, setCallLog] = useState<CallEntry[]>(() => buildSeedCallLog());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [inCall, setInCall] = useState(false);
  const [activeNumber, setActiveNumber] = useState<string | null>(null);
  const feedbackTimer = useRef<number | null>(null);
  const unknownAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const audio = new Audio(UNKNOWN_NUMBER_AUDIO);
    audio.loop = true;
    audio.preload = 'auto';
    unknownAudioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      unknownAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    };
  }, []);

  const handleCall = useCallback(() => {
    if (!phoneNumber || inCall) return;
    const number = phoneNumber;
    const contactName = lookupName(number);
    const newEntry: CallEntry = {
      id: genId(),
      number,
      name: contactName,
      timestamp: new Date(),
      type: 'outgoing',
    };
    setCallLog((prev) => [newEntry, ...prev]);
    setPhoneNumber('');
    setActiveNumber(number);
    setFeedback(`Anruf an ${number}`);
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => {
      setFeedback(null);
      setInCall(true);
    }, 1800);

    if (number.replace(/[\s\-+()]/g, '') === '017699988877') {
      const audio = unknownAudioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    }
  }, [phoneNumber, inCall]);

  const handleHangUp = useCallback(() => {
    if (!inCall) return;
    setInCall(false);
    setActiveNumber(null);
    setFeedback('Beendet');
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setFeedback(null), 1500);

    const audio = unknownAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [inCall]);

  const handleSelectEntry = useCallback((number: string) => {
    setPhoneNumber(number);
    navigate('/phone/keypad');
  }, [navigate]);

  const contactName = phoneNumber ? lookupName(phoneNumber) : undefined;
  const isLog = location.pathname.endsWith('/log');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#fff',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          padding: '10px 20px 6px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#9aa0a6',
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            textAlign: 'center',
          }}
        >
          Telefon
        </div>
        <div
          style={{
            display: 'flex',
            backgroundColor: '#f1f3f4',
            borderRadius: 12,
            padding: 4,
          }}
        >
          <TabButton
            active={!isLog}
            label="Ziffernblock"
            Icon={Hash}
            onClick={() => navigate('/phone/keypad')}
          />
          <TabButton
            active={isLog}
            label="Anrufliste"
            Icon={List}
            onClick={() => navigate('/phone/log')}
          />
        </div>
      </header>

      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="keypad"
              element={
                <motion.div
                  key="keypad"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  style={{ position: 'absolute', inset: 0 }}
                >
                  <Keypad
                    value={phoneNumber}
                    contactName={contactName}
                    feedback={feedback}
                    inCall={inCall}
                    activeNumber={activeNumber}
                    onChange={setPhoneNumber}
                    onCall={handleCall}
                    onHangUp={handleHangUp}
                  />
                </motion.div>
              }
            />
            <Route
              path="log"
              element={
                <motion.div
                  key="log"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  style={{ position: 'absolute', inset: 0 }}
                >
                  <CallLog entries={callLog} onSelectEntry={handleSelectEntry} />
                </motion.div>
              }
            />
            <Route path="*" element={<Navigate to="/phone/keypad" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

function TabButton({
  active,
  label,
  Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  Icon: typeof Hash;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '8px 12px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        position: 'relative',
        fontSize: 13,
        fontWeight: 600,
        color: active ? '#1a1a1a' : '#5f6368',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        WebkitTapHighlightColor: 'transparent',
        fontFamily: 'inherit',
        borderRadius: 9,
      }}
    >
      {active && (
        <motion.div
          layoutId="phone-tab-indicator"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#fff',
            borderRadius: 9,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          }}
        />
      )}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Icon size={14} strokeWidth={2.2} />
        {label}
      </span>
    </button>
  );
}
