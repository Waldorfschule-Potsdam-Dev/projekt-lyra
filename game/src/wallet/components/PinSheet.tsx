import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { PIN } from '../data';

export function PinSheet({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setCode('');
      setError(null);
    }
  }, [open]);

  const submit = () => {
    if (code === PIN) {
      setError(null);
      onSuccess();
    } else {
      setError('Falscher Code. Versuche es erneut.');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 25,
          }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              backgroundColor: '#1c1b1f',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: '12px 20px 28px',
              color: '#fff',
            }}
          >
            <div
              style={{
                width: 36,
                height: 4,
                backgroundColor: '#444746',
                borderRadius: 2,
                margin: '0 auto 16px',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>
                Bezahlen
              </h2>
              <X
                size={24}
                color="#fff"
                onClick={onClose}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <div style={{ fontSize: 13, color: '#c4c7c5', marginBottom: 20 }}>
              Code eingeben, um die Bezahlfunktion freizuschalten.
            </div>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#a8c7fa',
                  letterSpacing: 0.4,
                }}
              >
                CODE
              </span>
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 4));
                  if (error) setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && code.length === 4) submit();
                }}
                placeholder="••••"
                inputMode="numeric"
                autoFocus
                style={{
                  padding: '16px',
                  borderRadius: 12,
                  border: `1px solid ${error ? '#f28b82' : '#444746'}`,
                  backgroundColor: '#2b2a30',
                  color: '#fff',
                  fontSize: 22,
                  letterSpacing: 8,
                  textAlign: 'center',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </label>

            {error && (
              <div
                style={{
                  fontSize: 13,
                  color: '#f28b82',
                  marginBottom: 12,
                  textAlign: 'center',
                }}
              >
                {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={code.length !== 4}
              style={{
                width: '100%',
                marginTop: 8,
                padding: '14px 18px',
                backgroundColor: code.length === 4 ? '#0B8043' : '#3a3a3a',
                color: '#fff',
                border: 'none',
                borderRadius: 24,
                fontSize: 15,
                fontWeight: 500,
                fontFamily: 'inherit',
                cursor: code.length === 4 ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Check size={18} />
              Freischalten
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
