import { useState } from 'react';
import { casinoTheme, casinoGlobalCss } from './CasinoTheme';
import { formatMoney, type CasinoStats, type CasinoGameState } from './CasinoBank';
import { casinoSound } from './casinoSounds';
import { BetPicker } from './CasinoBetPicker';

interface CasinoCoinProps {
  balance: number;
  onBet: (amount: number) => boolean;
  onResult: (payout: number, wagered: number) => void;
  stats: CasinoStats;
  gameState: CasinoGameState;
  updateGameState: (updater: (s: CasinoGameState) => CasinoGameState) => void;
  updateStats: (updater: (s: CasinoStats) => CasinoStats) => void;
}

type Side = 'heads' | 'tails';

export function CasinoCoin({ balance, onBet, onResult, stats, gameState, updateGameState, updateStats }: CasinoCoinProps) {
  const bet = gameState.coinBet;
  const side = gameState.coinSide;
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<{ side: Side; won: boolean; payout: number } | null>(null);
  const [shake, setShake] = useState(false);

  const setBet = (v: number) => updateGameState(s => ({ ...s, coinBet: v }));
  const setSide = (s: Side) => { casinoSound.click(); updateGameState(st => ({ ...st, coinSide: s })); };

  const handleFlip = () => {
    if (flipping || bet <= 0 || bet > balance) return;
    if (!onBet(bet)) return;

    setFlipping(true);
    setResult(null);
    setShake(false);
    casinoSound.coinFlip();

    window.setTimeout(() => {
      const outcome: Side = Math.random() < 0.5 ? 'heads' : 'tails';
      const won = outcome === side;
      const payout = won ? bet * 1.96 : 0;
      setResult({ side: outcome, won, payout });
      onResult(payout, bet);
      updateStats(s => ({
        ...s,
        coin: {
          ...s.coin,
          totalFlips: s.coin.totalFlips + 1,
          heads: s.coin.heads + (outcome === 'heads' ? 1 : 0),
          tails: s.coin.tails + (outcome === 'tails' ? 1 : 0),
        },
      }));
      if (won) {
        casinoSound.coinWin();
        if (outcome === 'heads') casinoSound.coinLandHeads();
        else casinoSound.coinLandTails();
      } else {
        casinoSound.coinLose();
        setShake(true);
        window.setTimeout(() => setShake(false), 400);
      }
      setFlipping(false);
    }, 2200);
  };

  const potentialWin = bet * 1.96;
  const total = stats.coin.totalFlips;
  const headsPct = total > 0 ? Math.round((stats.coin.heads / total) * 100) : 0;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 16, padding: 16,
      animation: shake ? 'screen-shake 0.4s ease-out' : 'none',
    }}>
      <style>{casinoGlobalCss}</style>

      <div style={{
        textAlign: 'center',
        fontSize: 11,
        color: casinoTheme.text.tertiary,
        fontFamily: casinoTheme.font.mono,
        letterSpacing: 2,
        textTransform: 'uppercase',
      }}>
        50 / 50 · Auszahlung 1.96x
      </div>

      {result && !flipping && result.won && (
        <div style={{ position: 'relative', height: 0, pointerEvents: 'none' }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * Math.PI * 2;
            const dist = 100 + (i % 3) * 30;
            return (
              <div
                key={`coin-${i}`}
                style={{
                  position: 'absolute',
                  left: '50%', top: 100,
                  width: 8, height: 8,
                  marginLeft: -4,
                  borderRadius: '50%',
                  background: i % 3 === 0 ? '#f0c850' : i % 3 === 1 ? '#d4af37' : '#fff',
                  boxShadow: `0 0 10px #d4af37`,
                  animation: `sparkle 1.5s ease-out ${i * 0.04}s forwards`,
                  ['--sx' as string]: `${Math.cos(angle) * dist}px`,
                  ['--sy' as string]: `${Math.sin(angle) * dist - 50}px`,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      )}

      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: 220,
        position: 'relative',
        perspective: 1000,
      }}>
        {result && !flipping && (
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            background: result.won
              ? `radial-gradient(circle, ${casinoTheme.accent.goldSoft} 0%, transparent 70%)`
              : 'transparent',
            animation: 'burst-ring 0.6s ease-out',
            pointerEvents: 'none',
          }} />
        )}
        <div style={{
          width: 180, height: 180,
          borderRadius: '50%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: flipping ? 'transform 2.2s cubic-bezier(0.3, 0.1, 0.3, 1)' : 'none',
          transform: flipping
            ? 'rotateY(1800deg)'
            : result
              ? `rotateY(${result.side === 'heads' ? 0 : 180}deg) ${result.won ? 'scale(1.1)' : 'scale(0.95)'}`
              : 'rotateY(0)',
          animation: result && !flipping ? (result.won ? 'coin-bounce 0.6s ease-out' : 'shake 0.4s ease-out') : 'none',
          filter: result && !flipping && result.won ? `drop-shadow(0 0 28px ${casinoTheme.accent.goldHi})` : 'none',
        }}>
          <CoinFace side="heads" />
          <CoinFace side="tails" back />
        </div>
      </div>

      {result && !flipping && (
        <div style={{
          textAlign: 'center',
          padding: '14px 16px',
          borderRadius: 12,
          background: result.won ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${result.won ? casinoTheme.accent.green : casinoTheme.accent.red}`,
          animation: `${result.won ? 'win-flash' : 'lose-flash'} 0.6s ease-out`,
        }}>
          <div style={{
            fontSize: 24, fontWeight: 800,
            color: result.won ? casinoTheme.accent.green : casinoTheme.accent.red,
            fontFamily: casinoTheme.font.system,
            animation: result.won ? 'win-zoom 0.5s ease-out' : 'none',
            textShadow: result.won ? `0 0 12px ${casinoTheme.accent.green}` : 'none',
          }}>
            {result.won ? `+${formatMoney(result.payout)}` : 'Verloren'}
          </div>
          <div style={{
            fontSize: 11, color: casinoTheme.text.secondary,
            marginTop: 2, fontFamily: casinoTheme.font.mono,
            letterSpacing: 1, textTransform: 'uppercase',
          }}>
            {result.side === 'heads' ? 'Kopf' : 'Zahl'}
          </div>
        </div>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
      }}>
        <SideButton
          active={side === 'heads'}
          onClick={() => setSide('heads')}
          disabled={flipping}
        >
          Kopf
        </SideButton>
        <SideButton
          active={side === 'tails'}
          onClick={() => setSide('tails')}
          disabled={flipping}
        >
          Zahl
        </SideButton>
      </div>

      {stats.coin.totalFlips > 0 && (
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
            Verteilung · {total} Würfe
          </div>
          <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ width: `${headsPct}%`, background: casinoTheme.accent.goldHi, transition: 'width 0.3s' }} />
            <div style={{ flex: 1, background: casinoTheme.accent.red }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: casinoTheme.accent.goldHi }}>Kopf {headsPct}%</span>
            <span style={{ color: casinoTheme.accent.red }}>Zahl {100 - headsPct}%</span>
          </div>
        </div>
      )}

      <BetPicker
        label="Einsatz"
        value={bet}
        max={balance}
        disabled={flipping}
        onChange={setBet}
        onSound={casinoSound.click}
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
        <span style={{ color: casinoTheme.accent.goldHi, fontWeight: 700 }}>{formatMoney(potentialWin)}</span>
      </div>

      <button
        onClick={handleFlip}
        disabled={flipping || bet <= 0 || bet > balance}
        style={{
          width: '100%',
          padding: '16px 0',
          border: 'none',
          borderRadius: 12,
          background: flipping
            ? casinoTheme.bg.panelHi
            : `linear-gradient(135deg, ${casinoTheme.accent.gold} 0%, ${casinoTheme.accent.goldHi} 100%)`,
          color: flipping ? casinoTheme.text.tertiary : casinoTheme.text.inverse,
          fontSize: 16, fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
          cursor: flipping ? 'not-allowed' : 'pointer',
          fontFamily: casinoTheme.font.system,
          boxShadow: flipping ? 'none' : casinoTheme.shadow.gold,
          transition: 'all 0.15s',
        }}
      >
        {flipping ? 'Münze fliegt…' : 'Werfen'}
      </button>
    </div>
  );
}

function CoinFace({ side, back = false }: { side: Side; back?: boolean }) {
  const label = side === 'heads' ? 'K' : 'Z';
  return (
    <div style={{
      position: back ? 'absolute' : 'relative',
      top: 0, left: 0,
      width: '100%', height: '100%',
      backfaceVisibility: 'hidden',
      transform: back ? 'rotateY(180deg)' : 'none',
      borderRadius: '50%',
      background: `radial-gradient(circle at 30% 30%, ${casinoTheme.accent.goldHi} 0%, ${casinoTheme.accent.gold} 60%, #8a6e1f 100%)`,
      border: `6px solid ${casinoTheme.accent.goldHi}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `inset 0 0 30px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.5)`,
    }}>
      <div style={{
        fontSize: 72, fontWeight: 800,
        color: '#5a4818',
        fontFamily: casinoTheme.font.display,
        textShadow: '0 2px 0 rgba(255,255,255,0.3)',
      }}>
        {label}
      </div>
    </div>
  );
}

function SideButton({ active, onClick, children, disabled }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '16px 0',
        border: `1px solid ${active ? casinoTheme.accent.gold : casinoTheme.border.default}`,
        borderRadius: 12,
        background: active ? casinoTheme.accent.goldSoft : casinoTheme.bg.panel,
        color: active ? casinoTheme.accent.goldHi : casinoTheme.text.primary,
        fontSize: 15, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: casinoTheme.font.system,
        textTransform: 'uppercase',
        letterSpacing: 1,
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}
