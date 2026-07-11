import { useState, useRef, useEffect } from 'react';
import { Play, Square, Zap, Flame } from 'lucide-react';
import { casinoTheme, casinoGlobalCss } from './CasinoTheme';
import { formatMoney, type CasinoStats, type CasinoGameState, getStreakLabel } from './CasinoBank';
import { casinoSound } from './casinoSounds';
import { BetPicker } from './CasinoBetPicker';

interface CasinoSlotProps {
  balance: number;
  onBet: (amount: number) => boolean;
  onResult: (payout: number, wagered: number) => void;
  stats: CasinoStats;
  gameState: CasinoGameState;
  updateGameState: (updater: (s: CasinoGameState) => CasinoGameState) => void;
  updateStats: (updater: (s: CasinoStats) => CasinoStats) => void;
}

interface Symbol {
  emoji: string;
  label: string;
  weight: number;
  payout3: number;
  payout2: number;
}

const SYMBOLS: Symbol[] = [
  { emoji: '🍒', label: 'Kirsche', weight: 14, payout3: 5, payout2: 1.5 },
  { emoji: '🍋', label: 'Zitrone', weight: 11, payout3: 8, payout2: 2 },
  { emoji: '🍇', label: 'Traube', weight: 9, payout3: 12, payout2: 3 },
  { emoji: '🔔', label: 'Glocke', weight: 7, payout3: 20, payout2: 4 },
  { emoji: '💎', label: 'Diamant', weight: 4, payout3: 50, payout2: 8 },
  { emoji: '7️⃣', label: 'Sieben', weight: 2, payout3: 100, payout2: 15 },
];

const REEL_STRIP: Symbol[] = SYMBOLS.flatMap(s => Array(s.weight).fill(s));

function pickSymbol(): Symbol {
  return REEL_STRIP[Math.floor(Math.random() * REEL_STRIP.length)];
}

const AUTO_OPTIONS = [5, 10, 25, 50, 0];

