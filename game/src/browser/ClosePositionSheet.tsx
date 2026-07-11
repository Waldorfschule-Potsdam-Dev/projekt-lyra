import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import type { Asset } from './TradeData';
import type { Theme } from './tradeTheme';
import { withAlpha } from './tradeTheme';
import type { Position } from './portfolio';
import { calcPL } from './portfolio';

interface ClosePositionSheetProps {
  open: boolean;
  onClose: () => void;
  positions: Position[];
  assets: Asset[];
  onClosePosition: (positionId: string) => boolean;
  theme: Theme;
}

function formatEUR(v: number): string {
  const sign = v < 0 ? '-' : '';
  return sign + '$' + Math.abs(v).toFixed(2).replace('.', ',');
}

function formatAmount(n: number): string {
  if (n >= 1) return n.toFixed(4);
  return n.toFixed(6);
}

export function ClosePositionSheet({ open, onClose, positions, assets, onClosePosition, theme }: ClosePositionSheetProps) {
  const assetById = useMemo(() => {
    const m = new Map<string, Asset>();
    assets.forEach(a => m.set(a.id, a));
    return m;
  }, [assets]);

  const rows = useMemo(() => {
    return positions
      .map(p => {
        const a = assetById.get(p.assetId);
        if (!a) return null;
        const pl = calcPL(p, a.price);
        const value = p.amount * a.price;
        return { pos: p, asset: a, pl, value };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.value - a.value);
  }, [positions, assetById]);

  const totalPL = rows.reduce((s, r) => s + r.pl, 0);
  const totalValue = rows.reduce((s, r) => s + r.value, 0);

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
              minHeight: '40%',
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
                <XCircle size={14} color={r} />
                <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.2, color: tp, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                  POSITION SCHLIESSEN
                </span>
                <span style={{
                  fontSize: 10, color: tt, fontFamily: 'monospace', fontWeight: 700,
                  background: withAlpha(r, 0.15),
                  padding: '1px 6px', borderRadius: 3,
                }}>
                  {rows.length}
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

            {rows.length > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 14px',
                background: be,
                borderBottom: '1px solid ' + bs,
                flexShrink: 0,
                fontSize: 10, fontFamily: 'monospace',
              }}>
                <span style={{ color: tt, fontWeight: 700, letterSpacing: 1 }}>SUMME</span>
                <span style={{ color: tp, fontWeight: 800 }}>{formatEUR(totalValue)}</span>
                <span style={{
                  color: totalPL >= 0 ? g : r, fontWeight: 800, fontSize: 12,
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                }}>
                  {totalPL >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {totalPL >= 0 ? '+' : ''}{formatEUR(totalPL)}
                </span>
              </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} className="hide-scrollbar">
              {rows.length === 0 ? (
                <div style={{
                  padding: '40px 16px', textAlign: 'center', color: tm,
                  fontSize: 12, fontFamily: 'monospace', letterSpacing: 0.5,
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>∅</div>
                  Keine offenen Positionen
                </div>
              ) : rows.map(({ pos, asset, pl, value }) => {
                const isLong = pos.direction === 'long';
                const dirColor = isLong ? g : r;
                return (
                  <div
                    key={pos.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 14px',
                      borderBottom: '1px solid ' + bs,
                      background: bp,
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 4,
                      background: withAlpha(dirColor, 0.15),
                      border: '1px solid ' + withAlpha(dirColor, 0.4),
                      color: dirColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, fontFamily: 'monospace',
                      flexShrink: 0,
                    }}>
                      {isLong ? '\u25B2' : '\u25BC'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: tp, fontFamily: 'monospace' }}>
                          {pos.symbol}
                        </span>
                        <span style={{ fontSize: 9, color: tt, fontFamily: 'monospace', letterSpacing: 0.5 }}>
                          {isLong ? 'LONG' : 'SHORT'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'monospace', color: tt }}>
                        <span style={{ color: theme.text.secondary }}>{formatAmount(pos.amount)}</span>
                        <span style={{ color: tm }}>·</span>
                        <span>
                          <span style={{ color: tm }}>@</span>
                          <span style={{ color: tp, fontWeight: 700 }}> {pos.entryPrice.toFixed(2)}</span>
                          <span style={{ color: tm, margin: '0 3px' }}>→</span>
                          <span style={{ color: tp, fontWeight: 700 }}>{asset.price.toFixed(2)}</span>
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: 11, fontWeight: 800, fontFamily: 'monospace',
                        color: pl >= 0 ? g : r,
                      }}>
                        {pl >= 0 ? '+' : ''}{formatEUR(pl)}
                      </div>
                      <div style={{ fontSize: 9, color: tm, fontFamily: 'monospace' }}>
                        = {formatEUR(value)}
                      </div>
                    </div>

                    <button
                      onClick={() => onClosePosition(pos.id)}
                      style={{
                        background: r, border: 'none', borderRadius: 4,
                        padding: '7px 10px',
                        color: theme.text.inverse,
                        fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
                        cursor: 'pointer', fontFamily: 'monospace',
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        flexShrink: 0,
                      }}
                    >
                      <X size={10} />
                      SCHLIESSEN
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ClosePositionSheet;
