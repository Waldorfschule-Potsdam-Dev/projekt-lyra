import { useState, useRef, useEffect } from 'react';
import { Rocket, Flame, TrendingUp, Zap, HandCoins } from 'lucide-react';
import { casinoTheme, casinoGlobalCss } from './CasinoTheme';
import { formatMoney, type CasinoStats, type CasinoGameState, getStreakLabel } from './CasinoBank';
import { casinoSound } from './casinoSounds';
import { BetPicker } from './CasinoBetPicker';

interface CasinoCrashProps {
  balance: number;
  onBet: (amount: number) => boolean;
  onResult: (payout: number, wagered: number) => void;
  stats: CasinoStats;
  gameState: CasinoGameState;
  updateGameState: (updater: (s: CasinoGameState) => CasinoGameState) => void;
  updateStats: (updater: (s: CasinoStats) => CasinoStats) => void;
}

interface RoundHistory { multiplier: number; key: number; }

function generateCrashPoint(): number {
  const r = Math.random();
  if (r < 0.04) return 1.0;
  const e = -Math.log(1 - r) * 0.45;
  return Math.max(1.0, Math.min(120, 1 + e));
}

export function CasinoCrash({ balance, onBet, onResult, stats, gameState, updateGameState, updateStats }: CasinoCrashProps) {
  const bet = gameState.crashBet;
  const autoCashoutAt = gameState.crashAutoCashout;
  const [phase, setPhase] = useState<'idle' | 'flying' | 'crashed' | 'cashed'>('idle');
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [currentBet, setCurrentBet] = useState(0);
  const [cashoutAt, setCashoutAt] = useState<number | null>(null);
  const [history, setHistory] = useState<RoundHistory[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [lastWin, setLastWin] = useState<{ amount: number; multiplier: number; key: number } | null>(null);
  const [showLightning, setShowLightning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [bigWin, setBigWin] = useState<{ amount: number; key: number } | null>(null);
  const startTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const autoTriggeredRef = useRef(false);
  const crashAtRef = useRef<number>(0);

  const setBet = (v: number) => updateGameState(s => ({ ...s, crashBet: v }));
  const setAuto = (v: number) => updateGameState(s => ({ ...s, crashAutoCashout: v }));

  useEffect(() => {
    const t = window.setTimeout(() => startRound(), 1500);
    return () => { window.clearTimeout(t); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRound = () => {
    const crash = generateCrashPoint();
    crashAtRef.current = crash;
    setCrashPoint(crash);
    setPhase('flying');
    setMultiplier(1.0);
    setCashoutAt(null);
    setLastWin(null);
    setShowConfetti(false);
    setBigWin(null);
    autoTriggeredRef.current = false;
    startTimeRef.current = performance.now();

    const loop = (ts: number) => {
      const elapsed = (ts - startTimeRef.current) / 1000;
      const m = Math.pow(1.06, elapsed * 6);
      if (m >= crash) {
        setMultiplier(crash);
        crashRound(crash);
        return;
      }
      setMultiplier(m);
      if (currentBet > 0 && !autoTriggeredRef.current && m >= autoCashoutAt && autoCashoutAt > 1) {
        autoTriggeredRef.current = true;
        doCashout(m);
        return;
      }
      if (m < 1.02) casinoSound.crashTick();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  const crashRound = (at: number) => {
    setPhase('crashed');
    setMultiplier(at);
    casinoSound.crashBoom();
    if (currentBet > 0 && cashoutAt === null) {
      onResult(0, currentBet);
      updateStats(s => ({
        ...s,
        crash: { ...s.crash, rounds: s.crash.rounds + 1, crashes: s.crash.crashes + 1 },
      }));
    }
    setHistory(h => [{ multiplier: at, key: Date.now() }, ...h].slice(0, 12));
    updateStats(s => ({
      ...s,
      crash: { ...s.crash, bestMultiplier: Math.max(s.crash.bestMultiplier, at) },
    }));
    setCurrentBet(0);
    const t = window.setTimeout(() => startRound(), 2200);
    return () => window.clearTimeout(t);
  };

  const doCashout = (at?: number) => {
    if (phase !== 'flying' || currentBet === 0 || cashoutAt !== null) return;
    const m = at ?? multiplier;
    setCashoutAt(m);
    setPhase('cashed');
    const payout = currentBet * m;
    onResult(payout, currentBet);
    const profit = payout - currentBet;
    setLastWin({ amount: profit, multiplier: m, key: Date.now() });
    updateStats(s => ({
      ...s,
      crash: {
        ...s.crash,
        rounds: s.crash.rounds + 1,
        cashouts: s.crash.cashouts + 1,
        bestMultiplier: Math.max(s.crash.bestMultiplier, m),
        biggestWin: Math.max(s.crash.biggestWin, profit),
        totalCashed: s.crash.totalCashed + payout,
      },
    }));
    casinoSound.crashCashout();
    if (m >= 5) {
      setBigWin({ amount: profit, key: Date.now() });
      setShowConfetti(true);
      setShowLightning(true);
      window.setTimeout(() => { setShowConfetti(false); setShowLightning(false); }, 3500);
    }
    setCurrentBet(0);
  };

  const placeBet = () => {
    if (phase !== 'idle' || currentBet > 0) return;
    if (bet <= 0 || bet > balance) return;
    if (!onBet(bet)) return;
    setCurrentBet(bet);
  };

  const skipWait = () => {
    if (phase === 'flying' && crashAtRef.current > 0) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      crashRound(crashAtRef.current);
    }
  };

  const streakLabel = getStreakLabel(stats.currentStreak);
  const mColor = multiplier >= 5 ? '#ff6b00' : multiplier >= 2 ? casinoTheme.accent.goldHi : casinoTheme.accent.green;
  const mShadow = multiplier >= 5 ? '0 0 24px #ff6b00, 0 0 48px #ffaa00' : `0 0 16px ${mColor}`;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 12, padding: 12,
      position: 'relative',
    }}>
      <style>{casinoGlobalCss}</style>

      {showLightning && (
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 95,
          background: 'rgba(255,255,255,0.6)',
          animation: 'lightning 0.6s ease-out',
        }} />
      )}

      {showConfetti && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
          {Array.from({ length: 100 }).map((_, i) => {
            const colors = ['#d4af37', '#f0c850', '#22c55e', '#dc2626', '#3b82f6', '#fff', '#ffaa00', '#ff6b00'];
            const c = colors[i % colors.length];
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${(i * 7) % 100}%`,
                  width: 10, height: 14,
                  background: c,
                  animation: `confetti-fall ${2.5 + (i % 4) * 0.4}s ease-out ${(i % 8) * 0.1}s forwards`,
                  ['--cx' as string]: `${((i * 23) % 100) - 50}px`,
                  ['--cr' as string]: `${(i % 5) * 360}deg`,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      )}

      {bigWin && (
        <div style={{
          position: 'fixed', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 90, pointerEvents: 'none',
        }}>
          <div style={{
            padding: '24px 36px',
            background: 'linear-gradient(135deg, #1a0f08 0%, #0a0604 100%)',
            border: `3px solid #ff6b00`,
            borderRadius: 20,
            textAlign: 'center',
            boxShadow: `0 0 60px #ff6b00, 0 0 120px #ffaa00`,
            animation: 'jackpot-text 0.8s ease-out',
          }}>
            <div style={{
              fontSize: 14, color: '#ffaa00',
              fontFamily: casinoTheme.font.mono, letterSpacing: 4,
              textTransform: 'uppercase',
            }}>
              ★ To The Moon ★
            </div>
            <div style={{
              fontSize: 48, fontWeight: 800,
              color: '#ffaa00',
              fontFamily: casinoTheme.font.display,
              marginTop: 4,
              textShadow: '0 0 16px #ff6b00, 0 0 32px #ffaa00',
            }}>
              +{formatMoney(bigWin.amount)}
            </div>
          </div>
        </div>
      )}

      {streakLabel && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '4px 10px',
          background: `${streakLabel.color}22`,
          border: `1px solid ${streakLabel.color}66`,
          borderRadius: 9999,
          color: streakLabel.color,
          fontSize: 10, fontWeight: 800,
          fontFamily: casinoTheme.font.mono,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          animation: 'fire-glow 0.8s ease-in-out infinite',
        }}>
          <Flame size={12} /> {streakLabel.label} · {stats.currentStreak}× <Flame size={12} />
        </div>
      )}

      <div style={{
        textAlign: 'center',
        fontSize: 11,
        color: casinoTheme.text.tertiary,
        fontFamily: casinoTheme.font.mono,
        letterSpacing: 2,
        textTransform: 'uppercase',
      }}>
        Cashout bevor die Rakete crasht
      </div>

      <div
        onClick={skipWait}
        style={{
          position: 'relative',
          height: 240,
          background: 'linear-gradient(180deg, #0a0e2a 0%, #1a0e3a 50%, #2a0e2e 100%)',
          border: `3px solid ${phase === 'crashed' ? casinoTheme.accent.red : phase === 'cashed' ? casinoTheme.accent.green : casinoTheme.accent.gold}`,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: phase === 'flying'
            ? `0 0 30px ${mColor}88, inset 0 0 30px rgba(0,0,0,0.5)`
            : 'inset 0 0 30px rgba(0,0,0,0.5)',
          transition: 'box-shadow 0.3s',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(${mColor}22 1px, transparent 1px),
            linear-gradient(90deg, ${mColor}22 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          transform: 'perspective(400px) rotateX(60deg) translateY(50%)',
          transformOrigin: 'center bottom',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 40%, black 80%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {phase === 'flying' && (
          <div style={{
            position: 'absolute',
            left: `${Math.min(95, (multiplier - 1) * 30)}%`,
            bottom: `${Math.min(90, 20 + (multiplier - 1) * 35)}%`,
            transform: 'translate(-50%, 50%)',
            fontSize: 48,
            transition: 'left 0.1s linear, bottom 0.1s linear',
            zIndex: 5,
            filter: `drop-shadow(0 0 12px ${mColor})`,
            animation: multiplier >= 5 ? 'mega-pulse 0.4s ease-in-out infinite' : 'none',
          }}>
            🚀
          </div>
        )}

        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 4,
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: phase === 'crashed' ? 56 : 72, fontWeight: 800,
            color: phase === 'crashed' ? casinoTheme.accent.red : mColor,
            fontFamily: casinoTheme.font.display,
            textShadow: phase === 'crashed' ? '0 0 20px rgba(239,68,68,0.8)' : mShadow,
            animation: phase === 'crashed' ? 'screen-shake 0.4s ease-out' : phase === 'flying' ? 'none' : 'none',
            letterSpacing: -2,
          }}>
            {multiplier.toFixed(2)}x
          </div>
          {phase === 'crashed' && (
            <div style={{
              fontSize: 16, color: casinoTheme.accent.red, fontWeight: 800,
              fontFamily: casinoTheme.font.mono, letterSpacing: 2,
              textTransform: 'uppercase',
            }}>
              💥 Crashed
            </div>
          )}
          {phase === 'cashed' && lastWin && (
            <div style={{
              fontSize: 16, color: casinoTheme.accent.green, fontWeight: 800,
              fontFamily: casinoTheme.font.mono, letterSpacing: 1,
              animation: 'win-zoom 0.5s ease-out',
            }}>
              +{formatMoney(lastWin.amount)} @ {lastWin.multiplier.toFixed(2)}x
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div style={{
          display: 'flex', gap: 4, overflowX: 'auto', padding: 4,
        }} className="casino-scroll">
          {history.map((h, i) => {
            const high = h.multiplier >= 5;
            const mid = h.multiplier >= 2;
            return (
              <div
                key={h.key}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: high ? 'rgba(255,107,0,0.15)' : mid ? 'rgba(212,175,55,0.15)' : 'rgba(239,68,68,0.12)',
                  border: `1px solid ${high ? '#ff6b00' : mid ? casinoTheme.accent.gold : casinoTheme.accent.red}66`,
                  fontSize: 11, fontWeight: 800,
                  color: high ? '#ffaa00' : mid ? casinoTheme.accent.goldHi : casinoTheme.accent.red,
                  fontFamily: casinoTheme.font.mono,
                  flexShrink: 0,
                  minWidth: 50, textAlign: 'center',
                }}
              >
                {h.multiplier.toFixed(2)}x
              </div>
            );
          })}
        </div>
      )}

      <div style={{
        padding: 10,
        background: casinoTheme.bg.panel,
        border: `1px solid ${casinoTheme.border.subtle}`,
        borderRadius: 8,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: casinoTheme.font.mono, fontSize: 12,
      }}>
        <span style={{ color: casinoTheme.text.secondary, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Zap size={12} /> Auto-Cashout
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[1.5, 2, 3, 5, 10].map(v => (
            <button
              key={v}
              onClick={() => { casinoSound.click(); setAuto(v); }}
              style={{
                padding: '4px 8px',
                border: `1px solid ${autoCashoutAt === v ? casinoTheme.accent.gold : casinoTheme.border.default}`,
                borderRadius: 6,
                background: autoCashoutAt === v ? casinoTheme.accent.goldSoft : 'transparent',
                color: autoCashoutAt === v ? casinoTheme.accent.goldHi : casinoTheme.text.primary,
                fontSize: 11, fontWeight: 700,
                cursor: 'pointer',
                fontFamily: casinoTheme.font.mono,
              }}
            >
              {v}x
            </button>
          ))}
        </div>
      </div>

      <BetPicker
        label="Einsatz"
        value={bet}
        max={balance}
        disabled={phase === 'flying' || currentBet > 0}
        onChange={setBet}
        onSound={casinoSound.click}
        onAllIn={() => { casinoSound.allIn(); setBet(balance); }}
      />

      {phase === 'flying' && currentBet > 0 ? (
        <button
          onClick={() => doCashout()}
          style={{
            width: '100%',
            padding: '18px 0',
            border: `3px solid ${casinoTheme.accent.green}`,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${casinoTheme.accent.green} 0%, #16a34a 100%)`,
            color: '#fff',
            fontSize: 18, fontWeight: 800,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: casinoTheme.font.system,
            boxShadow: `0 0 20px ${casinoTheme.accent.green}88`,
            animation: 'mega-pulse 0.8s ease-in-out infinite',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <HandCoins size={20} /> Cashout · {formatMoney(currentBet * multiplier)}
        </button>
      ) : (
        <button
          onClick={placeBet}
          disabled={bet <= 0 || bet > balance || currentBet > 0}
          style={{
            width: '100%',
            padding: '16px 0',
            border: 'none',
            borderRadius: 12,
            background: (bet <= 0 || bet > balance || currentBet > 0)
              ? casinoTheme.bg.panelHi
              : `linear-gradient(135deg, ${casinoTheme.accent.gold} 0%, ${casinoTheme.accent.goldHi} 100%)`,
            color: (bet <= 0 || bet > balance || currentBet > 0) ? casinoTheme.text.tertiary : casinoTheme.text.inverse,
            fontSize: 16, fontWeight: 800,
            letterSpacing: 2,
            textTransform: 'uppercase',
            cursor: (bet <= 0 || bet > balance || currentBet > 0) ? 'not-allowed' : 'pointer',
            fontFamily: casinoTheme.font.system,
            boxShadow: casinoTheme.shadow.gold,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Rocket size={18} /> {currentBet > 0 ? 'Bereit' : `Starten · ${formatMoney(bet)}`}
        </button>
      )}

      {stats.crash.rounds > 0 && (
        <div style={{
          padding: 10,
          background: casinoTheme.bg.panel,
          border: `1px solid ${casinoTheme.border.subtle}`,
          borderRadius: 8,
          fontFamily: casinoTheme.font.mono, fontSize: 11,
        }}>
          <div style={{
            fontSize: 10, color: casinoTheme.text.tertiary,
            letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6,
          }}>
            Crash · {stats.crash.rounds} Runden
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: casinoTheme.text.secondary }}>Cashouts</span>
            <span style={{ color: casinoTheme.accent.green }}>{stats.crash.cashouts}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: casinoTheme.text.secondary }}>Crashes</span>
            <span style={{ color: casinoTheme.accent.red }}>{stats.crash.crashes}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: casinoTheme.text.secondary }}>Top-Multi</span>
            <span style={{ color: casinoTheme.accent.goldHi, fontWeight: 700 }}>{stats.crash.bestMultiplier.toFixed(2)}x</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: casinoTheme.text.secondary }}>Top-Gewinn</span>
            <span style={{ color: casinoTheme.accent.goldHi, fontWeight: 700 }}>{formatMoney(stats.crash.biggestWin)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
