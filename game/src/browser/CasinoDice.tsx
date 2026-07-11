import { useState, useEffect } from 'react';
import { Dices, Flame, TrendingUp, TrendingDown } from 'lucide-react';
import { casinoTheme, casinoGlobalCss } from './CasinoTheme';
import { formatMoney, type CasinoStats, type CasinoGameState, getStreakLabel } from './CasinoBank';
import { casinoSound } from './casinoSounds';
import { BetPicker } from './CasinoBetPicker';

interface CasinoDiceProps {
  balance: number;
  onBet: (amount: number) => boolean;
  onResult: (payout: number, wagered: number) => void;
  stats: CasinoStats;
  gameState: CasinoGameState;
  updateGameState: (updater: (s: CasinoGameState) => CasinoGameState) => void;
  updateStats: (updater: (s: CasinoStats) => CasinoStats) => void;
}

function calcMultiplier(target: number, dir: 'over' | 'under'): number {
  const winChance = dir === 'over' ? (100 - target) / 100 : target / 100;
  return Math.max(1.01, 0.99 / winChance);
}

function rollDice(): number {
  return Math.random() * 100;
}

export function CasinoDice({ balance, onBet, onResult, stats, gameState, updateGameState, updateStats }: CasinoDiceProps) {
  const bet = gameState.diceBet;
  const target = gameState.diceTarget;
  const dir = gameState.diceDirection;
  const [rolling, setRolling] = useState(false);
  const [roll, setRoll] = useState<number | null>(null);
  const [lastWon, setLastWon] = useState<boolean | null>(null);
  const [payout, setPayout] = useState(0);
  const [history, setHistory] = useState<{ roll: number; won: boolean; key: number }[]>([]);
  const [showLightning, setShowLightning] = useState(false);
  const [bigWin, setBigWin] = useState<{ amount: number; key: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const setBet = (v: number) => updateGameState(s => ({ ...s, diceBet: v }));
  const setTarget = (v: number) => updateGameState(s => ({ ...s, diceTarget: Math.max(2, Math.min(98, v)) }));
  const setDir = (d: 'over' | 'under') => {
    casinoSound.click();
    updateGameState(s => ({ ...s, diceDirection: d }));
  };

  const mult = calcMultiplier(target, dir);
  const winChance = dir === 'over' ? (100 - target) : target;

  const handleRoll = () => {
    if (rolling || bet <= 0 || bet > balance) return;
    if (!onBet(bet)) return;
    setRolling(true);
    setRoll(null);
    setLastWon(null);
    casinoSound.diceRoll();

    const targetNum = rollDice();
    window.setTimeout(() => {
      const finalRoll = targetNum;
      const won = dir === 'over' ? finalRoll > target : finalRoll < target;
      const winAmount = won ? bet * mult : 0;
      setRoll(finalRoll);
      setLastWon(won);
      setPayout(winAmount);
      onResult(winAmount, bet);
      setHistory(h => [{ roll: finalRoll, won, key: Date.now() }, ...h].slice(0, 10));
      updateStats(s => ({
        ...s,
        dice: {
          ...s.dice,
          rolls: s.dice.rolls + 1,
          wins: s.dice.wins + (won ? 1 : 0),
          losses: s.dice.losses + (won ? 0 : 1),
          bestStreak: won ? Math.max(s.dice.bestStreak, 0) + 0 : 0,
          biggestWin: Math.max(s.dice.biggestWin, winAmount - bet),
          totalWon: s.dice.totalWon + winAmount,
        },
      }));
      if (won) {
        casinoSound.diceWin();
        if (mult >= 5) {
          setBigWin({ amount: winAmount - bet, key: Date.now() });
          setShowConfetti(true);
          setShowLightning(true);
          window.setTimeout(() => { setShowConfetti(false); setShowLightning(false); }, 3500);
        }
      } else {
        casinoSound.diceLose();
      }
      setRolling(false);
    }, 1100);
  };

  const streakLabel = getStreakLabel(stats.currentStreak);
  const losses = stats.dice.rolls > 0 ? stats.dice.losses : 0;
  const wins = stats.dice.wins;

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
          {Array.from({ length: 60 }).map((_, i) => {
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
              ★ Lucky Roll ★
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
        Würfel 0–100 · Unter oder Über
      </div>

      <div style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #0d4628 0%, #105c34 100%)',
        border: `3px solid #5a3a1f`,
        borderRadius: 12,
        padding: 16,
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 200,
      }}>
        <div style={{
          position: 'absolute', top: 12, left: 12, right: 12,
          display: 'flex', justifyContent: 'space-between',
          fontSize: 10, color: 'rgba(255,255,255,0.6)',
          fontFamily: casinoTheme.font.mono,
        }}>
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
        <div style={{
          position: 'absolute', left: 16, right: 16, top: 28,
          height: 1, background: 'rgba(255,255,255,0.2)',
        }} />

        <div style={{
          position: 'absolute', left: 16, right: 16, top: 28,
          height: 4, borderRadius: 2,
          background: 'rgba(0,0,0,0.4)',
          marginTop: 16,
        }} />

        <div style={{
          position: 'absolute', left: `calc(16px + (${target} / 100) * (100% - 32px))`,
          top: 24, width: 4, height: 16,
          background: casinoTheme.accent.goldHi,
          boxShadow: `0 0 8px ${casinoTheme.accent.goldHi}`,
          transform: 'translateX(-50%)',
          zIndex: 4,
        }} />

        {roll !== null && (
          <div style={{
            position: 'absolute', left: `calc(16px + (${roll} / 100) * (100% - 32px))`,
            top: 60, width: 12, height: 12,
            background: lastWon ? casinoTheme.accent.green : casinoTheme.accent.red,
            border: '2px solid #fff',
            borderRadius: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5,
            boxShadow: lastWon
              ? `0 0 14px ${casinoTheme.accent.green}`
              : `0 0 14px ${casinoTheme.accent.red}`,
            animation: 'bounce-in 0.4s ease-out',
          }} />
        )}

        {rolling && (
          <div style={{
            position: 'absolute', left: 16, right: 16, top: 60,
            height: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              fontSize: 36,
              animation: 'dice-bounce 0.15s linear infinite',
              display: 'inline-block',
            }}>
              <Dices size={36} color={casinoTheme.accent.goldHi} />
            </div>
          </div>
        )}

        <div style={{ marginTop: 100, textAlign: 'center', width: '100%' }}>
          {roll !== null && !rolling && (
            <div style={{
              fontSize: 42, fontWeight: 800,
              color: lastWon ? casinoTheme.accent.green : casinoTheme.accent.red,
              fontFamily: casinoTheme.font.display,
              textShadow: lastWon
                ? `0 0 16px ${casinoTheme.accent.green}`
                : `0 0 16px ${casinoTheme.accent.red}`,
              animation: 'win-zoom 0.5s ease-out',
            }}>
              {roll.toFixed(2)}
            </div>
          )}
          {roll !== null && !rolling && (
            <div style={{
              fontSize: 13, fontWeight: 800,
              color: lastWon ? casinoTheme.accent.green : casinoTheme.accent.red,
              fontFamily: casinoTheme.font.mono,
              marginTop: 2,
            }}>
              {lastWon ? `+${formatMoney(payout - bet)} Gewinn` : `-${formatMoney(bet)}`}
            </div>
          )}
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
      }}>
        <button
          onClick={() => setDir('under')}
          style={{
            padding: '12px 0',
            border: `2px solid ${dir === 'under' ? casinoTheme.accent.blue : casinoTheme.border.default}`,
            borderRadius: 12,
            background: dir === 'under' ? 'rgba(59,130,246,0.15)' : 'transparent',
            color: dir === 'under' ? casinoTheme.accent.blue : casinoTheme.text.secondary,
            fontSize: 14, fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 1,
            cursor: 'pointer',
            fontFamily: casinoTheme.font.system,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <TrendingDown size={16} /> Unter {target}
        </button>
        <button
          onClick={() => setDir('over')}
          style={{
            padding: '12px 0',
            border: `2px solid ${dir === 'over' ? casinoTheme.accent.green : casinoTheme.border.default}`,
            borderRadius: 12,
            background: dir === 'over' ? 'rgba(34,197,94,0.15)' : 'transparent',
            color: dir === 'over' ? casinoTheme.accent.green : casinoTheme.text.secondary,
            fontSize: 14, fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 1,
            cursor: 'pointer',
            fontFamily: casinoTheme.font.system,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          Über {target} <TrendingUp size={16} />
        </button>
      </div>

      <div style={{
        padding: 12,
        background: casinoTheme.bg.panel,
        border: `1px solid ${casinoTheme.border.subtle}`,
        borderRadius: 10,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 8,
        }}>
          <span style={{
            fontSize: 11, color: casinoTheme.text.tertiary,
            fontFamily: casinoTheme.font.mono, letterSpacing: 1, textTransform: 'uppercase',
          }}>
            Ziel: {target}
          </span>
          <span style={{
            fontSize: 13, fontWeight: 800,
            color: mult >= 5 ? '#ff6b00' : mult >= 2 ? casinoTheme.accent.goldHi : casinoTheme.accent.green,
            fontFamily: casinoTheme.font.mono,
            textShadow: mult >= 5 ? '0 0 8px #ff6b00' : 'none',
          }}>
            {mult.toFixed(2)}x
          </span>
        </div>
        <input
          type="range"
          min={2}
          max={98}
          value={target}
          onChange={(e) => setTarget(parseInt(e.target.value, 10))}
          disabled={rolling}
          style={{
            width: '100%',
            accentColor: casinoTheme.accent.gold,
            cursor: 'pointer',
          }}
        />
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 10, color: casinoTheme.text.tertiary,
          fontFamily: casinoTheme.font.mono, marginTop: 4,
        }}>
          <span>Gewinnchance: {winChance.toFixed(0)}%</span>
          <span style={{ color: winChance < 10 ? '#ff6b00' : casinoTheme.text.tertiary }}>
            {winChance < 10 && '🔥 HOCHRISIKO'}
            {winChance >= 10 && winChance < 25 && '⚡ Riskant'}
            {winChance >= 25 && winChance < 50 && 'Mittel'}
            {winChance >= 50 && 'Sicher'}
          </span>
        </div>
      </div>

      {history.length > 0 && (
        <div style={{
          display: 'flex', gap: 4, flexWrap: 'wrap',
        }}>
          {history.map((h, i) => (
            <div
              key={h.key}
              style={{
                width: 36, height: 36,
                borderRadius: 6,
                background: h.won ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${h.won ? casinoTheme.accent.green : casinoTheme.accent.red}66`,
                color: h.won ? casinoTheme.accent.green : casinoTheme.accent.red,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800,
                fontFamily: casinoTheme.font.mono,
                animation: i === 0 ? 'bounce-in 0.4s ease-out' : 'none',
              }}
            >
              {h.roll.toFixed(0)}
            </div>
          ))}
        </div>
      )}

      <BetPicker
        label="Einsatz"
        value={bet}
        max={balance}
        disabled={rolling}
        onChange={setBet}
        onSound={casinoSound.click}
        onAllIn={() => { casinoSound.allIn(); setBet(balance); }}
      />

      <div style={{
        padding: '8px 12px',
        background: casinoTheme.bg.panel,
        border: `1px solid ${casinoTheme.border.subtle}`,
        borderRadius: 8,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: casinoTheme.font.mono, fontSize: 13,
      }}>
        <span style={{ color: casinoTheme.text.secondary }}>Möglicher Gewinn</span>
        <span style={{ color: casinoTheme.accent.goldHi, fontWeight: 700 }}>{formatMoney(bet * mult)}</span>
      </div>

      <button
        onClick={handleRoll}
        disabled={rolling || bet <= 0 || bet > balance}
        style={{
          width: '100%',
          padding: '16px 0',
          border: 'none',
          borderRadius: 12,
          background: rolling
            ? casinoTheme.bg.panelHi
            : `linear-gradient(135deg, ${casinoTheme.accent.gold} 0%, ${casinoTheme.accent.goldHi} 100%)`,
          color: rolling ? casinoTheme.text.tertiary : casinoTheme.text.inverse,
          fontSize: 16, fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
          cursor: rolling ? 'not-allowed' : 'pointer',
          fontFamily: casinoTheme.font.system,
          boxShadow: rolling ? 'none' : casinoTheme.shadow.gold,
        }}
      >
        {rolling ? 'Würfelt…' : 'Würfeln'}
      </button>

      {stats.dice.rolls > 0 && (
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
            Dice · {stats.dice.rolls} Würfe
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: casinoTheme.text.secondary }}>Gewonnen</span>
            <span style={{ color: casinoTheme.accent.green }}>{wins}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: casinoTheme.text.secondary }}>Verloren</span>
            <span style={{ color: casinoTheme.accent.red }}>{losses}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: casinoTheme.text.secondary }}>Top-Gewinn</span>
            <span style={{ color: casinoTheme.accent.goldHi, fontWeight: 700 }}>{formatMoney(stats.dice.biggestWin)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
