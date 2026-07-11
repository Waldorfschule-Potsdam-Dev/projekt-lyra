import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Coins, RotateCw, ArrowUpDown, Cherry, RefreshCw, Wallet, TrendingUp, Trophy, Volume2, VolumeX, BarChart3, Gift, Sparkles, Clock, Rocket, Dices, Flame, Zap, User } from 'lucide-react';
import { casinoTheme, casinoGlobalCss } from './CasinoTheme';
import { useCasinoBank, formatMoney, type GameId, getFavoriteGameLabel, formatDuration, getStreakLabel, getStreakBonus } from './CasinoBank';
import { CasinoCoin } from './CasinoCoin';
import { CasinoSlot } from './CasinoSlot';
import { CasinoHiLo } from './CasinoHiLo';
import { CasinoRoulette } from './CasinoRoulette';
import { CasinoCrash } from './CasinoCrash';
import { CasinoDice } from './CasinoDice';
import { casinoSound, unlockAudio, setMuted, isMuted } from './casinoSounds';
import { CollectClueButton } from '../components/CollectClueButton';

interface CasinoPageProps {
  onExit: () => void;
}

export function CasinoPage({ onExit }: CasinoPageProps) {
  const navigate = useNavigate();
  const { balance, stats, gameState, session, placeBet, creditWinnings, addWinnings, updateStats, updateGameState, reset, triggerLuckShower, tierInfo } = useCasinoBank();
  const [lastDelta, setLastDelta] = useState<{ amount: number; key: number } | null>(null);
  const [muted, setMutedState] = useState(isMuted());
  const [showStats, setShowStats] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [luckShower, setLuckShower] = useState(false);
  const [nearMiss] = useState<number | null>(null);
  const [todayMs, setTodayMs] = useState(session.totalPlayTimeMs);
  const [tiltWarning, setTiltWarning] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const handler = () => { unlockAudio(); };
    window.addEventListener('pointerdown', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });

    if (session.bonusAmount > 0 && session.bonusClaimedDate === new Date().toISOString().slice(0, 10)) {
      setBonusAmount(session.bonusAmount);
      setShowBonusModal(true);
    }

    return () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTodayMs(session.totalPlayTimeMs);
      if (session.totalPlayTimeMs > 30 * 60 * 1000 && !tiltWarning) {
        setTiltWarning(true);
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [session.totalPlayTimeMs, tiltWarning]);

  useEffect(() => {
    if (stats.gamesPlayed > 0 && stats.gamesPlayed % 20 === 0 && !luckShower) {
      setLuckShower(true);
      triggerLuckShower();
      window.setTimeout(() => setLuckShower(false), 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.gamesPlayed]);

  const handleResult = (payout: number, wagered: number) => {
    creditWinnings(payout, wagered);
    if (payout > 0) {
      const bonus = getStreakBonus(stats.currentStreak);
      const totalDelta = payout - wagered + (bonus * wagered);
      setLastDelta({ amount: totalDelta, key: Date.now() });
      if (bonus > 0) {
        const extra = bonus * wagered;
        addWinnings(extra);
      }
      if (stats.currentStreak === 2 || stats.currentStreak === 4 || stats.currentStreak === 6 || stats.currentStreak === 9) {
        casinoSound.streak();
      }
    } else if (wagered > 0) {
      setLastDelta({ amount: -wagered, key: Date.now() });
    }
  };

  const setGame = (g: GameId) => {
    casinoSound.click();
    navigate('/browser/casino/' + g);
  };

  const handleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) {
      unlockAudio();
      casinoSound.click();
    }
  };

  const dismissBonus = () => {
    casinoSound.click();
    setShowBonusModal(false);
  };

  const tierColor: Record<string, string> = {
    Bronze: '#cd7f32',
    Silber: '#c0c0c0',
    Gold: '#ffd700',
    Platin: '#e5e4e2',
    Diamant: '#b9f2ff',
  };

  const games = [
    { id: 'slot' as const, name: 'Slots', icon: Cherry, accent: '#d4af37', desc: 'Auto-Spin, 6 Symbole', rtp: '~94%', hot: true },
    { id: 'roulette' as const, name: 'Roulette', icon: RotateCw, accent: '#dc2626', desc: 'Rot / Schwarz', rtp: '~97%' },
    { id: 'crash' as const, name: 'Crash', icon: Rocket, accent: '#ff6b00', desc: 'Cashout vor Boom!', rtp: '~96%', hot: true },
    { id: 'dice' as const, name: 'Dice', icon: Dices, accent: '#a855f7', desc: 'Über / Unter', rtp: '~97%' },
    { id: 'hilo' as const, name: 'Higher or Lower', icon: ArrowUpDown, accent: '#22c55e', desc: 'Karten, ×13/12 Multi', rtp: '~92%' },
    { id: 'coin' as const, name: 'Coin Flip', icon: Coins, accent: '#3b82f6', desc: '50/50, 1.96×', rtp: '~98%' },
  ];

  const streakLabel = getStreakLabel(stats.currentStreak);
  const streakBonus = getStreakBonus(stats.currentStreak);

  return (
    <div style={{
      height: '100%',
      display: 'flex', flexDirection: 'column',
      background: casinoTheme.bg.page,
      color: casinoTheme.text.primary,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{casinoGlobalCss}</style>

      {showBonusModal && (
        <BonusModal amount={bonusAmount} tier={tierInfo.tier} onClose={dismissBonus} />
      )}

      {luckShower && (
        <LuckShower />
      )}

      <div style={{
        background: casinoTheme.bg.glass,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${casinoTheme.border.subtle}`,
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
        position: 'relative', zIndex: 10,
        flexShrink: 0,
      }}>
        <button
          onClick={() => { casinoSound.click(); onExit(); }}
          style={{
            background: 'none', border: 'none', padding: 6, cursor: 'pointer',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = casinoTheme.bg.hover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={casinoTheme.text.primary} strokeWidth="2" strokeLinecap="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>

        <div style={{
          width: 32, height: 32,
          borderRadius: 8,
          background: `linear-gradient(135deg, ${casinoTheme.accent.gold} 0%, ${casinoTheme.accent.goldHi} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: casinoTheme.shadow.gold,
        }}>
          <Coins size={18} color={casinoTheme.text.inverse} />
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: casinoTheme.bg.panel,
            border: `1px solid ${casinoTheme.border.gold}`,
            borderRadius: 10,
            padding: '6px 12px',
          }}>
            <Wallet size={14} color={casinoTheme.accent.goldHi} />
            <span style={{
              fontSize: 16, fontWeight: 800,
              color: casinoTheme.accent.goldHi,
              fontFamily: casinoTheme.font.mono,
              letterSpacing: 0.5,
            }}>
              {formatMoney(balance)}
            </span>
            {lastDelta && (
              <span
                key={lastDelta.key}
                style={{
                  marginLeft: 4,
                  fontSize: 12, fontWeight: 700,
                  color: lastDelta.amount > 0 ? casinoTheme.accent.green : casinoTheme.accent.red,
                  fontFamily: casinoTheme.font.mono,
                  animation: 'count-up 0.4s ease-out',
                }}
              >
                {lastDelta.amount > 0 ? '+' : ''}{formatMoney(lastDelta.amount)}
              </span>
            )}
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 8px',
          background: `${tierColor[tierInfo.tier]}22`,
          border: `1px solid ${tierColor[tierInfo.tier]}66`,
          borderRadius: 6,
          fontSize: 10, fontWeight: 800,
          color: tierColor[tierInfo.tier],
          fontFamily: casinoTheme.font.mono,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          <Sparkles size={11} /> {tierInfo.tier}
        </div>

        {streakLabel && (
          <div
            title={`Streak-Bonus: +${Math.round(streakBonus * 100)}%`}
            style={{
              display: 'flex', alignItems: 'center', gap: 3,
              padding: '4px 8px',
              background: `linear-gradient(90deg, ${streakLabel.color}22 0%, ${streakLabel.color}44 100%)`,
              border: `1px solid ${streakLabel.color}`,
              borderRadius: 6,
              fontSize: 10, fontWeight: 800,
              color: streakLabel.color,
              fontFamily: casinoTheme.font.mono,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              animation: 'fire-glow 0.8s ease-in-out infinite',
              boxShadow: `0 0 8px ${streakLabel.color}66`,
            }}
          >
            <Flame size={11} /> {stats.currentStreak}
            {streakBonus > 0 && (
              <span style={{ marginLeft: 2, fontSize: 9, color: streakLabel.color }}>
                +{Math.round(streakBonus * 100)}%
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleMute}
          style={{
            background: 'none',
            border: `1px solid ${casinoTheme.border.default}`,
            borderRadius: 8,
            padding: 6, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: casinoTheme.text.secondary,
            transition: 'all 0.15s',
          }}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <button
          onClick={() => { casinoSound.click(); setShowProfile(true); }}
          style={{
            background: 'none',
            border: `1px solid ${casinoTheme.border.default}`,
            borderRadius: 8,
            padding: 6, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: casinoTheme.text.secondary,
            transition: 'all 0.15s',
          }}
        >
          <User size={16} />
        </button>

        <button
          onClick={() => { casinoSound.click(); setShowStats(true); }}
          style={{
            background: 'none',
            border: `1px solid ${casinoTheme.border.default}`,
            borderRadius: 8,
            padding: 6, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: casinoTheme.text.secondary,
            transition: 'all 0.15s',
          }}
        >
          <BarChart3 size={16} />
        </button>

        <button
          onClick={() => {
            if (window.confirm('Kontostand auf $1.000 zurücksetzen? Alle Statistiken gehen verloren.')) {
              casinoSound.click();
              reset();
            }
          }}
          style={{
            background: 'none',
            border: `1px solid ${casinoTheme.border.default}`,
            borderRadius: 8,
            padding: 6, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: casinoTheme.text.secondary,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = casinoTheme.bg.hover;
            e.currentTarget.style.color = casinoTheme.accent.goldHi;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = casinoTheme.text.secondary;
          }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {tiltWarning && (
        <Routes>
          <Route path="lobby" element={null} />
          <Route path="*" element={
            <div style={{
              padding: '6px 12px',
              background: 'rgba(239, 68, 68, 0.15)',
              borderBottom: `1px solid ${casinoTheme.accent.red}`,
              color: casinoTheme.accent.red,
              fontSize: 11, fontWeight: 700,
              fontFamily: casinoTheme.font.mono,
              textAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Clock size={12} /> {formatDuration(todayMs)} gespielt · gönn dir eine Pause
              <button
                onClick={() => { casinoSound.click(); setTiltWarning(false); }}
                style={{
                  background: 'none', border: 'none',
                  color: casinoTheme.accent.red, cursor: 'pointer',
                  fontSize: 14, padding: 0, marginLeft: 8,
                }}
              >×</button>
            </div>
          } />
        </Routes>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/browser/casino/lobby" replace />} />
        <Route path="lobby" element={
          <Lobby
            games={games}
            stats={stats}
            session={session}
            tierInfo={tierInfo}
            onSelect={setGame}
            balance={balance}
          />
        } />
        <Route path="*" element={
          <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }} className="casino-scroll">
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
              <button
                onClick={() => setGame('lobby')}
                style={{
                  background: 'none',
                  border: `1px solid ${casinoTheme.border.default}`,
                  borderRadius: 9999,
                  padding: '4px 12px',
                  color: casinoTheme.text.secondary,
                  fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  cursor: 'pointer',
                  fontFamily: casinoTheme.font.mono,
                }}
              >
                Zur Lobby
              </button>
            </div>
            <Routes>
              <Route path="coin" element={<CasinoCoin balance={balance} onBet={placeBet} onResult={handleResult} stats={stats} gameState={gameState} updateGameState={updateGameState} updateStats={updateStats} />} />
              <Route path="slot" element={<CasinoSlot balance={balance} onBet={placeBet} onResult={handleResult} stats={stats} gameState={gameState} updateGameState={updateGameState} updateStats={updateStats} />} />
              <Route path="hilo" element={<CasinoHiLo balance={balance} onBet={placeBet} onResult={handleResult} stats={stats} gameState={gameState} updateGameState={updateGameState} updateStats={updateStats} />} />
              <Route path="roulette" element={<CasinoRoulette balance={balance} onBet={placeBet} onResult={handleResult} stats={stats} gameState={gameState} updateGameState={updateGameState} updateStats={updateStats} nearMiss={nearMiss} />} />
              <Route path="crash" element={<CasinoCrash balance={balance} onBet={placeBet} onResult={handleResult} stats={stats} gameState={gameState} updateGameState={updateGameState} updateStats={updateStats} />} />
              <Route path="dice" element={<CasinoDice balance={balance} onBet={placeBet} onResult={handleResult} stats={stats} gameState={gameState} updateGameState={updateGameState} updateStats={updateStats} />} />
            </Routes>
          </div>
        } />
      </Routes>

      {showStats && (
        <StatsModal stats={stats} session={session} tierInfo={tierInfo} balance={balance} onClose={() => { casinoSound.click(); setShowStats(false); }} />
      )}

      {showProfile && (
        <PlayerProfileModal stats={stats} session={session} tierInfo={tierInfo} balance={balance} todayMs={todayMs} onClose={() => { casinoSound.click(); setShowProfile(false); }} />
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Lobby({ games, stats, session, tierInfo, onSelect, balance }: { games: Array<{ id: GameId; name: string; icon: typeof Coins; accent: string; desc: string; rtp: string }>; stats: ReturnType<typeof useCasinoBank>['stats']; session: ReturnType<typeof useCasinoBank>['session']; tierInfo: ReturnType<typeof useCasinoBank>['tierInfo']; onSelect: (id: GameId) => void; balance: number }) {
  const net = stats.totalNet;
  const tierColor: Record<string, string> = {
    Bronze: '#cd7f32', Silber: '#c0c0c0', Gold: '#ffd700', Platin: '#e5e4e2', Diamant: '#b9f2ff',
  };
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 16 }} className="casino-scroll">
      <div style={{
        textAlign: 'center',
        padding: '24px 0 20px',
        background: `linear-gradient(180deg, ${casinoTheme.accent.goldSoft} 0%, transparent 100%)`,
        borderRadius: 16,
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <div style={{
            fontSize: 32, fontWeight: 800,
            color: casinoTheme.accent.goldHi,
            fontFamily: casinoTheme.font.display,
            letterSpacing: 2,
            textShadow: `0 0 16px rgba(212,175,55,0.3)`,
          }}>
            BLACK DIAMOND
          </div>
        </div>
        <div style={{
          fontSize: 11, color: casinoTheme.text.tertiary,
          fontFamily: casinoTheme.font.mono,
          letterSpacing: 3,
          textTransform: 'uppercase',
          marginTop: 4,
        }}>
          Casino Royale · since 1947
        </div>
      </div>

      <div style={{
        padding: 12,
        background: `linear-gradient(135deg, ${tierColor[tierInfo.tier]}11 0%, ${casinoTheme.bg.panel} 100%)`,
        border: `1px solid ${tierColor[tierInfo.tier]}44`,
        borderRadius: 12,
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{
              fontSize: 10, color: casinoTheme.text.tertiary,
              fontFamily: casinoTheme.font.mono, letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              Treue-Tier
            </div>
            <div style={{
              fontSize: 18, fontWeight: 800,
              color: tierColor[tierInfo.tier],
              fontFamily: casinoTheme.font.display,
              textShadow: `0 0 8px ${tierColor[tierInfo.tier]}66`,
            }}>
              ✦ {tierInfo.tier}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 10, color: casinoTheme.text.tertiary,
              fontFamily: casinoTheme.font.mono, letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              Login-Streak
            </div>
            <div style={{
              fontSize: 18, fontWeight: 800,
              color: casinoTheme.accent.goldHi,
              fontFamily: casinoTheme.font.mono,
            }}>
              🔥 {session.loginStreak}d
            </div>
          </div>
        </div>
        <div style={{ height: 6, background: casinoTheme.bg.page, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: `${tierInfo.progress * 100}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${tierColor[tierInfo.tier]} 0%, ${casinoTheme.accent.goldHi} 100%)`,
            transition: 'width 0.4s',
          }} />
        </div>
        <div style={{
          fontSize: 10, color: casinoTheme.text.tertiary,
          fontFamily: casinoTheme.font.mono, textAlign: 'right',
          marginTop: 4,
        }}>
          {stats.gamesPlayed} Spiele · Nächstes Tier: {tierInfo.tier === 'Diamant' ? 'MAX' : '...'}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        marginBottom: 16,
      }}>
        <StatTile
          icon={<TrendingUp size={14} />}
          label="Netto"
          value={`${net >= 0 ? '+' : ''}${formatMoney(net)}`}
          color={net >= 0 ? casinoTheme.accent.green : casinoTheme.accent.red}
        />
        <StatTile
          icon={<Trophy size={14} />}
          label="Bester Streak"
          value={`${stats.bestStreak}×`}
        />
        <StatTile
          icon={<Coins size={14} />}
          label="Einsätze"
          value={formatMoney(stats.totalWagered)}
        />
        <StatTile
          icon={<Wallet size={14} />}
          label="Größter Gewinn"
          value={formatMoney(stats.biggestWin)}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
      }}>
        {games.map(g => {
          const Icon = g.icon;
          const isHot = 'hot' in g && g.hot;
          return (
            <button
              key={g.id}
              onClick={() => onSelect(g.id)}
              disabled={balance === 0}
              style={{
                position: 'relative',
                padding: 16,
                border: `1px solid ${isHot ? '#ff6b00' : casinoTheme.border.default}`,
                borderRadius: 16,
                background: isHot
                  ? `linear-gradient(135deg, ${g.accent}22 0%, ${casinoTheme.bg.panel} 100%)`
                  : casinoTheme.bg.panel,
                cursor: balance === 0 ? 'not-allowed' : 'pointer',
                opacity: balance === 0 ? 0.4 : 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                transition: 'all 0.15s',
                fontFamily: casinoTheme.font.system,
                textAlign: 'left',
                boxShadow: isHot ? `0 0 16px ${g.accent}55, 0 4px 12px rgba(0,0,0,0.3)` : 'none',
                animation: isHot ? 'mega-pulse 2s ease-in-out infinite' : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = g.accent;
                e.currentTarget.style.background = casinoTheme.bg.panelHi;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isHot ? '#ff6b00' : casinoTheme.border.default;
                e.currentTarget.style.background = isHot
                  ? `linear-gradient(135deg, ${g.accent}22 0%, ${casinoTheme.bg.panel} 100%)`
                  : casinoTheme.bg.panel;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {isHot && (
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  display: 'flex', alignItems: 'center', gap: 2,
                  padding: '2px 6px',
                  background: '#ff6b00',
                  color: '#fff',
                  borderRadius: 9999,
                  fontSize: 8, fontWeight: 800,
                  fontFamily: casinoTheme.font.mono,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  animation: 'fire-glow 0.8s ease-in-out infinite',
                }}>
                  <Flame size={8} /> HOT
                </div>
              )}
              <div style={{
                width: 48, height: 48,
                borderRadius: 12,
                background: `${g.accent}22`,
                border: `1px solid ${g.accent}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={24} color={g.accent} />
              </div>
              <div style={{
                fontSize: 14, fontWeight: 800,
                color: casinoTheme.text.primary,
              }}>
                {g.name}
              </div>
              <div style={{
                fontSize: 10, color: casinoTheme.text.tertiary,
                fontFamily: casinoTheme.font.mono,
                letterSpacing: 0.5,
              }}>
                {g.desc}
              </div>
              <div style={{
                fontSize: 9, color: casinoTheme.accent.goldHi,
                fontFamily: casinoTheme.font.mono,
                fontWeight: 700,
                padding: '2px 6px',
                background: casinoTheme.accent.goldSoft,
                borderRadius: 4,
                letterSpacing: 1,
              }}>
                RTP {g.rtp}
              </div>
            </button>
          );
        })}
      </div>

      {balance === 0 && (
        <div style={{
          marginTop: 16,
          padding: 16,
          background: 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${casinoTheme.accent.red}`,
          borderRadius: 12,
          textAlign: 'center',
          color: casinoTheme.accent.red,
          fontSize: 13,
          fontWeight: 700,
          fontFamily: casinoTheme.font.system,
        }}>
          Kontostand leer · oben auf ↻ tippen zum Zurücksetzen
        </div>
      )}
    </div>
  );
}

function StatTile({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: casinoTheme.bg.panel,
      border: `1px solid ${casinoTheme.border.subtle}`,
      borderRadius: 10,
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        fontSize: 9, color: casinoTheme.text.tertiary,
        fontFamily: casinoTheme.font.mono,
        textTransform: 'uppercase',
        letterSpacing: 1,
      }}>
        {icon}
        {label}
      </div>
      <div style={{
        fontSize: 13, fontWeight: 800,
        color: color || casinoTheme.accent.goldHi,
        fontFamily: casinoTheme.font.mono,
      }}>
        {value}
      </div>
    </div>
  );
}

function BonusModal({ amount, tier, onClose }: { amount: number; tier: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.8)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: 32,
          background: 'linear-gradient(135deg, #1a0f08 0%, #0a0604 100%)',
          border: `3px solid ${casinoTheme.accent.goldHi}`,
          borderRadius: 20,
          textAlign: 'center',
          maxWidth: 320, width: '100%',
          boxShadow: `0 0 60px ${casinoTheme.accent.goldHi}, 0 0 120px ${casinoTheme.accent.gold}`,
          animation: 'bounce-in 0.6s ease-out',
        }}
      >
        <div style={{
          fontSize: 12, color: casinoTheme.accent.goldHi,
          fontFamily: casinoTheme.font.mono, letterSpacing: 4,
          textTransform: 'uppercase', marginBottom: 8,
        }}>
          Täglicher Login-Bonus
        </div>
        <div style={{
          fontSize: 64, marginBottom: 8,
          animation: 'coin-bounce 1.2s ease-in-out infinite',
          display: 'inline-block',
        }}>
          💰
        </div>
        <div style={{
          fontSize: 36, fontWeight: 800,
          color: casinoTheme.accent.goldHi,
          fontFamily: casinoTheme.font.display,
          textShadow: `0 0 16px ${casinoTheme.accent.goldHi}, 0 0 32px ${casinoTheme.accent.gold}`,
          marginBottom: 4,
        }}>
          +{formatMoney(amount)}
        </div>
        <div style={{
          fontSize: 12, color: casinoTheme.text.secondary,
          fontFamily: casinoTheme.font.mono,
          marginBottom: 16,
        }}>
          {tier}-Spieler-Bonus · wurde deinem Konto gutgeschrieben
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '12px 32px',
            border: 'none',
            borderRadius: 9999,
            background: `linear-gradient(135deg, ${casinoTheme.accent.gold} 0%, ${casinoTheme.accent.goldHi} 100%)`,
            color: casinoTheme.text.inverse,
            fontSize: 14, fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 1,
            cursor: 'pointer',
            fontFamily: casinoTheme.font.system,
            boxShadow: casinoTheme.shadow.gold,
          }}
        >
          Danke!
        </button>
      </div>
    </div>
  );
}

function LuckShower() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 95, overflow: 'hidden' }}>
      {Array.from({ length: 30 }).map((_, i) => {
        const emojis = ['💰', '💎', '🍀', '⭐', '🎰'];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: -30,
              left: `${(i * 11) % 100}%`,
              fontSize: 22,
              animation: `gold-rain 2.5s ease-in ${(i % 6) * 0.15}s forwards`,
            } as React.CSSProperties}
          >
            {emojis[i % emojis.length]}
          </div>
        );
      })}
      <div style={{
        position: 'absolute', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '20px 40px',
        background: 'linear-gradient(135deg, #1a0f08 0%, #0a0604 100%)',
        border: `2px solid ${casinoTheme.accent.goldHi}`,
        borderRadius: 16,
        boxShadow: `0 0 40px ${casinoTheme.accent.goldHi}`,
        textAlign: 'center',
        animation: 'jackpot-text 0.8s ease-out',
      }}>
        <div style={{
          fontSize: 12, color: casinoTheme.accent.goldHi,
          fontFamily: casinoTheme.font.mono, letterSpacing: 3,
          textTransform: 'uppercase',
        }}>
          ☘ Glücksfee ☘
        </div>
        <div style={{
          fontSize: 28, fontWeight: 800,
          color: casinoTheme.accent.goldHi,
          fontFamily: casinoTheme.font.display,
          marginTop: 4,
          textShadow: `0 0 12px ${casinoTheme.accent.goldHi}`,
        }}>
          +$100
        </div>
      </div>
    </div>
  );
}

