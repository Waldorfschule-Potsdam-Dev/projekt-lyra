import { useState } from 'react';
import { ArrowUp, ArrowDown, HandCoins } from 'lucide-react';
import { casinoTheme, casinoGlobalCss } from './CasinoTheme';
import { formatMoney, type CasinoStats, type CasinoGameState } from './CasinoBank';
import { casinoSound } from './casinoSounds';
import { BetPicker } from './CasinoBetPicker';

interface CasinoHiLoProps {
  balance: number;
  onBet: (amount: number) => boolean;
  onResult: (payout: number, wagered: number) => void;
  stats: CasinoStats;
  gameState: CasinoGameState;
  updateGameState: (updater: (s: CasinoGameState) => CasinoGameState) => void;
  updateStats: (updater: (s: CasinoStats) => CasinoStats) => void;
}

const SUITS = ['♠', '♥', '♦', '♣'];
const SUIT_COLOR: Record<string, string> = { '♠': '#1a1a1a', '♣': '#1a1a1a', '♥': '#dc2626', '♦': '#dc2626' };
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

interface Card {
  rank: string;
  suit: string;
}

function newCard(): Card {
  return {
    rank: RANKS[Math.floor(Math.random() * RANKS.length)],
    suit: SUITS[Math.floor(Math.random() * SUITS.length)],
  };
}

function rankValue(rank: string): number {
  if (rank === 'A') return 1;
  if (rank === 'J') return 11;
  if (rank === 'Q') return 12;
  if (rank === 'K') return 13;
  return parseInt(rank, 10);
}

function calcMultiplier(streak: number): number {
  if (streak === 0) return 1;
  let m = 1;
  for (let i = 0; i < streak; i++) {
    m *= 13 / 12;
  }
  return m;
}

