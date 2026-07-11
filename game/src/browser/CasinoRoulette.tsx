import { useState, useRef, useEffect, useMemo } from 'react';
import { Flame, Heart, Skull } from 'lucide-react';
import { casinoTheme, casinoGlobalCss } from './CasinoTheme';
import { formatMoney, type CasinoStats, type CasinoGameState, calcHotNumbers, getStreakLabel } from './CasinoBank';
import { casinoSound } from './casinoSounds';
import { BetPicker } from './CasinoBetPicker';

interface CasinoRouletteProps {
  balance: number;
  onBet: (amount: number) => boolean;
  onResult: (payout: number, wagered: number) => void;
  stats: CasinoStats;
  gameState: CasinoGameState;
  updateGameState: (updater: (s: CasinoGameState) => CasinoGameState) => void;
  updateStats: (updater: (s: CasinoStats) => CasinoStats) => void;
  nearMiss: number | null;
}

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

const WHEEL_ORDER: number[] = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const SEGMENT_ANGLE = 360 / WHEEL_ORDER.length;

function isRed(n: number): boolean { return RED_NUMBERS.has(n); }
function getColor(n: number): 'red' | 'black' | 'green' {
  if (n === 0) return 'green';
  return isRed(n) ? 'red' : 'black';
}
function getPocketColor(n: number): string {
  const c = getColor(n);
  if (c === 'red') return '#b91c1c';
  if (c === 'black') return '#0a0a0a';
  return '#15803d';
}

const WHEEL_RADIUS = 110;
const POCKET_RADIUS_INNER = 32;
const POCKET_RADIUS_OUTER = 92;

interface PocketPos { n: number; color: string; midAngle: number; x: number; y: number; }

function buildPocketPositions(): PocketPos[] {
  return WHEEL_ORDER.map((n, i) => {
    const midAngle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const rad = (midAngle - 90) * Math.PI / 180;
    const r = (POCKET_RADIUS_INNER + POCKET_RADIUS_OUTER) / 2;
    return {
      n, color: getPocketColor(n), midAngle,
      x: 50 + Math.cos(rad) * r * 100 / WHEEL_RADIUS / 2,
      y: 50 + Math.sin(rad) * r * 100 / WHEEL_RADIUS / 2,
    };
  });
}
const POCKETS = buildPocketPositions();
const DEFLECTORS = 8;

function buildWheelGradient(): string {
  const stops: string[] = [];
  WHEEL_ORDER.forEach((n, i) => {
    const start = i * SEGMENT_ANGLE;
    const end = (i + 1) * SEGMENT_ANGLE;
    stops.push(`${getPocketColor(n)} ${start}deg ${end}deg`);
  });
  return `conic-gradient(from -${SEGMENT_ANGLE / 2}deg, ${stops.join(', ')})`;
}

interface BigWinEvent { amount: number; key: number; isJackpot: boolean; }