function PlayerProfileModal({ onClose }: { stats: ReturnType<typeof useCasinoBank>['stats']; session: ReturnType<typeof useCasinoBank>['session']; tierInfo: ReturnType<typeof useCasinoBank>['tierInfo']; balance: number; todayMs: number; onClose: () => void }) {
  // Fixe Story-Daten – unabhängig von der tatsächlichen Spielzeit des Spielers
  const features: Array<[string, string, boolean?]> = [
    ['Mitglied seit', 'März 2024 (14 Monate)'],
    ['Bevorzugtes Spiel', 'Slots, Crash'],
    ['Spielhäufigkeit', '15–21 Sitzungen pro Monat'],
    ['Durchschn. Sitzungsdauer', '2 – 4 Stunden'],
    ['Durchschn. Einsatz', '$85 – $340 pro Sitzung'],
    ['Gesamteinsatz (kumuliert)', '$48.200', true],
    ['Gesamtgewinn (kumuliert)', '$35.800'],
    ['Nettoverlust gesamt', '−$12.400', true],
    ['Übliche Spielzeit', '22:00 – 02:00 Uhr', true],
    ['Bonusangebote', 'Tägliche Nutzung'],
    ['Zahlungsmethode', 'Banküberweisung (Privatkonto)'],
    ['Spielpausen', 'Selten – keine Pause > 3 Tage', true],
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: casinoTheme.bg.panel,
          border: `1px solid ${casinoTheme.border.gold}`,
          borderRadius: 16,
          padding: 20,
          maxWidth: 420, width: '100%',
          maxHeight: '90vh', overflowY: 'auto',
          fontFamily: casinoTheme.font.system,
          animation: 'bounce-in 0.4s ease-out',
        }}
        className="casino-scroll"
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <div style={{
                fontSize: 10, color: casinoTheme.text.tertiary,
                fontFamily: casinoTheme.font.mono, letterSpacing: 2,
                textTransform: 'uppercase',
              }}>
                Spieler-Profil
              </div>
              <div style={{
                fontSize: 18, fontWeight: 800,
                color: casinoTheme.accent.goldHi,
                fontFamily: casinoTheme.font.display,
                letterSpacing: 1,
                marginTop: 2,
              }}>
                BLACK DIAMOND
              </div>
            </div>
            <CollectClueButton clueId="browser:casino-addiction" size={16} />
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: casinoTheme.text.secondary,
              fontSize: 24, cursor: 'pointer', padding: 0, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: 12,
          background: casinoTheme.bg.page,
          border: `1px solid ${casinoTheme.border.subtle}`,
          borderRadius: 10,
          marginBottom: 12,
        }}>
          <div style={{
            width: 50, height: 50,
            borderRadius: '50%',
            background: `linear-gradient(135deg, #cd7f32 0%, #d4af37 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800,
            color: '#fff',
            fontFamily: casinoTheme.font.display,
            boxShadow: '0 0 12px rgba(212,175,55,0.4)',
          }}>
            D
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Dr. Daniel Seidt</div>
            <div style={{
              fontSize: 10, color: casinoTheme.text.tertiary,
              fontFamily: casinoTheme.font.mono, letterSpacing: 1,
            }}>
              Diamant-Mitglied · Login-Streak 47d
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 10, color: casinoTheme.accent.goldHi,
            fontFamily: casinoTheme.font.mono, letterSpacing: 2,
            textTransform: 'uppercase', marginBottom: 6, fontWeight: 700,
          }}>
            Merkmal · Angabe
          </div>
          <div style={{
            background: casinoTheme.bg.page,
            border: `1px solid ${casinoTheme.border.subtle}`,
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            {features.map(([key, val, warn], i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 12px',
                borderBottom: i < features.length - 1 ? `1px solid ${casinoTheme.border.subtle}` : 'none',
                fontFamily: casinoTheme.font.mono, fontSize: 12,
                background: warn ? 'rgba(239, 68, 68, 0.07)' : 'transparent',
              }}>
                <span style={{ color: warn ? casinoTheme.accent.red : casinoTheme.text.secondary }}>{key}</span>
                <span style={{ color: warn ? casinoTheme.accent.red : casinoTheme.accent.goldHi, fontWeight: 700, textAlign: 'right' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 10, color: casinoTheme.text.tertiary, fontStyle: 'italic', textAlign: 'center', fontFamily: casinoTheme.font.mono }}>
          Automatisch generiertes Spielerprofil · Erstellt: 02.07.2025
        </div>
      </div>
    </div>
  );
}

function StatsModal({ stats, session, balance, onClose }: { stats: ReturnType<typeof useCasinoBank>['stats']; session: ReturnType<typeof useCasinoBank>['session']; tierInfo: ReturnType<typeof useCasinoBank>['tierInfo']; balance: number; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: casinoTheme.bg.panel,
          border: `1px solid ${casinoTheme.border.gold}`,
          borderRadius: 16,
          padding: 20,
          maxWidth: 380, width: '100%',
          maxHeight: '85vh', overflowY: 'auto',
          fontFamily: casinoTheme.font.system,
        }}
        className="casino-scroll"
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 16,
        }}>
          <div style={{
            fontSize: 18, fontWeight: 800,
            color: casinoTheme.accent.goldHi,
            fontFamily: casinoTheme.font.display,
            letterSpacing: 1,
          }}>
            Deine Statistik
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: casinoTheme.text.secondary,
              fontSize: 24, cursor: 'pointer', padding: 0, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <StatGroup title="Allgemein">
            <StatRow label="Aktueller Kontostand" value={formatMoney(balance)} highlight />
            <StatRow label="Gesamt-Einsatz" value={formatMoney(stats.totalWagered)} />
            <StatRow label="Gesamt-Gewinn (ausgezahlt)" value={formatMoney(stats.totalWon)} />
            <StatRow label="Netto" value={`${stats.totalNet >= 0 ? '+' : ''}${formatMoney(stats.totalNet)}`} accent={stats.totalNet >= 0 ? casinoTheme.accent.green : casinoTheme.accent.red} />
            <StatRow label="Größter Einzel-Gewinn" value={formatMoney(stats.biggestWin)} />
            <StatRow label="Spiele gespielt" value={String(stats.gamesPlayed)} />
            <StatRow label="Spielzeit" value={formatDuration(session.totalPlayTimeMs)} />
            <StatRow label="Aktueller Streak" value={`${stats.currentStreak}×`} />
            <StatRow label="Bester Streak" value={`${stats.bestStreak}×`} />
          </StatGroup>

          {stats.coin.totalFlips > 0 && (
            <StatGroup title="Coin Flip">
              <StatRow label="Würfe gesamt" value={String(stats.coin.totalFlips)} />
              <StatRow label="Kopf" value={String(stats.coin.heads)} />
              <StatRow label="Zahl" value={String(stats.coin.tails)} />
            </StatGroup>
          )}

          {stats.slot.spins > 0 && (
            <StatGroup title="Slots">
              <StatRow label="Spins" value={String(stats.slot.spins)} />
              <StatRow label="Drillinge" value={String(stats.slot.threeOfAKind)} />
              <StatRow label="Paare" value={String(stats.slot.twoOfAKind)} />
              {stats.slot.biggestSymbolWin && <StatRow label="Top-Symbol" value={stats.slot.biggestSymbolWin} />}
              <StatRow label="Top-Gewinn" value={formatMoney(stats.slot.biggestPayout)} />
            </StatGroup>
          )}

          {(stats.hilo.gamesCashed + stats.hilo.gamesLost) > 0 && (
            <StatGroup title="Higher or Lower">
              <StatRow label="Bester Streak" value={`${stats.hilo.bestStreak}×`} />
              <StatRow label="Cashed Out" value={String(stats.hilo.gamesCashed)} />
              <StatRow label="Verloren" value={String(stats.hilo.gamesLost)} />
              <StatRow label="Gesamt-Cashed" value={formatMoney(stats.hilo.totalCashed)} />
            </StatGroup>
          )}

          {stats.roulette.spins > 0 && (
            <StatGroup title="Roulette">
              <StatRow label="Spins" value={String(stats.roulette.spins)} />
              <StatRow label="Rot" value={String(stats.roulette.redHits)} />
              <StatRow label="Schwarz" value={String(stats.roulette.blackHits)} />
              <StatRow label="Grün (Zero)" value={String(stats.roulette.greenHits)} />
              <StatRow label="Direkt-Treffer" value={String(stats.roulette.straightUps)} />
              <StatRow label="Top-Gewinn" value={formatMoney(stats.roulette.biggestPayout)} />
            </StatGroup>
          )}
        </div>
      </div>
    </div>
  );
}

function StatGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: 10, color: casinoTheme.accent.goldHi,
        fontFamily: casinoTheme.font.mono,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 6,
        fontWeight: 700,
      }}>
        {title}
      </div>
      <div style={{
        background: casinoTheme.bg.page,
        border: `1px solid ${casinoTheme.border.subtle}`,
        borderRadius: 8,
        padding: 10,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {children}
      </div>
    </div>
  );
}

function StatRow({ label, value, accent, highlight }: { label: string; value: string; accent?: string; highlight?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: casinoTheme.font.mono, fontSize: 12,
      padding: '2px 0',
    }}>
      <span style={{ color: casinoTheme.text.secondary }}>{label}</span>
      <span style={{
        color: accent || (highlight ? casinoTheme.accent.goldHi : casinoTheme.text.primary),
        fontWeight: highlight ? 700 : 600,
      }}>
        {value}
      </span>
    </div>
  );
}
