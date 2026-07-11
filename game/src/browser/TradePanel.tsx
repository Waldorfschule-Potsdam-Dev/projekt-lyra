import { useState } from 'react';
import { ArrowUp, ArrowDown, AlertCircle, CheckCircle2, TrendingDown, TrendingUp, History, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Asset } from './TradeData';
import type { Theme } from './tradeTheme';
import { withAlpha } from './tradeTheme';
import type { Position } from './portfolio';
import { calcPL } from './portfolio';

export type TradeFeedbackKind = 'income' | 'expense' | 'error';

export interface TradeFeedback {
  kind: TradeFeedbackKind;
  label: string;
  symbol: string;
  amount: number;
  message?: string;
}

interface TradePanelProps {
  asset: Asset;
  theme: Theme;
  cash: number;
  positions: Position[];
  tradeCount: number;
  feedback: TradeFeedback | null;
  onBuy: (amount: number) => boolean;
  onShort: (amount: number) => boolean;
  onClose: (positionId: string) => boolean;
  onOpenHistory: () => void;
  onOpenCloseSheet: () => void;
}

const PRESET_AMOUNTS = [10, 25, 50, 100];

function formatEUR(v: number): string {
  return '$' + v.toFixed(2).replace('.', ',');
}

function formatAmount(n: number): string {
  if (n >= 1) return n.toFixed(4);
  if (n >= 0.0001) return n.toFixed(6);
  return n.toFixed(8);
}

