import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUp, ArrowDown, ArrowUpRight, Clock } from 'lucide-react';
import type { Theme } from './tradeTheme';
import { withAlpha } from './tradeTheme';
import type { Trade, TradeKind } from './portfolio';

interface TradeHistoryProps {
  open: boolean;
  onClose: () => void;
  trades: Trade[];
  theme: Theme;
}

type Filter = 'alle' | 'buy' | 'short' | 'close';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'alle', label: 'ALLE' },
  { key: 'buy', label: 'KÄUFE' },
  { key: 'short', label: 'SHORTS' },
  { key: 'close', label: 'SCHLIESS.' },
];

function formatEUR(v: number): string {
  const sign = v < 0 ? '-' : '';
  return sign + '$' + Math.abs(v).toFixed(2).replace('.', ',');
}

function formatTime(t: number): string {
  const d = new Date(t);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tradeDay = new Date(d);
  tradeDay.setHours(0, 0, 0, 0);
  const sameDay = today.getTime() === tradeDay.getTime();
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  const ss = d.getSeconds().toString().padStart(2, '0');
  if (sameDay) return `${hh}:${mm}:${ss}`;
  const dd = d.getDate().toString().padStart(2, '0');
  const mo = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${dd}.${mo}. ${hh}:${mm}`;
}

function formatAmount(n: number): string {
  if (n >= 1) return n.toFixed(4);
  if (n >= 0.0001) return n.toFixed(6);
  return n.toFixed(8);
}

export function TradeHistory({ open, onClose, trades, theme }: TradeHistoryProps) {
  const [filter, setFilter] = useState<Filter>('alle');

  const filtered = useMemo(() => {
    const list = filter === 'alle' ? trades : trades.filter(t => t.kind === filter);
    return [...list].sort((a, b) => b.t - a.t);
  }, [trades, filter]);

  const counts = useMemo(() => ({
    alle: trades.length,
    buy: trades.filter(t => t.kind === 'buy').length,
    short: trades.filter(t => t.kind === 'short').length,
    close: trades.filter(t => t.kind === 'close').length,
  }), [trades]);

  const g = theme.green;
  const r = theme.red;
  const tp = theme.text.primary;
  const tt = theme.text.tertiary;
  const tm = theme.text.muted;
  const bp = theme.bg.page;
  const be = theme.bg.elevated;
  const bd = theme.border.default;
  const bs = theme.border.subtle;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            zIndex: 5000,
          }}
        >
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: bp,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              border: '1px solid ' + bd,
              borderBottom: 'none',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '85%',
              minHeight: '50%',
              color: tp,
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px 8px',
              borderBottom: '1px solid ' + bs,
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} color={theme.accent} />
                <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.2, color: tp, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                  TRADE-HISTORIE
                </span>
                <span style={{
                  fontSize: 10, color: tt, fontFamily: 'monospace', fontWeight: 700,
                  background: withAlpha(theme.accent, 0.12),
                  padding: '1px 6px', borderRadius: 3,
                }}>
                  {counts.alle}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Schließen"
                style={{
                  background: withAlpha(tp, 0.06),
                  border: 'none',
                  borderRadius: 4,
                  padding: 4,
                  cursor: 'pointer',
                  display: 'flex',
                  color: tt,
                }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid ' + bd, flexShrink: 0, background: be }}>
              {FILTERS.map(f => {
                const active = filter === f.key;
                const count = counts[f.key];
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    style={{
                      flex: 1, padding: '8px 4px',
                      background: 'transparent',
                      border: 'none',
                      color: active ? tp : tt,
                      fontSize: 10, fontWeight: 800,
                      cursor: 'pointer',
                      borderBottom: active ? '2px solid ' + theme.accent : '2px solid transparent',
                      letterSpacing: 0.8,
                      fontFamily: 'monospace',
                      transition: 'color 0.15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}
                  >
                    {f.label}
                    <span style={{
                      fontSize: 9, color: active ? theme.accent : tm,
                      background: active ? withAlpha(theme.accent, 0.15) : 'transparent',
                      padding: '1px 4px', borderRadius: 2,
                      minWidth: 14,
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} className="hide-scrollbar">
              {filtered.length === 0 ? (
                <div style={{
                  padding: '40px 16px', textAlign: 'center', color: tm,
                  fontSize: 12, fontFamily: 'monospace', letterSpacing: 0.5,
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>∅</div>
                  {trades.length === 0 ? 'Noch keine Trades ausgeführt' : 'Keine Trades in diesem Filter'}
                </div>
              ) : (
                filtered.map(t => {
                  const kindMeta = getKindMeta(t.kind, g, r, theme);
                  return (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex', flexDirection: 'column', gap: 4,
                        padding: '10px 14px',
                        borderBottom: '1px solid ' + bs,
                        background: bp,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          background: withAlpha(kindMeta.color, 0.15),
                          color: kindMeta.color,
                          padding: '2px 6px', borderRadius: 3,
                          fontSize: 9, fontWeight: 800, letterSpacing: 1,
                          fontFamily: 'monospace',
                          border: '1px solid ' + withAlpha(kindMeta.color, 0.4),
                        }}>
                          {kindMeta.icon}
                          {kindMeta.label}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: tp, fontFamily: 'monospace' }}>
                          {t.symbol}
                        </span>
                        <span style={{ fontSize: 11, color: theme.text.secondary, fontFamily: 'monospace' }}>
                          {formatAmount(t.amount)} {t.symbol}
                        </span>
                        <span style={{ flex: 1 }} />
                        <span style={{ fontSize: 10, color: tm, fontFamily: 'monospace' }}>
                          {formatTime(t.t)}
                        </span>
                      </div>

                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        fontSize: 10, fontFamily: 'monospace', color: tt,
                        paddingLeft: 4,
                      }}>
                        <span>
                          @ {t.entryPrice != null && t.kind === 'close' ? (
                            <>
                              <span style={{ color: tm }}>{t.entryPrice.toFixed(2)}</span>
                              <span style={{ color: tm, margin: '0 4px' }}>→</span>
                              <span style={{ color: tp, fontWeight: 700 }}>{t.price.toFixed(2)}</span>
                            </>
                          ) : (
                            <span style={{ color: tp, fontWeight: 700 }}>{t.price.toFixed(2)}</span>
                          )}
                        </span>
                        <span style={{ color: tt }}>·</span>
                        <span style={{ color: tt }}>Gebühr {formatEUR(t.fee)}</span>
                        <span style={{ flex: 1, textAlign: 'right', color: tp, fontWeight: 800 }}>
                          = {formatEUR(t.total)}
                        </span>
                      </div>

                      {t.kind === 'close' && t.pl != null && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          fontSize: 10, fontFamily: 'monospace', paddingLeft: 4,
                          flexWrap: 'wrap',
                        }}>
                          <span style={{ color: tt }}>Brutto P/L</span>
                          <span style={{
                            color: t.pl >= 0 ? g : r,
                            fontWeight: 800,
                          }}>
                            {t.pl >= 0 ? '+' : ''}{formatEUR(t.pl)}
                          </span>
                          <span style={{ color: tm, fontSize: 9 }}>
                            ({t.pl >= 0 ? '+' : ''}{((t.pl / t.total) * 100).toFixed(2)}%)
                          </span>
                          <span style={{ flex: 1 }} />
                          {t.netPl != null && (
                            <>
                              <span style={{ color: tt }}>Netto</span>
                              <span style={{
                                color: t.netPl >= 0 ? g : r,
                                fontWeight: 800, fontSize: 12,
                              }}>
                                {t.netPl >= 0 ? '+' : ''}{formatEUR(t.netPl)}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getKindMeta(kind: TradeKind, g: string, r: string, theme: Theme) {
  if (kind === 'buy') return { label: 'KAUFEN', color: g, icon: <ArrowUp size={9} /> };
  if (kind === 'short') return { label: 'SHORTEN', color: r, icon: <ArrowDown size={9} /> };
  return { label: 'GESCHLOSSEN', color: theme.accent, icon: <ArrowUpRight size={9} /> };
}

export default TradeHistory;