export function CasinoRoulette({ balance, onBet, onResult, stats, gameState, updateGameState, updateStats, nearMiss }: CasinoRouletteProps) {
  const chip = gameState.rouletteChip;
  const bets = gameState.rouletteBets as { type: string; amount: number }[];
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ number: number; color: 'red' | 'black' | 'green'; totalPayout: number; net: number } | null>(null);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [ballAngle, setBallAngle] = useState(0);
  const [ballPhase, setBallPhase] = useState<'outer' | 'inner' | 'settled'>('outer');
  const [showConfetti, setShowConfetti] = useState(false);
  const [bigWin, setBigWin] = useState<BigWinEvent | null>(null);
  const [shake, setShake] = useState(false);
  const [showLightning, setShowLightning] = useState(false);
  const tickIntervalRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const totalWagered = bets.reduce((s, b) => s + b.amount, 0);

  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) {
        window.clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
  }, []);

  const setChip = (v: number) => {
    if (spinning) return;
    if (v < 1) return;
    updateGameState(s => ({ ...s, rouletteChip: v }));
    casinoSound.click();
  };

  const placeBet = (type: 'red' | 'black') => {
    if (spinning) return;
    if (chip > balance) return;
    if (chip <= 0) return;
    if (!onBet(chip)) return;
    updateGameState(s => ({ ...s, rouletteBets: [...s.rouletteBets, { type, amount: chip }] }));
    casinoSound.chipPlace();
  };

  const clearBets = () => {
    if (spinning) return;
    if (bets.length === 0) return;
    const refund = bets.reduce((s, b) => s + b.amount, 0);
    onResult(refund, 0);
    updateGameState(s => ({ ...s, rouletteBets: [] }));
    casinoSound.click();
  };

  const spin = () => {
    if (spinning) return;
    if (bets.length === 0) return;
    setSpinning(true);
    setResult(null);
    setShowConfetti(false);
    setBigWin(null);
    setBallPhase('outer');

    const winningNumber = Math.floor(Math.random() * 37);
    const winningIndex = WHEEL_ORDER.indexOf(winningNumber);

    const fullWheelSpins = 6;
    const finalWheelAngle = wheelAngle + fullWheelSpins * 360 - winningIndex * SEGMENT_ANGLE - SEGMENT_ANGLE / 2;
    setWheelAngle(finalWheelAngle);

    const fullBallSpins = 9;
    const finalBallAngle = ballAngle + fullBallSpins * 360 - winningIndex * SEGMENT_ANGLE - SEGMENT_ANGLE / 2;
    setBallAngle(finalBallAngle);

    casinoSound.rouletteSpin();

    let tickTime = 0;
    lastTickRef.current = 0;
    if (tickIntervalRef.current) window.clearInterval(tickIntervalRef.current);
    tickIntervalRef.current = window.setInterval(() => {
      tickTime += 60;
      if (tickTime > 4000) {
        if (tickIntervalRef.current) {
          window.clearInterval(tickIntervalRef.current);
          tickIntervalRef.current = null;
        }
        return;
      }
      const progress = tickTime / 4000;
      if (Math.random() < 1 - progress * 0.85) {
        if (tickTime - lastTickRef.current > 90) {
          casinoSound.rouletteBallTick();
          lastTickRef.current = tickTime;
        }
      }
      if (tickTime === 2400) setBallPhase('inner');
      if (tickTime === 3600) setBallPhase('settled');
    }, 60);

    window.setTimeout(() => {
      const totalPayout = bets.reduce((s, b) => {
        if (b.type === 'red' && getColor(winningNumber) === 'red') return s + b.amount * 2;
        if (b.type === 'black' && getColor(winningNumber) === 'black') return s + b.amount * 2;
        return s;
      }, 0);
      const net = totalPayout - totalWagered;
      const color = getColor(winningNumber);
      if (totalPayout > 0) {
        onResult(totalPayout, 0);
        if (net >= 500) {
          casinoSound.jackpot();
          setBigWin({ amount: net, key: Date.now(), isJackpot: true });
          setShowConfetti(true);
          setShowLightning(true);
          window.setTimeout(() => { setShowConfetti(false); setShowLightning(false); }, 4000);
        } else if (net >= 100) {
          casinoSound.bigWin();
          setBigWin({ amount: net, key: Date.now(), isJackpot: false });
          setShowConfetti(true);
          window.setTimeout(() => setShowConfetti(false), 3000);
        } else {
          casinoSound.rouletteWin();
        }
      } else {
        casinoSound.rouletteLose();
        setShake(true);
        window.setTimeout(() => setShake(false), 400);
      }
      setResult({ number: winningNumber, color, totalPayout, net });
      updateStats(s => {
        const lastNumbers = [winningNumber, ...s.roulette.lastNumbers].slice(0, 30);
        return {
          ...s,
          roulette: {
            ...s.roulette,
            spins: s.roulette.spins + 1,
            lastNumbers,
            redHits: s.roulette.redHits + (color === 'red' ? 1 : 0),
            blackHits: s.roulette.blackHits + (color === 'black' ? 1 : 0),
            greenHits: s.roulette.greenHits + (color === 'green' ? 1 : 0),
            biggestPayout: Math.max(s.roulette.biggestPayout, net),
          },
        };
      });
      updateGameState(s => ({ ...s, rouletteBets: [] }));
      setSpinning(false);
    }, 4000);
  };

  const betsByType = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const b of bets) acc[b.type] = (acc[b.type] || 0) + b.amount;
    return acc;
  }, [bets]);

  const wheelGradient = buildWheelGradient();
  const winNumber = result?.number;
  const lastNumbers = stats.roulette.lastNumbers;
  const reds = stats.roulette.redHits;
  const blacks = stats.roulette.blackHits;
  const greens = stats.roulette.greenHits;
  const colorTotal = Math.max(1, reds + blacks + greens);
  const hot = calcHotNumbers(stats);

  const ballRadius = ballPhase === 'outer' ? 100 : ballPhase === 'inner' ? 70 : 62;
  const streakLabel = getStreakLabel(stats.currentStreak);

  const redBet = betsByType['red'] || 0;
  const blackBet = betsByType['black'] || 0;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 12, padding: 12,
      position: 'relative',
      animation: shake ? 'screen-shake 0.4s ease-out' : 'none',
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
          {Array.from({ length: 80 }).map((_, i) => {
            const colors = ['#d4af37', '#f0c850', '#22c55e', '#dc2626', '#3b82f6', '#fff', '#ffaa00'];
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

      {bigWin && !spinning && (
        <div style={{
          position: 'fixed', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 90, pointerEvents: 'none',
        }}>
          <div style={{
            padding: '24px 36px',
            background: 'linear-gradient(135deg, #1a0f08 0%, #0a0604 100%)',
            border: `3px solid ${casinoTheme.accent.goldHi}`,
            borderRadius: 20,
            textAlign: 'center',
            boxShadow: `0 0 60px ${casinoTheme.accent.goldHi}, 0 0 120px ${casinoTheme.accent.gold}`,
            animation: 'jackpot-text 0.8s ease-out',
          }}>
            <div style={{
              fontSize: 14, color: casinoTheme.accent.goldHi,
              fontFamily: casinoTheme.font.mono, letterSpacing: 4,
              textTransform: 'uppercase',
            }}>
              {bigWin.isJackpot ? '★ Jackpot ★' : '★ Big Win ★'}
            </div>
            <div style={{
              fontSize: 48, fontWeight: 800,
              color: casinoTheme.accent.goldHi,
              fontFamily: casinoTheme.font.display,
              marginTop: 4,
              textShadow: `0 0 16px ${casinoTheme.accent.goldHi}, 0 0 32px ${casinoTheme.accent.gold}`,
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
        Europäisches Roulette · Nur Rot / Schwarz
      </div>

      <div style={{
        position: 'relative',
        height: 240,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        perspective: 800,
      }}>
        <div style={{
          position: 'absolute',
          width: 224, height: 224,
          borderRadius: '50%',
          background: 'repeating-conic-gradient(from 0deg, #3d2817 0deg 8deg, #5a3a1f 8deg 16deg)',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.6)',
          border: '4px solid #2a1810',
        }} />

        <div style={{
          position: 'absolute',
          width: 212, height: 212,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${casinoTheme.accent.gold} 0%, ${casinoTheme.accent.goldHi} 50%, ${casinoTheme.accent.gold} 100%)`,
          boxShadow: 'inset 0 0 12px rgba(0,0,0,0.4), 0 0 16px rgba(212,175,55,0.4)',
        }} />

        <div style={{
          position: 'absolute',
          width: 194, height: 194,
          borderRadius: '50%',
          background: '#0a0604',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.9)',
        }} />

        <div style={{
          position: 'absolute',
          width: 184, height: 184,
          borderRadius: '50%',
          transform: `rotate(${wheelAngle}deg)`,
          transition: spinning ? 'transform 4s cubic-bezier(0.12, 0.02, 0.18, 1)' : 'none',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            background: wheelGradient,
            boxShadow: 'inset 0 0 16px rgba(0,0,0,0.6)',
          }} />
          {POCKETS.map((p, i) => {
            const isWin = winNumber === p.n && !spinning;
            const isNearMiss = nearMiss === p.n && !spinning;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: 8,
                  fontWeight: 800,
                  color: isWin ? casinoTheme.accent.goldHi : '#fff',
                  textShadow: isWin
                    ? `0 0 4px #f0c850, 0 0 8px #f0c850, 0 0 12px #d4af37, 0 0 16px #d4af37`
                    : isNearMiss
                      ? `0 0 3px #ff6b00, 0 0 6px #ff6b00`
                      : '0 1px 2px rgba(0,0,0,0.9)',
                  fontFamily: 'Georgia, serif',
                  pointerEvents: 'none',
                  transition: 'all 0.3s',
                  zIndex: isWin ? 5 : 1,
                  animation: isWin ? 'neon-pulse 0.8s ease-in-out infinite' : isNearMiss ? 'heat-flicker 0.4s ease-in-out infinite' : 'none',
                }}
              >
                {p.n}
              </div>
            );
          })}
        </div>

        {Array.from({ length: DEFLECTORS }).map((_, i) => {
          const angle = (i / DEFLECTORS) * 360;
          const rad = (angle - 90) * Math.PI / 180;
          const r = 96 / WHEEL_RADIUS * 100;
          const x = 50 + Math.cos(rad) * r;
          const y = 50 + Math.sin(rad) * r;
          return (
            <div key={`def-${i}`} style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: 5, height: 5,
              marginLeft: -2.5, marginTop: -2.5,
              transform: 'rotate(45deg)',
              background: 'linear-gradient(135deg, #f5f5f5 0%, #b8b8b8 100%)',
              boxShadow: '0 0 4px rgba(255,255,255,0.4), inset 0 0 2px rgba(0,0,0,0.4)',
              pointerEvents: 'none',
              zIndex: 2,
            }} />
          );
        })}

        <div style={{
          position: 'absolute',
          width: 26, height: 26,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${casinoTheme.accent.goldHi} 0%, ${casinoTheme.accent.gold} 50%, #6b4f1a 100%)`,
          border: '2px solid #3a2a0a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800,
          color: casinoTheme.text.inverse,
          fontFamily: casinoTheme.font.mono,
          boxShadow: '0 0 8px rgba(212,175,55,0.8), inset 0 0 4px rgba(0,0,0,0.4)',
          zIndex: 3,
        }}>
          ✦
        </div>

        <div style={{
          position: 'absolute',
          width: `${ballRadius * 2}%`,
          height: `${ballRadius * 2}%`,
          maxWidth: 210, maxHeight: 210,
          borderRadius: '50%',
          transform: `rotate(${ballAngle}deg)`,
          transition: spinning
            ? ballPhase === 'outer'
              ? 'transform 2.4s cubic-bezier(0.3, 0.05, 0.4, 1)'
              : ballPhase === 'inner'
                ? 'transform 1.2s cubic-bezier(0.1, 0.4, 0.2, 1)'
                : 'transform 0.4s ease-out'
            : 'none',
          pointerEvents: 'none',
          zIndex: 4,
        }}>
          <div style={{
            position: 'absolute',
            top: ballPhase === 'outer' ? '2%' : '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 10, height: 10,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #e0e0e0 50%, #888 100%)',
            boxShadow: ballPhase === 'settled'
              ? '0 0 8px #f0c850, 0 0 16px #d4af37, 0 2px 4px rgba(0,0,0,0.6)'
              : '0 0 6px rgba(255,255,255,0.9), 0 0 12px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.6)',
            animation: ballPhase === 'settled' ? 'bounce-in 0.5s ease-out' : 'none',
          }} />
        </div>

        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '9px solid transparent',
          borderRight: '9px solid transparent',
          borderTop: `16px solid ${casinoTheme.accent.goldHi}`,
          zIndex: 5,
          filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.9))',
        }} />
      </div>

      {result && !spinning && (
        <div style={{
          textAlign: 'center',
          padding: '12px 14px',
          borderRadius: 12,
          background: result.net > 0 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `2px solid ${result.net > 0 ? casinoTheme.accent.green : casinoTheme.accent.red}`,
          animation: `${result.net > 0 ? 'win-flash' : 'lose-flash'} 0.6s ease-out`,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 44, height: 44,
            borderRadius: '50%',
            background: result.color === 'red' ? '#dc2626' : result.color === 'black' ? '#1a1a1a' : '#15803d',
            color: '#fff',
            fontSize: 20, fontWeight: 800,
            fontFamily: 'Georgia, serif',
            marginBottom: 4,
            boxShadow: result.net > 0 ? `0 0 16px ${casinoTheme.accent.goldHi}` : 'none',
            animation: 'win-zoom 0.5s ease-out',
          }}>
            {result.number}
          </div>
          <div style={{
            fontSize: 11, color: casinoTheme.text.secondary,
            fontFamily: casinoTheme.font.mono,
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            {result.color === 'red' ? 'Rot' : result.color === 'black' ? 'Schwarz' : 'Grün'}
            {result.net === 0 && result.color === 'green' && ' · Zero gewinnt nicht'}
          </div>
          <div style={{
            fontSize: 16, fontWeight: 800,
            color: result.net > 0 ? casinoTheme.accent.green : casinoTheme.accent.red,
            fontFamily: casinoTheme.font.mono,
          }}>
            {result.net > 0 ? `+${formatMoney(result.net)}` : formatMoney(result.net)}
          </div>
        </div>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
      }}>
        <ColorBet
          color="red" label="ROT" amount={redBet} disabled={spinning}
          onClick={() => placeBet('red')}
          hot={stats.roulette.redHits > stats.roulette.blackHits && stats.roulette.spins >= 3}
        />
        <ColorBet
          color="black" label="SCHWARZ" amount={blackBet} disabled={spinning}
          onClick={() => placeBet('black')}
          hot={stats.roulette.blackHits > stats.roulette.redHits && stats.roulette.spins >= 3}
        />
      </div>

      <BetPicker
        label="Chip-Wert"
        value={chip}
        max={balance}
        disabled={spinning}
        onChange={setChip}
        onSound={casinoSound.click}
        onAllIn={() => { casinoSound.allIn(); setChip(balance); }}
      />

      {lastNumbers.length > 0 && (
        <div style={{
          padding: 10,
          background: casinoTheme.bg.panel,
          border: `1px solid ${casinoTheme.border.subtle}`,
          borderRadius: 8,
        }}>
          <div style={{
            fontSize: 10, color: casinoTheme.text.tertiary,
            fontFamily: casinoTheme.font.mono, letterSpacing: 1,
            textTransform: 'uppercase', marginBottom: 6,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>Letzte Zahlen</span>
            {hot.length > 0 && hot[0].count >= 2 && (
              <span style={{ color: '#ff6b00', fontWeight: 800, animation: 'fire-glow 0.8s ease-in-out infinite' }}>
                🔥 Heiß: {hot[0].number} ({hot[0].count}×)
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {lastNumbers.slice(0, 15).map((n, i) => {
              const c = getColor(n);
              const bg = c === 'red' ? '#dc2626' : c === 'black' ? '#1a1a1a' : '#15803d';
              return (
                <span
                  key={i}
                  style={{
                    width: 22, height: 22,
                    borderRadius: '50%',
                    background: bg,
                    color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700,
                    fontFamily: casinoTheme.font.mono,
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  {n}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {stats.roulette.spins > 0 && (
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
            Verteilung · {stats.roulette.spins} Spins
          </div>
          <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ width: `${(reds / colorTotal) * 100}%`, background: '#dc2626' }} />
            <div style={{ width: `${(blacks / colorTotal) * 100}%`, background: '#1a1a1a' }} />
            <div style={{ width: `${(greens / colorTotal) * 100}%`, background: '#15803d' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#dc2626' }}>Rot {Math.round((reds / colorTotal) * 100)}%</span>
            <span style={{ color: '#9aa3b8' }}>Schwarz {Math.round((blacks / colorTotal) * 100)}%</span>
            <span style={{ color: '#22c55e' }}>Zero {Math.round((greens / colorTotal) * 100)}%</span>
          </div>
        </div>
      )}

      {bets.length > 0 && (
        <div style={{
          padding: '10px 12px',
          background: casinoTheme.bg.panel,
          border: `1px solid ${casinoTheme.border.subtle}`,
          borderRadius: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: casinoTheme.font.mono, fontSize: 13,
        }}>
          <span style={{ color: casinoTheme.text.secondary }}>Gesamteinsatz</span>
          <span style={{ color: casinoTheme.accent.goldHi, fontWeight: 700 }}>{formatMoney(totalWagered)}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={clearBets}
          disabled={spinning || bets.length === 0}
          style={{
            flex: 1,
            padding: '14px 0',
            border: `1px solid ${casinoTheme.border.default}`,
            borderRadius: 12,
            background: 'transparent',
            color: casinoTheme.text.secondary,
            fontSize: 14, fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1,
            cursor: (spinning || bets.length === 0) ? 'not-allowed' : 'pointer',
            fontFamily: casinoTheme.font.system,
            opacity: (spinning || bets.length === 0) ? 0.4 : 1,
          }}
        >
          Wetten löschen
        </button>
        <button
          onClick={spin}
          disabled={spinning || bets.length === 0}
          style={{
            flex: 2,
            padding: '16px 0',
            border: 'none',
            borderRadius: 12,
            background: (spinning || bets.length === 0)
              ? casinoTheme.bg.panelHi
              : `linear-gradient(135deg, ${casinoTheme.accent.gold} 0%, ${casinoTheme.accent.goldHi} 100%)`,
            color: (spinning || bets.length === 0) ? casinoTheme.text.tertiary : casinoTheme.text.inverse,
            fontSize: 16, fontWeight: 800,
            letterSpacing: 2,
            textTransform: 'uppercase',
            cursor: (spinning || bets.length === 0) ? 'not-allowed' : 'pointer',
            fontFamily: casinoTheme.font.system,
            boxShadow: (spinning || bets.length === 0) ? 'none' : casinoTheme.shadow.gold,
          }}
        >
          {spinning ? 'Kugel rollt…' : 'Drehen'}
        </button>
      </div>
    </div>
  );
}

function ColorBet({ color, label, amount, disabled, onClick, hot }: { color: 'red' | 'black'; label: string; amount: number; disabled: boolean; onClick: () => void; hot?: boolean }) {
  const isRed = color === 'red';
  const bg = isRed
    ? 'linear-gradient(180deg, #dc2626 0%, #7f1d1d 100%)'
    : 'linear-gradient(180deg, #2a2a2a 0%, #0a0a0a 100%)';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        position: 'relative',
        padding: '18px 0',
        border: `2px solid ${amount > 0 ? casinoTheme.accent.goldHi : (hot ? '#ff6b00' : 'rgba(255,255,255,0.1)')}`,
        borderRadius: 14,
        background: bg,
        color: '#fff',
        fontSize: 18, fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: amount > 0
          ? `0 0 16px ${casinoTheme.accent.goldHi}`
          : hot
            ? `0 0 12px #ff6b00`
            : 'none',
        transition: 'all 0.15s',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        animation: amount > 0 ? 'mega-pulse 1.4s ease-in-out infinite' : 'none',
      }}
    >
      {isRed ? <Heart size={20} fill="#fff" /> : <Skull size={20} fill="#fff" />}
      <span>{label}</span>
      {hot && amount === 0 && (
        <span style={{
          position: 'absolute', top: 4, right: 4,
          fontSize: 9, color: '#ff6b00', fontWeight: 800,
          fontFamily: casinoTheme.font.mono,
          animation: 'fire-glow 0.8s ease-in-out infinite',
        }}>
          🔥 HEISS
        </span>
      )}
      {amount > 0 && (
        <span style={{
          fontSize: 11, color: casinoTheme.accent.goldHi,
          fontFamily: casinoTheme.font.mono, fontWeight: 700,
        }}>
          {formatMoney(amount)}
        </span>
      )}
    </button>
  );
}