export function TradePanel(props: TradePanelProps) {
  const { asset, theme, cash, positions, tradeCount, feedback, onBuy, onShort, onOpenHistory, onOpenCloseSheet } = props;
  const [side, setSide] = useState<'buy' | 'short'>('buy');
  const [amount, setAmount] = useState('');

  const num = parseFloat(amount) || 0;
  const quantity = asset.price > 0 ? num / asset.price : 0;
  const insufficient = num > cash + 0.005;
  const missing = Math.max(0, num - cash);
  const canExecute = num > 0 && quantity > 0 && !insufficient;

  const assetPositions = positions.filter(p => p.assetId === asset.id);
  const totalPL = assetPositions.reduce((sum, p) => sum + calcPL(p, asset.price), 0);

  const handleExecute = () => {
    if (!canExecute) return;
    const ok = side === 'buy' ? onBuy(num) : onShort(num);
    if (ok) setAmount('');
  };

  const g = theme.green;
  const r = theme.red;
  const tp = theme.text.primary;
  const tt = theme.text.tertiary;
  const tm = theme.text.muted;
  const ti = theme.text.inverse;
  const bp = theme.bg.page;
  const be = theme.bg.elevated;
  const bi = theme.bg.input;
  const bd = theme.border.default;
  const bs = theme.border.subtle;
  const accent = side === 'buy' ? g : r;

  const inputStyle = {
    flex: 1, padding: '8px 10px',
    background: bi, border: '1px solid ' + (insufficient ? r : bd), borderRadius: 4,
    color: tp, fontSize: 13, fontWeight: 700, fontFamily: 'monospace',
    outline: 'none',
    transition: 'border-color 0.15s',
  } as const;

  const feedbackColors: Record<TradeFeedbackKind, { bg: string; border: string; text: string; iconColor: string }> = {
    income: { bg: withAlpha(g, 0.18), border: g, text: tp, iconColor: g },
    expense: { bg: withAlpha(r, 0.18), border: r, text: tp, iconColor: r },
    error: { bg: withAlpha(r, 0.28), border: r, text: tp, iconColor: r },
  };
  const fb = feedback ? feedbackColors[feedback.kind] : null;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', background: bp, borderTop: '1px solid ' + bd }}>
      <AnimatePresence>
        {feedback && fb && (
          <motion.div
            key="feedback"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              transform: 'translateY(-100%)',
              background: fb.bg,
              borderTop: '1px solid ' + fb.border,
              borderBottom: '1px solid ' + fb.border,
              borderLeft: '3px solid ' + fb.border,
              borderRight: '1px solid ' + fb.border,
              color: fb.text,
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 10,
              fontWeight: 700,
              fontFamily: 'monospace',
              letterSpacing: 0.5,
              zIndex: 5,
            }}
          >
            {feedback.kind === 'income' ? (
              <CheckCircle2 size={12} color={fb.iconColor} />
            ) : feedback.kind === 'expense' ? (
              <ArrowUp size={12} color={fb.iconColor} />
            ) : (
              <AlertCircle size={12} color={fb.iconColor} />
            )}
            <span style={{ color: fb.iconColor }}>{feedback.label}</span>
            <span style={{ color: tp }}>·</span>
            <span style={{ color: tp }}>{feedback.symbol}</span>
            {feedback.kind === 'error' ? (
              <>
                <span style={{ flex: 1, color: r }}>· {feedback.message || 'Fehler'} (es fehlen {formatEUR(feedback.amount)})</span>
              </>
            ) : (
              <>
                <span style={{ flex: 1, color: tt }}>
                  {feedback.message ? `· ${feedback.message}` : `· Konto ${formatEUR(feedback.kind === 'expense' ? -feedback.amount : feedback.amount)}`}
                </span>
                <span style={{ color: feedback.kind === 'income' ? g : r, fontWeight: 800 }}>
                  {feedback.kind === 'income' ? '+' : '−'}
                  {formatEUR(feedback.amount)}
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: be, borderBottom: '1px solid ' + bs, gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
            <span style={{ fontSize: 9, color: tt, fontWeight: 700, letterSpacing: 1, fontFamily: 'monospace' }}>KONTO</span>
            <span style={{ fontSize: 14, color: tp, fontWeight: 800, fontFamily: 'monospace' }}>{formatEUR(cash)}</span>
          </div>
          <div style={{ fontSize: 8, color: tt, fontFamily: 'monospace', opacity: 0.6 }}>Aufladekonto: 4532 1234 8765 4321</div>
        </div>
        {assetPositions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 9, color: tt, fontWeight: 700, letterSpacing: 1, fontFamily: 'monospace' }}>P/L</span>
            <span style={{ fontSize: 13, color: totalPL >= 0 ? g : r, fontWeight: 800, fontFamily: 'monospace', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              {totalPL >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {totalPL >= 0 ? '+' : ''}{formatEUR(totalPL)}
            </span>
          </div>
        )}
        <button
          onClick={onOpenHistory}
          title="Trade-Historie öffnen"
          aria-label="Trade-Historie öffnen"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: withAlpha(theme.accent, 0.1),
            border: '1px solid ' + withAlpha(theme.accent, 0.5),
            borderRadius: 4,
            padding: '3px 7px',
            color: theme.accent, fontSize: 9, fontWeight: 800, letterSpacing: 1,
            cursor: 'pointer', fontFamily: 'monospace',
            marginLeft: 'auto',
          }}
        >
          <History size={10} />
          HIST.
          {tradeCount > 0 && (
            <span style={{
              background: theme.accent, color: theme.text.inverse,
              borderRadius: 2, padding: '0 4px', fontSize: 9, minWidth: 14, textAlign: 'center',
            }}>
              {tradeCount}
            </span>
          )}
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid ' + bs }}>
        {(['buy', 'short'] as const).map(s => {
          const active = side === s;
          const sAccent = s === 'buy' ? g : r;
          return (
            <button
              key={s}
              onClick={() => setSide(s)}
              style={{
                flex: 1, padding: '9px 0',
                background: active ? withAlpha(sAccent, 0.1) : 'none', border: 'none',
                color: active ? sAccent : tt,
                fontSize: 11, fontWeight: 800, cursor: 'pointer',
                borderBottom: active ? '2px solid ' + sAccent : '2px solid transparent',
                letterSpacing: 1,
                fontFamily: 'monospace',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {s === 'buy' ? 'KAUFEN' : 'SHORTEN'}
            </button>
          );
        })}
      </div>

      <div style={{ padding: '8px 10px 4px', display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: tt, fontWeight: 800, fontFamily: 'monospace' }}>$</span>
        <input
          value={amount}
          onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder="0.00"
          inputMode="decimal"
          style={inputStyle}
        />
        <span style={{ fontSize: 10, color: tt, fontWeight: 800, fontFamily: 'monospace' }}>{asset.symbol}</span>
        <span style={{ fontSize: 11, color: insufficient ? r : tm, fontFamily: 'monospace', fontWeight: 700, minWidth: 70, textAlign: 'right' }}>
          = {formatAmount(quantity)} {asset.symbol}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: '0 10px 6px' }}>
        {PRESET_AMOUNTS.map(p => (
          <button
            key={p}
            onClick={() => setAmount(String(p))}
            style={{
              flex: 1, padding: '4px 0',
              background: 'transparent',
              border: '1px solid ' + bd,
              borderRadius: 4,
              color: tt, fontSize: 10, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'monospace',
            }}
          >
            ${p}
          </button>
        ))}
        <button
          onClick={() => {
            setAmount(cash.toFixed(2));
          }}
          style={{
            flex: 1, padding: '4px 0',
            background: withAlpha(accent, 0.1),
            border: '1px solid ' + accent,
            borderRadius: 4,
            color: accent, fontSize: 10, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'monospace',
            letterSpacing: 1,
          }}
        >
          MAX
        </button>
      </div>

      <AnimatePresence>
        {insufficient && num > 0 && (
          <motion.div
            key="err"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              margin: '0 10px 6px',
              padding: '6px 8px',
              background: withAlpha(r, 0.12),
              border: '1px solid ' + withAlpha(r, 0.5),
              borderRadius: 4,
              display: 'flex', alignItems: 'center', gap: 6,
              color: r, fontSize: 10, fontWeight: 700, fontFamily: 'monospace',
            }}>
              <AlertCircle size={11} />
              <span>Zu wenig Guthaben — {formatEUR(missing)} fehlen</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ padding: '0 10px 8px', display: 'flex', gap: 6 }}>
        <button
          onClick={handleExecute}
          disabled={!canExecute}
          style={{
            flex: 1, padding: '10px 6px',
            background: canExecute ? accent : tm,
            border: 'none', borderRadius: 4,
            color: canExecute ? ti : bp,
            fontSize: 11, fontWeight: 800, letterSpacing: 0.8,
            cursor: canExecute ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            opacity: canExecute ? 1 : 0.5,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            transition: 'opacity 0.15s, background 0.15s',
            minWidth: 0,
          }}
        >
          {side === 'buy' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            AKQUIRIEREN · {side === 'buy' ? 'KAUFEN' : 'SHORTEN'}
          </span>
        </button>
        <button
          onClick={onOpenCloseSheet}
          disabled={positions.length === 0}
          aria-label="Position schließen"
          style={{
            padding: '10px 10px',
            background: positions.length > 0 ? withAlpha(r, 0.1) : 'transparent',
            border: positions.length > 0 ? '1px solid ' + r : '1px solid ' + bd,
            borderRadius: 4,
            color: positions.length > 0 ? r : tm,
            fontSize: 10, fontWeight: 800, letterSpacing: 0.8,
            cursor: positions.length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            opacity: positions.length > 0 ? 1 : 0.5,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            transition: 'opacity 0.15s, background 0.15s',
            position: 'relative',
          }}
        >
          <XCircle size={12} />
          <span>SCHLIESSEN</span>
          {positions.length > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              minWidth: 16, height: 16, padding: '0 4px', borderRadius: 8,
              background: r, color: theme.text.inverse,
              fontSize: 9, fontWeight: 800, fontFamily: 'monospace',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid ' + bp,
            }}>
              {positions.length}
            </span>
          )}
        </button>
      </div>

      {assetPositions.length > 0 && (
        <div style={{ borderTop: '1px solid ' + bs, maxHeight: 90, overflowY: 'auto' }} className="hide-scrollbar">
          <div
            onClick={onOpenCloseSheet}
            style={{
              padding: '6px 10px 4px', fontSize: 9, color: tt, fontWeight: 800, letterSpacing: 1,
              fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <span>OFFENE POSITIONEN HIER ({assetPositions.length})</span>
            <span style={{ color: totalPL >= 0 ? g : r }}>
              {totalPL >= 0 ? '+' : ''}{formatEUR(totalPL)}
            </span>
          </div>
          {assetPositions.map(p => {
            const pl = calcPL(p, asset.price);
            const dirColor = p.direction === 'long' ? g : r;
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', fontSize: 10, fontFamily: 'monospace', borderBottom: '1px solid ' + bs, flexWrap: 'wrap' }}>
                <span style={{ color: dirColor, fontWeight: 800, fontSize: 11, width: 12, textAlign: 'center' }}>
                  {p.direction === 'long' ? '\u25B2' : '\u25BC'}
                </span>
                <span style={{ color: tp, fontWeight: 800, minWidth: 36 }}>{p.symbol}</span>
                <span style={{ color: theme.text.secondary }}>{p.amount < 1 ? p.amount.toFixed(6) : p.amount.toFixed(4)}</span>
                <span style={{ color: tt }}>@{p.entryPrice.toFixed(2)}</span>
                <span style={{ flex: 1, color: pl >= 0 ? g : r, fontWeight: 800, textAlign: 'right' }}>
                  {pl >= 0 ? '+' : ''}{formatEUR(pl)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
