import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getTheme, withAlpha } from './tradeTheme';
import { assets, formatPrice, formatPct, tickAsset, type Asset } from './TradeData';
import { TradeWatchlist } from './TradeWatchlist';
import { TradeChart } from './TradeChart';
import { TradePanel, type TradeFeedback } from './TradePanel';
import { TradeHistory } from './TradeHistory';
import { ClosePositionSheet } from './ClosePositionSheet';
import type { Position, Trade } from './portfolio';
import { calcFee } from './portfolio';

const STORAGE_KEY = 'escape-boersen-terminal-portfolio';
const STARTING_BALANCE = 100.67;
const MAX_HISTORY = 200;

function formatEUR(v: number): string {
  return '$' + v.toFixed(2).replace('.', ',');
}

interface PersistedPortfolio {
  cash: number;
  positions: Position[];
  trades: Trade[];
}

function loadPortfolio(): PersistedPortfolio {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { cash: STARTING_BALANCE, positions: [], trades: [] };
    const parsed = JSON.parse(raw) as Partial<PersistedPortfolio>;
    return {
      cash: typeof parsed.cash === 'number' ? parsed.cash : STARTING_BALANCE,
      positions: Array.isArray(parsed.positions) ? parsed.positions : [],
      trades: Array.isArray(parsed.trades) ? parsed.trades : [],
    };
  } catch {
    return { cash: STARTING_BALANCE, positions: [], trades: [] };
  }
}