export function CasinoHiLo({ balance, onBet, onResult, stats, gameState, updateGameState, updateStats }: CasinoHiLoProps) {
  const bet = gameState.hiloBet;
  const current = gameState.hiloCurrent;
  const streak = gameState.hiloStreak;
  const phase = gameState.hiloPhase;
  const [next, setNext] = useState<Card | null>(null);
  const [lastResult, setLastResult] = useState<{ kind: 'cashout' | 'lost'; amount: number; streak: number } | null>(null);
  const [cardAnim, setCardAnim] = useState<'in' | 'flip' | null>(null);
  const [bigWin, setBigWin] = useState<{ amount: number; isJackpot: boolean; key: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shake, setShake] = useState(false);

  const setBet = (v: number) => updateGameState(s => ({ ...s, hiloBet: v }));

  const startGame = () => {
    if (phase === 'guessing') return;
    if (bet <= 0 || bet > balance) return;
    if (!onBet(bet)) return;
    setLastResult(null);
    setNext(null);
    setBigWin(null);
    setShowConfetti(false);
    const card = newCard();
    updateGameState(s => ({ ...s, hiloCurrent: card, hiloStreak: 0, hiloPhase: 'guessing' }));
    setCardAnim('in');
    casinoSound.cardDeal();
  };

  const guess = (dir: 'higher' | 'lower') => {
    if (phase !== 'guessing' || !current) return;
    const drawn = newCard();
    const cv = rankValue(current.rank);
    const nv = rankValue(drawn.rank);
    let correct = false;
    if (nv === cv) {
      correct = Math.random() < 0.5;
    } else {
      correct = dir === 'higher' ? nv > cv : nv < cv;
    }
    setNext(drawn);
    setCardAnim('flip');
    casinoSound.cardFlip();
    if (correct) {
      window.setTimeout(() => {
        const newStreak = streak + 1;
        updateStats(s => ({
          ...s,
          hilo: { ...s.hilo, bestStreak: Math.max(s.hilo.bestStreak, newStreak) },
        }));
        updateGameState(s => ({ ...s, hiloCurrent: drawn, hiloStreak: newStreak, hiloPhase: 'guessing' }));
        setNext(null);
        setCardAnim('in');
        casinoSound.hiloCorrect();
        if (newStreak >= 5) {
          const mult = calcMultiplier(newStreak);
          const projected = bet * mult;
          if (projected >= 200) {
            casinoSound.jackpot();
            setBigWin({ amount: projected, isJackpot: true, key: Date.now() });
            setShowConfetti(true);
            window.setTimeout(() => setShowConfetti(false), 3500);
          }
        }
      }, 800);
    } else {
      window.setTimeout(() => {
        const lostStreak = streak + 1;
        onResult(0, bet);
        setLastResult({ kind: 'lost', amount: 0, streak: lostStreak });
        updateStats(s => ({ ...s, hilo: { ...s.hilo, gamesLost: s.hilo.gamesLost + 1 } }));
        updateGameState(s => ({ ...s, hiloPhase: 'idle', hiloCurrent: null, hiloStreak: 0 }));
        casinoSound.hiloLose();
        setShake(true);
        window.setTimeout(() => setShake(false), 400);
      }, 800);
    }
  };

  const cashOut = () => {
    if (phase !== 'guessing' || streak === 0 || !current) return;
    const multiplier = calcMultiplier(streak);
    const payout = bet * multiplier;
    onResult(payout, bet);
    setLastResult({ kind: 'cashout', amount: payout, streak });
    updateStats(s => ({
      ...s,
      hilo: {
        ...s.hilo,
        gamesCashed: s.hilo.gamesCashed + 1,
        bestStreak: Math.max(s.hilo.bestStreak, streak),
        totalCashed: s.hilo.totalCashed + payout,
      },
    }));
    updateGameState(s => ({ ...s, hiloPhase: 'idle', hiloCurrent: null, hiloStreak: 0 }));
    casinoSound.hiloCashout();
    if (payout >= 200) {
      casinoSound.jackpot();
      setBigWin({ amount: payout, isJackpot: true, key: Date.now() });
      setShowConfetti(true);
      window.setTimeout(() => setShowConfetti(false), 3500);
    } else if (payout >= 100) {
      casinoSound.bigWin();
      setBigWin({ amount: payout, isJackpot: false, key: Date.now() });
      setShowConfetti(true);
      window.setTimeout(() => setShowConfetti(false), 2500);
    }
  };

  const currentMultiplier = calcMultiplier(streak);
  const currentValue = streak > 0 ? bet * currentMultiplier : bet;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 16, padding: 16,
      position: 'relative',
      animation: shake ? 'screen-shake 0.4s ease-out' : 'none',
    }}>
      <style>{casinoGlobalCss}</style>

      {showConfetti && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
          {Array.from({ length: 70 }).map((_, i) => {
            const colors = ['#d4af37', '#f0c850', '#22c55e', '#dc2626', '#3b82f6', '#fff'];
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

      <div style={{
        textAlign: 'center',
        fontSize: 11,
        color: casinoTheme.text.tertiary,
        fontFamily: casinoTheme.font.mono,
        letterSpacing: 2,
        textTransform: 'uppercase',
      }}>
        Höher oder Niedriger · Multiplikator 13/12
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
        position: 'relative',
        gap: 12,
      }}>
        {current ? (
          <PlayingCard card={current} highlight={phase === 'guessing' ? 'active' : 'normal'} anim={cardAnim} streak={streak} />
        ) : (
          <div style={{
            width: 120, height: 168,
            border: `2px dashed ${casinoTheme.border.default}`,
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: casinoTheme.text.tertiary,
            fontSize: 11,
            fontFamily: casinoTheme.font.mono,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}>
            Start
          </div>
        )}

        {next && (
          <div style={{ animation: 'bounce-in 0.4s ease-out' }}>
            <PlayingCard card={next} highlight="reveal" />
          </div>
        )}
      </div>

      {phase === 'guessing' && streak > 0 && (
        <div style={{
          padding: 10,
          background: streak >= 5
            ? 'linear-gradient(90deg, rgba(255,107,0,0.1) 0%, rgba(255,170,0,0.1) 100%)'
            : casinoTheme.bg.panel,
          border: `1px solid ${streak >= 5 ? '#ff6b00' : casinoTheme.border.gold}`,
          borderRadius: 8,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {streak >= 5 && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,170,0,0.15) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'rainbow 1.5s linear infinite',
              pointerEvents: 'none',
            }} />
          )}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: 10, color: streak >= 5 ? '#ff6b00' : casinoTheme.text.tertiary,
              fontFamily: casinoTheme.font.mono, letterSpacing: 1,
              textTransform: 'uppercase', marginBottom: 4,
              animation: streak >= 5 ? 'fire-glow 0.8s ease-in-out infinite' : 'none',
            }}>
              🔥 Streak · Multiplikator
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 6, background: casinoTheme.bg.page, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (streak / 13) * 100)}%`,
                  height: '100%',
                  background: streak >= 5
                    ? 'linear-gradient(90deg, #ff6b00 0%, #ffaa00 50%, #ff6b00 100%)'
                    : 'linear-gradient(90deg, #d4af37 0%, #f0c850 100%)',
                  backgroundSize: '200% 100%',
                  animation: streak >= 5 ? 'rainbow 1s linear infinite' : 'none',
                  transition: 'width 0.4s',
                }} />
              </div>
              <span style={{
                fontSize: 16, fontWeight: 800,
                color: streak >= 5 ? '#ff6b00' : casinoTheme.accent.goldHi,
                fontFamily: casinoTheme.font.mono,
                animation: streak >= 5 ? 'fire-glow 0.8s ease-in-out infinite' : 'none',
              }}>
                {streak}× · {currentMultiplier.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>
      )}

      {lastResult && lastResult.kind === 'cashout' && (
        <div style={{
          textAlign: 'center',
          padding: '12px 16px',
          borderRadius: 12,
          background: 'rgba(34, 197, 94, 0.12)',
          border: `1px solid ${casinoTheme.accent.green}`,
          animation: 'win-flash 0.6s ease-out',
        }}>
          <div style={{
            fontSize: 22, fontWeight: 800,
            color: casinoTheme.accent.green,
            fontFamily: casinoTheme.font.system,
            animation: 'win-zoom 0.5s ease-out',
            textShadow: `0 0 12px ${casinoTheme.accent.green}`,
          }}>
            +{formatMoney(lastResult.amount)}
          </div>
          <div style={{
            fontSize: 11, color: casinoTheme.text.secondary,
            marginTop: 2, fontFamily: casinoTheme.font.mono,
          }}>
            Ausgestiegen nach {lastResult.streak} Treffer{lastResult.streak > 1 ? 'n' : ''}
          </div>
        </div>
      )}

      {lastResult && lastResult.kind === 'lost' && (
        <div style={{
          textAlign: 'center',
          padding: '12px 16px',
          borderRadius: 12,
          background: 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${casinoTheme.accent.red}`,
          animation: 'lose-flash 0.6s ease-out',
        }}>
          <div style={{
            fontSize: 16, fontWeight: 800,
            color: casinoTheme.accent.red,
            fontFamily: casinoTheme.font.system,
            animation: 'shake 0.4s ease-out',
          }}>
            Falsch geraten
          </div>
          <div style={{
            fontSize: 11, color: casinoTheme.text.secondary,
            marginTop: 2, fontFamily: casinoTheme.font.mono,
          }}>
            -{formatMoney(bet)} · Streak nach {lastResult.streak} Versuch{lastResult.streak > 1 ? 'en' : ''} beendet
          </div>
        </div>
      )}

      {phase === 'guessing' && current && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}>
          <button
            onClick={() => { casinoSound.click(); guess('higher'); }}
            style={{
              padding: '16px 0',
              border: `1px solid ${casinoTheme.accent.green}`,
              borderRadius: 12,
              background: 'rgba(34, 197, 94, 0.1)',
              color: casinoTheme.accent.green,
              fontSize: 15, fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 1,
              cursor: 'pointer',
              fontFamily: casinoTheme.font.system,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <ArrowUp size={18} /> Höher
          </button>
          <button
            onClick={() => { casinoSound.click(); guess('lower'); }}
            style={{
              padding: '16px 0',
              border: `1px solid ${casinoTheme.accent.red}`,
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.1)',
              color: casinoTheme.accent.red,
              fontSize: 15, fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 1,
              cursor: 'pointer',
              fontFamily: casinoTheme.font.system,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <ArrowDown size={18} /> Niedriger
          </button>
        </div>
      )}

      {phase === 'guessing' && streak > 0 && (
        <button
          onClick={cashOut}
          style={{
            width: '100%',
            padding: '14px 0',
            border: `1px solid ${casinoTheme.accent.gold}`,
            borderRadius: 12,
            background: casinoTheme.accent.goldSoft,
            color: casinoTheme.accent.goldHi,
            fontSize: 15, fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 1,
            cursor: 'pointer',
            fontFamily: casinoTheme.font.system,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            animation: 'gold-pulse 1.4s ease-in-out infinite',
          }}
        >
          <HandCoins size={18} /> Aussteigen · {formatMoney(currentValue)}
        </button>
      )}

      {(phase === 'idle') && (
        <>
          {stats.hilo.gamesCashed + stats.hilo.gamesLost > 0 && (
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
                Statistik
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: casinoTheme.text.secondary }}>Bester Streak</span>
                <span style={{ color: casinoTheme.accent.goldHi, fontWeight: 700 }}>{stats.hilo.bestStreak}×</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: casinoTheme.text.secondary }}>Cashed Out</span>
                <span style={{ color: casinoTheme.accent.green }}>{stats.hilo.gamesCashed}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: casinoTheme.text.secondary }}>Verloren</span>
                <span style={{ color: casinoTheme.accent.red }}>{stats.hilo.gamesLost}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: casinoTheme.text.secondary }}>Gesamt-Cashed</span>
                <span style={{ color: casinoTheme.accent.goldHi, fontWeight: 700 }}>{formatMoney(stats.hilo.totalCashed)}</span>
              </div>
            </div>
          )}

          <BetPicker
            label="Einsatz"
            value={bet}
            max={balance}
            disabled={false}
            onChange={setBet}
            onSound={casinoSound.click}
          />

          <button
            onClick={startGame}
            disabled={bet <= 0 || bet > balance}
            style={{
              width: '100%',
              padding: '16px 0',
              border: 'none',
              borderRadius: 12,
              background: `linear-gradient(135deg, ${casinoTheme.accent.gold} 0%, ${casinoTheme.accent.goldHi} 100%)`,
              color: casinoTheme.text.inverse,
              fontSize: 16, fontWeight: 800,
              letterSpacing: 2,
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: casinoTheme.font.system,
              boxShadow: casinoTheme.shadow.gold,
            }}
          >
            Karte ziehen · {formatMoney(bet)}
          </button>
        </>
      )}
    </div>
  );
}

