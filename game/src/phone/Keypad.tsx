import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Delete } from 'lucide-react';

const KEYS: Array<{ label: string; sub?: string }> = [
  { label: '1' },
  { label: '2', sub: 'ABC' },
  { label: '3', sub: 'DEF' },
  { label: '4', sub: 'GHI' },
  { label: '5', sub: 'JKL' },
  { label: '6', sub: 'MNO' },
  { label: '7', sub: 'PQRS' },
  { label: '8', sub: 'TUV' },
  { label: '9', sub: 'WXYZ' },
  { label: '*' },
  { label: '0', sub: '+' },
  { label: '#' },
];

interface KeypadProps {
  value: string;
  contactName?: string;
  feedback?: string | null;
  inCall?: boolean;
  activeNumber?: string | null;
  onChange: (next: string) => void;
  onCall: () => void;
  onHangUp: () => void;
}

export default function Keypad({
  value,
  contactName,
  feedback,
  inCall = false,
  activeNumber = null,
  onChange,
  onCall,
  onHangUp,
}: KeypadProps) {
  const handlePress = (key: string) => {
    onChange(value + key);
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '8px 20px 16px',
        backgroundColor: '#fafafa',
      }}
    >
      <div
        style={{
          flex: '0 0 auto',
          minHeight: 96,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          gap: 4,
        }}
      >
        {contactName && !feedback && !inCall ? (
          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: '#34A853',
              letterSpacing: 0.2,
            }}
          >
            {contactName}
          </div>
        ) : (
          <div style={{ height: 19 }} />
        )}
        <AnimatePresence mode="wait">
          {feedback ? (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              style={{
                fontSize: 17,
                fontWeight: 500,
                color: '#34A853',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                minHeight: 40,
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#34A853',
                  display: 'inline-block',
                }}
              />
              {feedback}
            </motion.div>
          ) : inCall ? (
            <motion.div
              key="incall"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                minHeight: 40,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#E53935',
                  letterSpacing: 0.3,
                }}
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    backgroundColor: '#E53935',
                    display: 'inline-block',
                  }}
                />
                Im Gespräch
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  color: '#1a1a1a',
                  letterSpacing: 0.5,
                }}
              >
                {activeNumber || ''}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 40,
                maxWidth: '100%',
              }}
            >
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 300,
                  letterSpacing: 0.5,
                  color: value ? '#1a1a1a' : '#bdbdbd',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                  textAlign: 'center',
                  wordBreak: 'break-all',
                }}
              >
                {value || 'Nummer eingeben'}
              </span>
              {value && (
                <motion.span
                  animate={{ opacity: [1, 0.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                  style={{
                    display: 'inline-block',
                    width: 2,
                    height: 28,
                    backgroundColor: '#34A853',
                    marginLeft: 3,
                    borderRadius: 1,
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          alignContent: 'center',
          pointerEvents: inCall || feedback ? 'none' : 'auto',
          opacity: inCall || feedback ? 0.5 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {KEYS.map(({ label, sub }) => (
          <KeypadButton key={label} label={label} sub={sub} onPress={() => handlePress(label)} />
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px 4px',
          pointerEvents: feedback ? 'none' : 'auto',
          opacity: feedback ? 0.5 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        <div style={{ width: 56 }} />
        {inCall ? (
          <HangUpButton onHangUp={onHangUp} />
        ) : (
          <CallButton onCall={onCall} disabled={!value || !!feedback} />
        )}
        <BackspaceButton onPress={handleBackspace} disabled={!value || !!feedback || inCall} />
      </div>
    </div>
  );
}

const KeypadButton = ({
  label,
  sub,
  onPress,
}: {
  label: string;
  sub?: string;
  onPress: () => void;
}) => (
  <motion.button
    whileTap={{ scale: 0.92, backgroundColor: '#d8e8df' }}
    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
    onClick={onPress}
    style={{
      height: 58,
      borderRadius: 18,
      backgroundColor: '#f1f3f4',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      padding: 0,
    }}
  >
    <span style={{ fontSize: 28, fontWeight: 400, color: '#1a1a1a', lineHeight: 1 }}>{label}</span>
    {sub && (
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: '#666',
          letterSpacing: 1.4,
        }}
      >
        {sub}
      </span>
    )}
  </motion.button>
);

const CallButton = ({ onCall, disabled }: { onCall: () => void; disabled: boolean }) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    whileHover={{ scale: disabled ? 1 : 1.04 }}
    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
    onClick={onCall}
    disabled={disabled}
    style={{
      width: 72,
      height: 72,
      borderRadius: '50%',
      backgroundColor: disabled ? '#c8e6c9' : '#34A853',
      border: 'none',
      cursor: disabled ? 'default' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: disabled ? 'none' : '0 6px 18px rgba(52, 168, 83, 0.45)',
    }}
    aria-label="Anrufen"
  >
    <Phone size={30} color="#fff" fill="#fff" />
  </motion.button>
);

const HangUpButton = ({ onHangUp }: { onHangUp: () => void }) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    whileHover={{ scale: 1.04 }}
    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
    onClick={onHangUp}
    style={{
      width: 72,
      height: 72,
      borderRadius: '50%',
      backgroundColor: '#E53935',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 6px 18px rgba(229, 57, 53, 0.45)',
    }}
    aria-label="Auflegen"
  >
    <PhoneOff size={30} color="#fff" />
  </motion.button>
);

const BackspaceButton = ({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled: boolean;
}) => (
  <motion.button
    whileTap={{ scale: 0.85, opacity: 0.7 }}
    onClick={onPress}
    disabled={disabled}
    style={{
      width: 56,
      height: 56,
      borderRadius: '50%',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: disabled ? 'default' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: disabled ? '#cfcfcf' : '#3c4043',
    }}
    aria-label="Letzte Ziffer löschen"
  >
    <Delete size={26} />
  </motion.button>
);
