import { useState, useEffect } from 'react';
import { Plus, Minus, Flame } from 'lucide-react';
import { casinoTheme } from './CasinoTheme';

const QUICK_BETS = [10, 25, 50, 100, 250, 500];

export function BetPicker({ label, value, max, disabled, onChange, onSound, onAllIn }: { label: string; value: number; max: number; disabled: boolean; onChange: (v: number) => void; onSound: () => void; onAllIn?: () => void }) {
  const [customStr, setCustomStr] = useState(String(value));
  useEffect(() => { setCustomStr(String(value)); }, [value]);
  const dec = () => { onSound(); onChange(Math.max(1, value - 1)); };
  const inc = () => { onSound(); onChange(Math.min(Math.max(1, max), value + 1)); };
  const commit = () => {
    const n = parseInt(customStr, 10);
    if (Number.isFinite(n) && n > 0) {
      onChange(Math.min(max, n));
    } else {
      setCustomStr(String(value));
    }
  };
  const allIn = () => {
    if (onAllIn) {
      onAllIn();
    } else {
      onSound();
      onChange(max);
    }
  };
  return (
    <div>
      <div style={{
        fontSize: 11, color: casinoTheme.text.tertiary,
        fontFamily: casinoTheme.font.mono, letterSpacing: 1,
        textTransform: 'uppercase', marginBottom: 6,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>{label}</span>
        {max > 0 && value >= max && (
          <span style={{
            fontSize: 10, color: '#ff6b00', fontWeight: 800,
            display: 'inline-flex', alignItems: 'center', gap: 3,
            textShadow: '0 0 6px #ff6b00',
            animation: 'fire-glow 0.8s ease-in-out infinite',
          }}>
            <Flame size={10} /> ALL IN
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {QUICK_BETS.map(v => (
          <button
            key={v}
            onClick={() => { onSound(); onChange(v); }}
            disabled={disabled || v > max}
            style={{
              flex: 1, minWidth: 50,
              padding: '10px 0',
              border: `1px solid ${value === v ? casinoTheme.accent.gold : casinoTheme.border.default}`,
              borderRadius: 8,
              background: value === v ? casinoTheme.accent.goldSoft : 'transparent',
              color: value === v ? casinoTheme.accent.goldHi : casinoTheme.text.primary,
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
              fontFamily: casinoTheme.font.system,
              opacity: (disabled || v > max) ? 0.4 : 1,
            }}
          >
            ${v}
          </button>
        ))}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: casinoTheme.bg.panel,
          border: `1px solid ${casinoTheme.border.gold}`,
          borderRadius: 8,
          overflow: 'hidden',
          opacity: disabled ? 0.4 : 1,
        }}>
          <button
            onClick={dec}
            disabled={disabled}
            style={{
              padding: '8px 6px',
              border: 'none',
              background: 'transparent',
              color: casinoTheme.accent.goldHi,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            <Minus size={14} />
          </button>
          <input
            type="number"
            value={customStr}
            onChange={(e) => setCustomStr(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
            disabled={disabled}
            style={{
              width: 60,
              padding: '8px 4px',
              border: 'none',
              background: 'transparent',
              color: casinoTheme.accent.goldHi,
              fontSize: 13, fontWeight: 700,
              fontFamily: casinoTheme.font.mono,
              textAlign: 'center',
              outline: 'none',
            }}
          />
          <button
            onClick={inc}
            disabled={disabled}
            style={{
              padding: '8px 6px',
              border: 'none',
              background: 'transparent',
              color: casinoTheme.accent.goldHi,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            <Plus size={14} />
          </button>
        </div>
        <button
          onClick={allIn}
          disabled={disabled || max <= 0}
          style={{
            padding: '10px 14px',
            border: `2px solid ${value >= max ? '#ff6b00' : casinoTheme.accent.gold}`,
            borderRadius: 8,
            background: value >= max
              ? 'linear-gradient(135deg, #ff6b00 0%, #ffaa00 100%)'
              : 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
            color: '#fff',
            fontSize: 12, fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 1,
            cursor: (disabled || max <= 0) ? 'not-allowed' : 'pointer',
            fontFamily: casinoTheme.font.system,
            boxShadow: value >= max
              ? '0 0 14px rgba(255,107,0,0.7)'
              : '0 0 10px rgba(220,38,38,0.5)',
            opacity: (disabled || max <= 0) ? 0.4 : 1,
            display: 'flex', alignItems: 'center', gap: 4,
            animation: value >= max ? 'fire-glow 0.8s ease-in-out infinite' : 'none',
            transition: 'all 0.15s',
          }}
        >
          <Flame size={12} /> Max
        </button>
      </div>
    </div>
  );
}
