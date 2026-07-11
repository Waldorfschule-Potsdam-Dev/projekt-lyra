import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';

const APP_LOCK = '885746';
const LOCK_LEN = APP_LOCK.length;
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 60_000;
const LOCKOUT_KEY = 'wallet-lockout-until';

function readLockout(): number | null {
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY);
    if (!raw) return null;
    const v = Number(raw);
    if (!Number.isFinite(v) || v <= Date.now()) return null;
    return v;
  } catch {
    return null;
  }
}

function writeLockout(until: number | null) {
  try {
    if (until == null) localStorage.removeItem(LOCKOUT_KEY);
    else localStorage.setItem(LOCKOUT_KEY, String(until));
  } catch {
    /* ignore */
  }
}

function formatMMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(() => readLockout());
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (lockedUntil == null) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        setLockedUntil(null);
        setAttempts(0);
        setError(null);
        setCode('');
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [lockedUntil]);

  useEffect(() => {
    writeLockout(lockedUntil);
  }, [lockedUntil]);

  const isLocked = lockedUntil != null;

  const handleChange = (v: string) => {
    if (isLocked) return;
    const cleaned = v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, LOCK_LEN);
    setCode(cleaned);
    if (error) setError(null);
    if (cleaned.length === LOCK_LEN) {
      if (cleaned === APP_LOCK) {
        writeLockout(null);
        window.setTimeout(onUnlock, 120);
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        setShake((n) => n + 1);
        if (nextAttempts >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCK_DURATION_MS);
          setError(null);
        } else {
          setError(
            `Falscher Code. Noch ${MAX_ATTEMPTS - nextAttempts} Versuche.`,
          );
        }
        window.setTimeout(() => setCode(''), 400);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0B8043',
        color: '#fff',
        padding: '0 24px',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <CreditCard size={36} color="#fff" />
      </div>
      <h1
        style={{
          margin: 0,
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: -0.3,
        }}
      >
        Wallet
      </h1>
      <p
        style={{
          margin: '8px 0 32px',
          fontSize: 14,
          opacity: 0.85,
          textAlign: 'center',
        }}
      >
        {isLocked ? 'Zu viele Fehlversuche' : 'Code eingeben'}
      </p>

      <motion.div
        key={shake}
        animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', gap: 8, marginBottom: 16 }}
      >
        {Array.from({ length: LOCK_LEN }).map((_, i) => {
          const filled = !isLocked && i < code.length;
          return (
            <div
              key={i}
              style={{
                width: 34,
                height: 48,
                borderRadius: 8,
                backgroundColor: filled
                  ? 'rgba(255,255,255,0.18)'
                  : 'rgba(255,255,255,0.08)',
                border: `1.5px solid ${
                  isLocked
                    ? 'rgba(255,255,255,0.12)'
                    : error
                    ? '#ffb4ab'
                    : filled
                    ? 'rgba(255,255,255,0.4)'
                    : 'rgba(255,255,255,0.2)'
                }`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 600,
                opacity: isLocked ? 0.5 : 1,
              }}
            >
              {filled ? '•' : ''}
            </div>
          );
        })}
      </motion.div>

      {isLocked ? (
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: '#ffb4ab', marginBottom: 4 }}>
            Gesperrt
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 1.5,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatMMSS(remaining)}
          </div>
        </div>
      ) : (
        error && (
          <div style={{ fontSize: 13, color: '#ffb4ab', marginBottom: 12 }}>
            {error}
          </div>
        )
      )}

      <input
        value={code}
        onChange={(e) => handleChange(e.target.value)}
        inputMode="text"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={LOCK_LEN}
        disabled={isLocked}
        style={{
          position: 'absolute',
          opacity: 0,
          inset: 0,
          width: '100%',
          height: '100%',
          cursor: isLocked ? 'not-allowed' : 'pointer',
        }}
        aria-label="Code"
      />

      {!isLocked && (
        <div
          style={{
            fontSize: 12,
            opacity: 0.6,
            marginTop: 24,
            textAlign: 'center',
          }}
        >
          NORDLICHT
        </div>
      )}
    </motion.div>
  );
}