export function TradePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const p1 = pathParts[2];
  const p2 = pathParts[3];
  const historyOpen = p2 === 'history' || p1 === 'history';
  const closeSheetOpen = p2 === 'close' || p1 === 'close';
  const selectedId = (p1 && p1 !== 'history' && p1 !== 'close') ? p1 : assets[0].id;

  const [assetsState, setAssetsState] = useState<Asset[]>(assets);
  const [mode, setMode] = useState<'dark' | 'light'>('dark');

  const [cash, setCash] = useState<number>(() => loadPortfolio().cash);
  const [positions, setPositions] = useState<Position[]>(() => loadPortfolio().positions);
  const [trades, setTrades] = useState<Trade[]>(() => loadPortfolio().trades);
  const [feedback, setFeedback] = useState<TradeFeedback | null>(null);
  const [showDoge, setShowDoge] = useState(false);
  const dogeTimer = useRef<number | null>(null);
  const feedbackTimer = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ cash, positions, trades }));
    } catch {
      /* storage unavailable */
    }
  }, [cash, positions, trades]);

  const recordTrade = (t: Omit<Trade, 'id' | 't'>) => {
    setTrades(prev => [
      { ...t, id: 'tr-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), t: Date.now() },
      ...prev,
    ].slice(0, MAX_HISTORY));
  };

  useEffect(() => () => {
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    if (dogeTimer.current) window.clearTimeout(dogeTimer.current);
  }, []);

  const showFeedback = useCallback((fb: TradeFeedback) => {
    setFeedback(fb);
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setFeedback(null), 2400);
  }, []);

  const triggerDoge = useCallback(() => {
    if (dogeTimer.current) window.clearTimeout(dogeTimer.current);
    setShowDoge(true);
    dogeTimer.current = window.setTimeout(() => setShowDoge(false), 3000);
  }, []);

  const theme = getTheme(mode);
  const selected = assetsState.find(a => a.id === selectedId) ?? assetsState[0];
  const isUp = selected.change >= 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setAssetsState(prev => prev.map(tickAsset));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const prevPriceRef = useRef<number>(selected.price);
  useEffect(() => {
    if (selected.price !== prevPriceRef.current) {
      setPriceFlash(selected.price > prevPriceRef.current ? 'up' : 'down');
      prevPriceRef.current = selected.price;
      const timer = setTimeout(() => setPriceFlash(null), 180);
      return () => clearTimeout(timer);
    }
  }, [selected.price]);

  const handleBuy = (dollarAmount: number) => {
    if (dollarAmount <= 0 || selected.price <= 0) return false;
    const total = dollarAmount;
    const fee = calcFee(total);
    if (total + fee > cash + 0.005) return false;
    const quantity = total / selected.price;
    setCash(c => +(c - total - fee).toFixed(2));
    const posId = selected.id + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    setPositions(prev => [...prev, {
      id: posId,
      assetId: selected.id,
      symbol: selected.symbol,
      direction: 'long',
      amount: quantity,
      entryPrice: selected.price,
      entryFee: fee,
    }]);
    recordTrade({
      kind: 'buy',
      assetId: selected.id,
      symbol: selected.symbol,
      direction: 'long',
      amount: quantity,
      price: selected.price,
      total,
      fee,
    });
    showFeedback({
      kind: 'expense',
      label: 'KAUFEN',
      symbol: selected.symbol,
      amount: total + fee,
      message: `Kosten inkl. ${formatEUR(fee)} Gebühr`,
    });
    if (selected.id === 'doge') triggerDoge();
    return true;
  };

  const handleShort = (dollarAmount: number) => {
    if (dollarAmount <= 0 || selected.price <= 0) return false;
    const total = dollarAmount;
    const fee = calcFee(total);
    if (total + fee > cash + 0.005) return false;
    const quantity = total / selected.price;
    setCash(c => +(c + total - fee).toFixed(2));
    const posId = selected.id + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    setPositions(prev => [...prev, {
      id: posId,
      assetId: selected.id,
      symbol: selected.symbol,
      direction: 'short',
      amount: quantity,
      entryPrice: selected.price,
      entryFee: fee,
    }]);
    recordTrade({
      kind: 'short',
      assetId: selected.id,
      symbol: selected.symbol,
      direction: 'short',
      amount: quantity,
      price: selected.price,
      total,
      fee,
    });
    showFeedback({
      kind: 'income',
      label: 'SHORTEN',
      symbol: selected.symbol,
      amount: total - fee,
      message: `Erlös abzgl. ${formatEUR(fee)} Gebühr`,
    });
    if (selected.id === 'doge') triggerDoge();
    return true;
  };

  const handleClose = (positionId: string) => {
    const pos = positions.find(p => p.id === positionId);
    if (!pos) return false;
    const posAsset = assetsState.find(a => a.id === pos.assetId);
    if (!posAsset) return false;
    const closeValue = pos.amount * posAsset.price;
    const closeFee = calcFee(closeValue);
    const pl = pos.direction === 'long'
      ? (posAsset.price - pos.entryPrice) * pos.amount
      : (pos.entryPrice - posAsset.price) * pos.amount;
    const netPl = +(pl - pos.entryFee - closeFee).toFixed(2);

    if (pos.direction === 'short' && closeValue + closeFee > cash + 0.005) {
      showFeedback({
        kind: 'error',
        label: 'SCHLIESSEN FEHLGESCHLAGEN',
        symbol: pos.symbol,
        amount: closeValue + closeFee - cash,
        message: 'Zu wenig Guthaben',
      });
      return false;
    }

    if (pos.direction === 'long') {
      setCash(c => +(c + closeValue - closeFee).toFixed(2));
    } else {
      setCash(c => +(c - closeValue - closeFee).toFixed(2));
    }
    setPositions(prev => prev.filter(p => p.id !== positionId));
    recordTrade({
      kind: 'close',
      assetId: pos.assetId,
      symbol: pos.symbol,
      direction: pos.direction,
      amount: pos.amount,
      price: posAsset.price,
      total: closeValue,
      fee: closeFee,
      pl,
      netPl,
      entryPrice: pos.entryPrice,
    });
    showFeedback({
      kind: netPl >= 0 ? 'income' : 'expense',
      label: 'POSITION GESCHLOSSEN',
      symbol: pos.symbol,
      amount: Math.abs(netPl),
      message: (netPl >= 0 ? '+$' : '-$') + Math.abs(netPl).toFixed(2).replace('.', ',') + ' Netto P/L' + ` (${formatEUR(closeFee + pos.entryFee)} Gebühr)`,
    });
    return true;
  };

  const handleReset = () => {
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    setCash(STARTING_BALANCE);
    setPositions([]);
    setTrades([]);
    setFeedback(null);
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.bg.page,
        color: theme.text.primary,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          background: theme.bg.page,
          borderBottom: '1px solid ' + theme.border.default,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 9, fontFamily: 'monospace', color: theme.text.tertiary, letterSpacing: 1,
          }}
        >
          <span style={{ color: theme.green }}>●</span>
          <span style={{ color: theme.green }}>LIVE</span>
        </div>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="#ffffff" />
            <polyline
              points="5,17 9,13 13,15 19,7"
              fill="none"
              stroke={theme.accent}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="15,7 19,7 19,11"
              fill="none"
              stroke={theme.accent}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontSize: 11, fontWeight: 800, color: theme.text.primary,
              letterSpacing: 1.5, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            BÖRSEN-TERMINAL
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={handleReset}
            aria-label="Portfolio zurücksetzen"
            title="Portfolio zurücksetzen"
            style={{
              background: theme.bg.panel,
              border: '1px solid ' + theme.border.default,
              borderRadius: 4, padding: 6,
              cursor: 'pointer', display: 'flex',
              color: theme.text.secondary,
              fontSize: 9, fontWeight: 700, letterSpacing: 1,
              fontFamily: 'monospace',
              alignItems: 'center',
            }}
          >
            RESET
          </button>
          <button
            onClick={() => setMode(m => m === 'dark' ? 'light' : 'dark')}
            aria-label={mode === 'dark' ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
            title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
            style={{
              background: theme.bg.panel,
              border: '1px solid ' + theme.border.default,
              borderRadius: 4, padding: 6,
              cursor: 'pointer', display: 'flex',
              color: theme.text.secondary,
            }}
          >
            {mode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>

      <div
        style={{
          flexShrink: 0, height: 200,
          borderBottom: '1px solid ' + theme.border.default,
          position: 'relative', zIndex: 2,
        }}
      >
        <TradeWatchlist
          assets={assetsState}
          selectedId={selectedId}
          onSelect={(id) => navigate(`/browser/boersen-terminal/${id}`)}
          onBack={() => navigate('/browser')}
          theme={theme}
        />
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: '8px 12px',
          borderBottom: '1px solid ' + theme.border.default,
          background: theme.bg.elevated,
          position: 'relative', zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{
                fontSize: 16, fontWeight: 800, color: theme.text.primary,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                letterSpacing: 1,
              }}>{selected.symbol}</span>
              {selected.type === 'crypto' && (
                <span style={{
                  fontSize: 9, color: theme.purple, background: withAlpha(theme.purple, 0.15),
                  padding: '1px 5px', borderRadius: 3, fontWeight: 700, letterSpacing: 1, fontFamily: 'monospace',
                }}>CRYPTO</span>
              )}
              {selected.type === 'stock' && (
                <span style={{
                  fontSize: 9, color: theme.accent, background: withAlpha(theme.accent, 0.15),
                  padding: '1px 5px', borderRadius: 3, fontWeight: 700, letterSpacing: 1, fontFamily: 'monospace',
                }}>AKTIE</span>
              )}
              {selected.type === 'commodity' && (
                <span style={{
                  fontSize: 9, color: theme.gold, background: withAlpha(theme.gold, 0.15),
                  padding: '1px 5px', borderRadius: 3, fontWeight: 700, letterSpacing: 1, fontFamily: 'monospace',
                }}>ROHSTOFF</span>
              )}
              <span style={{
                fontSize: 11, color: theme.text.secondary,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>· {selected.name}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 17, fontWeight: 800,
              color: priceFlash === 'up' ? theme.green : priceFlash === 'down' ? theme.red : theme.text.primary,
              fontFamily: 'monospace', letterSpacing: 0.5,
              transition: 'color 0.25s ease-out',
              textShadow: priceFlash === 'up'
                ? '0 0 10px ' + withAlpha(theme.green, 0.6)
                : priceFlash === 'down'
                ? '0 0 10px ' + withAlpha(theme.red, 0.6)
                : 'none',
            }}>
              {formatPrice(selected.price, selected.type)}
            </div>
            <div style={{
              fontSize: 11, fontWeight: 700,
              color: isUp ? theme.green : theme.red,
              fontFamily: 'monospace', transition: 'color 0.25s ease-out',
            }}>
              {formatPct(selected.changePct)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flexShrink: 0, position: 'relative', zIndex: 2 }}>
        <TradePanel
          key={selected.id}
          asset={selected}
          theme={theme}
          cash={cash}
          positions={positions}
          tradeCount={trades.length}
          feedback={feedback}
          onBuy={handleBuy}
          onShort={handleShort}
          onClose={handleClose}
          onOpenHistory={() => navigate(`/browser/boersen-terminal/${selectedId}/history`)}
          onOpenCloseSheet={() => navigate(`/browser/boersen-terminal/${selectedId}/close`)}
        />
      </div>

      <div style={{ flex: 1, minHeight: 0, position: 'relative', zIndex: 2 }}>
        <TradeChart
          data={selected.history}
          color={isUp ? theme.green : theme.red}
          type={selected.type}
          theme={theme}
        />
      </div>

      <TradeHistory
        open={historyOpen}
        onClose={() => navigate(`/browser/boersen-terminal/${selectedId}`)}
        trades={trades}
        theme={theme}
      />

      <ClosePositionSheet
        open={closeSheetOpen}
        onClose={() => navigate(`/browser/boersen-terminal/${selectedId}`)}
        positions={positions}
        assets={assetsState}
        onClosePosition={handleClose}
        theme={theme}
      />

      <AnimatePresence>
        {showDoge && (
          <motion.div
            key="doge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 9000,
              background: 'radial-gradient(circle, rgba(194,166,51,0.18) 0%, rgba(0,0,0,0) 70%)',
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: [0, 1.6, 1.1, 1.25, 1.05, 1.1], rotate: [-180, 20, -10, 10, -5, 0] }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 2.6, times: [0, 0.25, 0.45, 0.6, 0.8, 1] }}
              style={{ filter: 'drop-shadow(0 0 30px rgba(194,166,51,0.7))' }}
            >
              <svg viewBox="0 0 200 200" width="180" height="180" aria-hidden="true">
                <ellipse cx="100" cy="115" rx="75" ry="68" fill="#e0a868" />
                <path d="M 50 88 L 32 32 L 80 60 Z" fill="#c08850" />
                <path d="M 150 88 L 168 32 L 120 60 Z" fill="#c08850" />
                <path d="M 55 82 L 45 45 L 73 62 Z" fill="#f0c896" />
                <path d="M 145 82 L 155 45 L 127 62 Z" fill="#f0c896" />
                <ellipse cx="100" cy="140" rx="40" ry="28" fill="#fdf6e3" />
                <circle cx="72" cy="100" r="6" fill="#1a1a1a" />
                <circle cx="128" cy="100" r="6" fill="#1a1a1a" />
                <circle cx="74" cy="98" r="2" fill="#fff" />
                <circle cx="130" cy="98" r="2" fill="#fff" />
                <ellipse cx="100" cy="128" rx="8" ry="5" fill="#1a1a1a" />
                <path d="M 92 144 Q 100 152 108 144" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <ellipse cx="100" cy="150" rx="5" ry="4" fill="#ff7a8a" />
              </svg>
            </motion.div>
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ delay: 0.35, duration: 0.4, type: 'spring', stiffness: 220 }}
              style={{
                fontSize: 34, fontWeight: 900, color: '#c2a633',
                textShadow: '0 0 18px rgba(194,166,51,0.9), 0 3px 6px rgba(0,0,0,0.8)',
                fontFamily: 'Impact, "Arial Black", sans-serif',
                letterSpacing: 3, marginTop: 12,
              }}
            >
              TO THE MOON! 🌙
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              style={{
                fontSize: 13, color: '#fdf6e3',
                fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                marginTop: 6, textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                letterSpacing: 1,
              }}
            >
              much coin · very buy · wow
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TradePage;