export function CasinoSlot({ balance, onBet, onResult, stats, gameState, updateGameState, updateStats }: CasinoSlotProps) {
  const bet = gameState.slotBet;
  const [reels, setReels] = useState<[Symbol, Symbol, Symbol]>([pickSymbol(), pickSymbol(), pickSymbol()]);
  const [spinning, setSpinning] = useState(false);
  const [stoppedIndex, setStoppedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<{ payout: number; line: string; won: boolean; kind: 'three' | 'two' | 'none' } | null>(null);
  const [bigWin, setBigWin] = useState<{ amount: number; isJackpot: boolean; key: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shake, setShake] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [autoCount, setAutoCount] = useState(0);
  const [autoMode, setAutoMode] = useState(false);
  const [autoStartCount, setAutoStartCount] = useState(0);
  const [autoLosses, setAutoLosses] = useState(0);
  const [showLightning, setShowLightning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reelRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  const setBet = (v: number) => updateGameState(s => ({ ...s, slotBet: v }));
  const stopAuto = () => { setAutoMode(false); setAutoCount(0); setAutoStartCount(0); };

  useEffect(() => {
    if (autoMode && !spinning && autoCount > 0 && bet > 0 && bet <= balance) {
      const timer = window.setTimeout(() => handleSpin(true), 350);
      return () => window.clearTimeout(timer);
    }
    if (autoMode && autoCount === 0) {
      stopAuto();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMode, spinning, autoCount, bet, balance]);

  const handleSpin = (isAuto = false) => {
    if (spinning || bet <= 0 || bet > balance) {
      if (isAuto) stopAuto();
      return;
    }
    if (!onBet(bet)) {
      if (isAuto) stopAuto();
      return;
    }

    setSpinning(true);
    setResult(null);
    setStoppedIndex(null);
    setBigWin(null);
    setShowConfetti(false);
    if (!isAuto) setAutoLosses(0);
    casinoSound.reelSpin();

    const finalReels: [Symbol, Symbol, Symbol] = [pickSymbol(), pickSymbol(), pickSymbol()];

    const stopTimes = [600, 900, 1200];
    stopTimes.forEach((t, i) => {
      window.setTimeout(() => {
        casinoSound.reelStop();
        setStoppedIndex(i);
      }, t);
    });

    window.setTimeout(() => {
      setReels(finalReels);
      const [a, b, c] = finalReels;
      let payout = 0;
      let line = 'Kein Gewinn';
      let won = false;
      let kind: 'three' | 'two' | 'none' = 'none';
      let bigSymbol = '';
      if (a.emoji === b.emoji && b.emoji === c.emoji) {
        payout = bet * a.payout3;
        line = `Drei ${a.label} · +${formatMoney(payout)}`;
        won = true;
        kind = 'three';
        bigSymbol = a.label;
      } else if (a.emoji === b.emoji || b.emoji === c.emoji || a.emoji === c.emoji) {
        const sym = a.emoji === b.emoji ? a : b.emoji === c.emoji ? b : a;
        payout = bet * sym.payout2;
        line = `Zwei ${sym.label} · +${formatMoney(payout)}`;
        won = true;
        kind = 'two';
        bigSymbol = sym.label;
      }
      setResult({ payout, line, won, kind });
      onResult(payout, bet);
      updateStats(s => ({
        ...s,
        slot: {
          ...s.slot,
          spins: s.slot.spins + 1,
          threeOfAKind: s.slot.threeOfAKind + (kind === 'three' ? 1 : 0),
          twoOfAKind: s.slot.twoOfAKind + (kind === 'two' ? 1 : 0),
          biggestSymbolWin: kind === 'three' && (payout > 0) ? bigSymbol : s.slot.biggestSymbolWin,
          biggestPayout: Math.max(s.slot.biggestPayout, payout),
        },
      }));
      if (won) {
        setAutoLosses(0);
        if (kind === 'three' && payout >= bet * 50) {
          casinoSound.jackpot();
          setBigWin({ amount: payout, isJackpot: true, key: Date.now() });
          setShowConfetti(true);
          setShake(true);
          setShowLightning(true);
          window.setTimeout(() => { setShake(false); setShowConfetti(false); setShowLightning(false); }, 4500);
        } else if (kind === 'three') {
          casinoSound.slotWin();
          setShake(true);
          window.setTimeout(() => setShake(false), 400);
        } else {
          casinoSound.hiloCorrect();
        }
      } else {
        casinoSound.slotLose();
        setShake(true);
        const newLosses = autoLosses + 1;
        setAutoLosses(newLosses);
        window.setTimeout(() => setShake(false), 400);
        if (newLosses === 4) {
          setTimeout(() => {
            casinoSound.nearMiss();
            setBigWin({ amount: 0, isJackpot: false, key: Date.now() });
          }, 600);
        }
      }
      setSpinning(false);
      if (isAuto) {
        setAutoCount(c => Math.max(0, c - 1));
      }
    }, 1400);
  };

  const startAuto = (n: number) => {
    if (n === 0) {
      setAutoMode(true);
      setAutoStartCount(0);
      setAutoCount(999999);
    } else {
      setAutoMode(true);
      setAutoStartCount(n);
      setAutoCount(n);
    }
  };

  const streakLabel = getStreakLabel(stats.currentStreak);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 12px 0',
        position: 'relative',
        animation: shake ? 'screen-shake 0.4s ease-out' : 'none',
        minHeight: '100%',
      }}
    >
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

      {bigWin && (
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
              {bigWin.isJackpot ? '★ Jackpot ★' : bigWin.amount > 0 ? '★ Big Win ★' : '⚡ So nah! ⚡'}
            </div>
            <div style={{
              fontSize: bigWin.amount > 0 ? 48 : 24, fontWeight: 800,
              color: casinoTheme.accent.goldHi,
              fontFamily: casinoTheme.font.display,
              marginTop: 4,
              textShadow: `0 0 16px ${casinoTheme.accent.goldHi}, 0 0 32px ${casinoTheme.accent.gold}`,
            }}>
              {bigWin.amount > 0 ? `+${formatMoney(bigWin.amount)}` : 'Nur 1 Walze fehlte!'}
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
          color: streakLabel.color as string,
        }}>
          <Flame size={12} /> {streakLabel.label} · {stats.currentStreak}× <Flame size={12} />
        </div>
      )}

      <div style={{
        textAlign: 'center',
        fontSize: 10,
        color: casinoTheme.text.tertiary,
        fontFamily: casinoTheme.font.mono,
        letterSpacing: 2,
        textTransform: 'uppercase',
      }}>
        3 Walzen · 6 Symbole
      </div>

      <div style={{
        background: `linear-gradient(180deg, ${casinoTheme.bg.panel} 0%, #0d1117 100%)`,
        border: `3px solid ${result && result.won ? casinoTheme.accent.goldHi : casinoTheme.accent.gold}`,
        borderRadius: 16,
        padding: 12,
        boxShadow: result && result.won
          ? `inset 0 0 30px rgba(0,0,0,0.5), 0 0 32px rgba(212,175,55,0.6)`
          : `inset 0 0 30px rgba(0,0,0,0.5), 0 0 24px rgba(212,175,55,0.2)`,
        position: 'relative',
        transition: 'all 0.3s',
      }}>
        <div style={{
          position: 'absolute', top: 4, left: 4, right: 4, bottom: 4,
          border: `1px solid ${casinoTheme.accent.gold}`,
          borderRadius: 12,
          pointerEvents: 'none',
          opacity: 0.4,
        }} />

        {result && result.won && !spinning && (
          <>
            {Array.from({ length: 20 }).map((_, i) => {
              const angle = (i / 20) * Math.PI * 2;
              const dist = 90 + (i % 3) * 28;
              return (
                <div
                  key={`spark-${i}-${result.kind}`}
                  style={{
                    position: 'absolute',
                    left: '50%', top: '50%',
                    width: 8, height: 8,
                    marginLeft: -4, marginTop: -4,
                    borderRadius: '50%',
                    background: casinoTheme.accent.goldHi,
                    boxShadow: `0 0 14px ${casinoTheme.accent.goldHi}`,
                    animation: `sparkle 1.4s ease-out ${i * 0.04}s forwards`,
                    ['--sx' as string]: `${Math.cos(angle) * dist}px`,
                    ['--sy' as string]: `${Math.sin(angle) * dist}px`,
                    pointerEvents: 'none',
                  } as React.CSSProperties}
                />
              );
            })}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`rain-${i}`}
                style={{
                  position: 'absolute',
                  top: -20,
                  left: `${(i * 8.5) % 100}%`,
                  fontSize: 18,
                  animation: `gold-rain 2s ease-in ${i * 0.1}s forwards`,
                  pointerEvents: 'none',
                } as React.CSSProperties}
              >
                💰
              </div>
            ))}
          </>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 6,
        }}>
          {reels.map((sym, i) => {
            const isWin = result && result.won;
            return (
              <div
                key={i}
                ref={reelRefs[i]}
                style={{
                  aspectRatio: '1 / 1.2',
                  background: 'linear-gradient(180deg, #f8f5e8 0%, #d8d2b8 100%)',
                  border: `2px solid ${isWin ? casinoTheme.accent.goldHi : '#8a6e1f'}`,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: isWin ? `inset 0 0 20px rgba(0,0,0,0.2), 0 0 20px ${casinoTheme.accent.goldHi}` : 'inset 0 0 20px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{
                  fontSize: 48,
                  lineHeight: 1,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  animation: spinning
                    ? `reel-spin 0.15s linear infinite`
                    : stoppedIndex === i
                      ? 'reel-stop 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
                      : 'none',
                }}>
                  {spinning
                    ? REEL_STRIP[(Math.floor(Date.now() / 80) + i * 7) % REEL_STRIP.length].emoji
                    : sym.emoji}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {result && !spinning && (
        <div style={{
          textAlign: 'center',
          padding: '10px 14px',
          borderRadius: 12,
          background: result.won ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${result.won ? casinoTheme.accent.green : casinoTheme.accent.red}`,
          animation: `${result.won ? 'win-flash' : 'lose-flash'} 0.6s ease-out`,
        }}>
          <div style={{
            fontSize: 16, fontWeight: 800,
            color: result.won ? casinoTheme.accent.green : casinoTheme.accent.red,
            fontFamily: casinoTheme.font.system,
            animation: result.won ? 'win-zoom 0.5s ease-out' : 'shake 0.4s ease-out',
            textShadow: result.won ? `0 0 12px ${casinoTheme.accent.green}` : 'none',
          }}>
            {result.line}
          </div>
          {!result.won && autoLosses >= 3 && (
            <div style={{
              fontSize: 10, color: '#ff6b00', marginTop: 4,
              fontFamily: casinoTheme.font.mono, fontWeight: 700,
              animation: 'fire-glow 0.8s ease-in-out infinite',
            }}>
              🔥 Nächster Spin wird deins!
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => { casinoSound.click(); setShowTable(!showTable); }}
        style={{
          background: 'none',
          border: `1px solid ${casinoTheme.border.subtle}`,
          borderRadius: 8,
          padding: '8px 0',
          color: casinoTheme.text.secondary,
          fontSize: 11, fontWeight: 700,
          fontFamily: casinoTheme.font.mono,
          textTransform: 'uppercase',
          letterSpacing: 1,
          cursor: 'pointer',
        }}
      >
        {showTable ? '▾ Auszahlungstabelle' : '▴ Auszahlungstabelle'}
      </button>

      {showTable && (
        <div style={{
          background: casinoTheme.bg.panel,
          border: `1px solid ${casinoTheme.border.subtle}`,
          borderRadius: 12,
          padding: 12,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SYMBOLS.slice().reverse().map(s => (
              <div key={s.emoji} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 12, fontFamily: casinoTheme.font.system,
                padding: '4px 0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{s.emoji}</span>
                  <span style={{ color: casinoTheme.text.secondary }}>{s.label}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontFamily: casinoTheme.font.mono, color: casinoTheme.accent.goldHi }}>
                  <span>x{s.payout3}</span>
                  <span style={{ color: casinoTheme.text.tertiary, fontSize: 11 }}>x{s.payout2}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            fontSize: 10, color: casinoTheme.text.tertiary,
            marginTop: 6, fontFamily: casinoTheme.font.mono,
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>3 gleiche</span>
            <span>2 gleiche</span>
          </div>
        </div>
      )}

      {stats.slot.spins > 0 && showTable && (
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
            Statistik · {stats.slot.spins} Spins
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: casinoTheme.text.secondary }}>Drillinge</span>
            <span style={{ color: casinoTheme.accent.goldHi }}>{stats.slot.threeOfAKind}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: casinoTheme.text.secondary }}>Paare</span>
            <span style={{ color: casinoTheme.accent.goldHi }}>{stats.slot.twoOfAKind}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: casinoTheme.text.secondary }}>Top-Gewinn</span>
            <span style={{ color: casinoTheme.accent.goldHi, fontWeight: 700 }}>{formatMoney(stats.slot.biggestPayout)}</span>
          </div>
        </div>
      )}

      <div style={{
        position: 'sticky',
        bottom: 0,
        margin: '0 -12px',
        padding: '12px 12px 14px',
        background: 'linear-gradient(180deg, rgba(10,14,26,0) 0%, rgba(10,14,26,0.95) 30%, rgba(10,14,26,0.98) 100%)',
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${casinoTheme.border.gold}`,
        zIndex: 5,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <BetPicker
          label="Einsatz"
          value={bet}
          max={balance}
          disabled={spinning || autoMode}
          onChange={setBet}
          onSound={casinoSound.click}
          onAllIn={() => { casinoSound.allIn(); setBet(balance); }}
        />

        {autoMode ? (
          <div style={{
            display: 'flex', gap: 8, alignItems: 'center',
            padding: '10px 12px',
            background: 'linear-gradient(135deg, rgba(255,107,0,0.15) 0%, rgba(255,170,0,0.1) 100%)',
            border: '2px solid #ff6b00',
            borderRadius: 12,
            animation: 'mega-pulse 1.4s ease-in-out infinite',
          }}>
            <Zap size={18} color="#ff6b00" />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 12, fontWeight: 800, color: '#ff6b00',
                fontFamily: casinoTheme.font.mono, textTransform: 'uppercase', letterSpacing: 1,
              }}>
                Auto-Spin läuft
              </div>
              <div style={{
                fontSize: 10, color: casinoTheme.text.secondary,
                fontFamily: casinoTheme.font.mono,
              }}>
                {autoStartCount === 0 ? '∞ endlos' : `Noch ${autoCount} von ${autoStartCount}`}
              </div>
            </div>
            <button
              onClick={stopAuto}
              style={{
                padding: '8px 14px',
                background: casinoTheme.accent.red,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 12, fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 1,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: casinoTheme.font.system,
              }}
            >
              <Square size={12} fill="#fff" /> Stop
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => handleSpin(false)}
              disabled={spinning || bet <= 0 || bet > balance}
              style={{
                width: '100%',
                padding: '16px 0',
                border: 'none',
                borderRadius: 12,
                background: spinning
                  ? casinoTheme.bg.panelHi
                  : `linear-gradient(135deg, ${casinoTheme.accent.gold} 0%, ${casinoTheme.accent.goldHi} 100%)`,
                color: spinning ? casinoTheme.text.tertiary : casinoTheme.text.inverse,
                fontSize: 16, fontWeight: 800,
                letterSpacing: 2,
                textTransform: 'uppercase',
                cursor: spinning ? 'not-allowed' : 'pointer',
                fontFamily: casinoTheme.font.system,
                boxShadow: spinning ? 'none' : casinoTheme.shadow.gold,
                transition: 'all 0.15s',
              }}
            >
              {spinning ? 'Dreht…' : 'Spin'}
            </button>

            <div style={{
              display: 'flex', gap: 6, alignItems: 'center',
              padding: '8px 0 0',
            }}>
              <span style={{
                fontSize: 10, color: casinoTheme.text.tertiary,
                fontFamily: casinoTheme.font.mono, textTransform: 'uppercase', letterSpacing: 1,
                marginRight: 4,
              }}>
                Auto
              </span>
              {AUTO_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => { casinoSound.click(); startAuto(n); }}
                  disabled={bet <= 0 || bet > balance}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    border: `1px solid ${n === 0 ? '#ff6b00' : casinoTheme.border.default}`,
                    borderRadius: 8,
                    background: n === 0 ? 'rgba(255,107,0,0.15)' : 'transparent',
                    color: n === 0 ? '#ff6b00' : casinoTheme.text.primary,
                    fontSize: 12, fontWeight: 800,
                    fontFamily: casinoTheme.font.mono,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                    opacity: (bet <= 0 || bet > balance) ? 0.4 : 1,
                  }}
                >
                  {n === 0 ? <><Zap size={11} /> ∞</> : `×${n}`}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