function PlayingCard({ card, highlight, anim, streak = 0 }: { card: Card; highlight: 'normal' | 'active' | 'reveal'; anim?: 'in' | 'flip' | null; streak?: number }) {
  const color = SUIT_COLOR[card.suit] || '#1a1a1a';
  const border = highlight === 'reveal' ? casinoTheme.accent.gold
    : highlight === 'active' ? casinoTheme.accent.blue
    : casinoTheme.border.default;
  const animStyle: React.CSSProperties = anim === 'in'
    ? { animation: 'bounce-in 0.4s ease-out' }
    : anim === 'flip'
      ? { animation: 'shake 0.4s ease-out' }
      : {};
  const onFire = streak >= 5;

  return (
    <div style={{
      width: 120, height: 168,
      background: 'linear-gradient(180deg, #fafafa 0%, #e8e8e8 100%)',
      border: `2px solid ${border}`,
      borderRadius: 12,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 10,
      boxShadow: highlight === 'reveal'
        ? `0 0 16px ${casinoTheme.accent.goldHi}, 0 4px 12px rgba(0,0,0,0.4)`
        : onFire
          ? `0 0 16px #ff6b00, 0 0 32px #ffaa00, 0 4px 12px rgba(0,0,0,0.4)`
          : highlight === 'active'
            ? `0 0 12px ${casinoTheme.accent.blue}, 0 4px 12px rgba(0,0,0,0.4)`
            : '0 4px 12px rgba(0,0,0,0.4)',
      transition: 'all 0.2s',
      position: 'relative',
      ...animStyle,
    }}>
      {onFire && (
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: 12,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,170,0,0.2) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'rainbow 1.5s linear infinite',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{
        fontSize: 22, fontWeight: 800, color,
        fontFamily: 'Georgia, serif',
        lineHeight: 1,
        position: 'relative', zIndex: 1,
      }}>
        {card.rank}
        <div style={{ fontSize: 16, lineHeight: 1, marginTop: 2 }}>{card.suit}</div>
      </div>
      <div style={{
        fontSize: 56, color,
        textAlign: 'center',
        fontFamily: 'Georgia, serif',
        lineHeight: 1,
        position: 'relative', zIndex: 1,
      }}>
        {card.suit}
      </div>
      <div style={{
        fontSize: 22, fontWeight: 800, color,
        fontFamily: 'Georgia, serif',
        lineHeight: 1,
        alignSelf: 'flex-end',
        transform: 'rotate(180deg)',
        position: 'relative', zIndex: 1,
      }}>
        {card.rank}
        <div style={{ fontSize: 16, lineHeight: 1, marginTop: 2 }}>{card.suit}</div>
      </div>
    </div>
  );
}
