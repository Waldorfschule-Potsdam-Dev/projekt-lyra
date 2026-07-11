import { useState, useEffect, useCallback, useRef } from 'react';

const BANK_KEY = 'casino-bank-balance';
const STATS_KEY = 'casino-bank-stats';
const STATE_KEY = 'casino-game-state';
const SESSION_KEY = 'casino-session';
const ACHIEVEMENTS_KEY = 'casino-achievements';

export interface CoinStats {
  heads: number;
  tails: number;
  totalFlips: number;
}

export interface SlotStats {
  threeOfAKind: number;
  twoOfAKind: number;
  spins: number;
  biggestSymbolWin: string;
  biggestPayout: number;
}

export interface HiLoStats {
  bestStreak: number;
  gamesLost: number;
  gamesCashed: number;
  totalCashed: number;
}

export interface CrashStats {
  rounds: number;
  crashes: number;
  cashouts: number;
  bestMultiplier: number;
  biggestWin: number;
  totalCashed: number;
}

export interface DiceStats {
  rolls: number;
  wins: number;
  losses: number;
  bestStreak: number;
  biggestWin: number;
  totalWon: number;
}

export interface RouletteStats {
  spins: number;
  lastNumbers: number[];
  redHits: number;
  blackHits: number;
  greenHits: number;
  evenHits: number;
  oddHits: number;
  lowHits: number;
  highHits: number;
  straightUps: number;
  biggestPayout: number;
  hotStreak: { number: number; count: number }[];
}

export interface CasinoStats {
  totalWagered: number;
  totalWon: number;
  totalNet: number;
  gamesPlayed: number;
  biggestWin: number;
  currentStreak: number;
  bestStreak: number;
  coin: CoinStats;
  slot: SlotStats;
  hilo: HiLoStats;
  roulette: RouletteStats;
  crash: CrashStats;
  dice: DiceStats;
}

const DEFAULT_STATS: CasinoStats = {
  totalWagered: 0,
  totalWon: 0,
  totalNet: 0,
  gamesPlayed: 0,
  biggestWin: 0,
  currentStreak: 0,
  bestStreak: 0,
  coin: { heads: 0, tails: 0, totalFlips: 0 },
  slot: { threeOfAKind: 0, twoOfAKind: 0, spins: 0, biggestSymbolWin: '', biggestPayout: 0 },
  hilo: { bestStreak: 0, gamesLost: 0, gamesCashed: 0, totalCashed: 0 },
  roulette: {
    spins: 0, lastNumbers: [], redHits: 0, blackHits: 0, greenHits: 0,
    evenHits: 0, oddHits: 0, lowHits: 0, highHits: 0, straightUps: 0,
    biggestPayout: 0, hotStreak: [],
  },
  crash: { rounds: 0, crashes: 0, cashouts: 0, bestMultiplier: 0, biggestWin: 0, totalCashed: 0 },
  dice: { rolls: 0, wins: 0, losses: 0, bestStreak: 0, biggestWin: 0, totalWon: 0 },
};

export type GameId = 'lobby' | 'coin' | 'slot' | 'hilo' | 'roulette' | 'crash' | 'dice';

export interface CasinoGameState {
  game: GameId;
  coinBet: number;
  coinSide: 'heads' | 'tails';
  slotBet: number;
  slotAutoSpins: number;
  hiloBet: number;
  hiloCurrent: { rank: string; suit: string } | null;
  hiloStreak: number;
  hiloPhase: 'idle' | 'guessing';
  rouletteChip: number;
  rouletteBets: { type: string; amount: number }[];
  crashBet: number;
  crashAutoCashout: number;
  diceBet: number;
  diceTarget: number;
  diceDirection: 'over' | 'under';
  diceRoll: number | null;
}

const DEFAULT_STATE: CasinoGameState = {
  game: 'lobby',
  coinBet: 25,
  coinSide: 'heads',
  slotBet: 25,
  slotAutoSpins: 0,
  hiloBet: 25,
  hiloCurrent: null,
  hiloStreak: 0,
  hiloPhase: 'idle',
  rouletteChip: 25,
  rouletteBets: [],
  crashBet: 25,
  crashAutoCashout: 2,
  diceBet: 25,
  diceTarget: 50,
  diceDirection: 'over',
  diceRoll: null,
};

export interface CasinoSession {
  sessionCount: number;
  lastSessionDate: string;
  loginStreak: number;
  longestLoginStreak: number;
  totalPlayTimeMs: number;
  sessionStart: number;
  bonusClaimedDate: string | null;
  bonusAmount: number;
  luckShowerGamesLeft: number;
  wheelSpunDate: string | null;
  wheelPrize: number;
  losingStreak: number;
  cashbackPending: number;
  tier: 'Bronze' | 'Silber' | 'Gold' | 'Platin' | 'Diamant';
  tierProgress: number;
}

const DEFAULT_SESSION: CasinoSession = {
  sessionCount: 0,
  lastSessionDate: '',
  loginStreak: 0,
  longestLoginStreak: 0,
  totalPlayTimeMs: 0,
  sessionStart: 0,
  bonusClaimedDate: null,
  bonusAmount: 0,
  luckShowerGamesLeft: 0,
  wheelSpunDate: null,
  wheelPrize: 0,
  losingStreak: 0,
  cashbackPending: 0,
  tier: 'Bronze',
  tierProgress: 0,
};

export interface CasinoAchievements {
  unlocked: string[];
  recent: { id: string; key: number } | null;
}

const DEFAULT_ACHIEVEMENTS: CasinoAchievements = {
  unlocked: [],
  recent: null,
};

export const ACHIEVEMENT_DEFS: Array<{ id: string; title: string; desc: string; icon: string; check: (s: CasinoStats) => boolean }> = [
  { id: 'first_bet', title: 'Erster Einsatz', desc: 'Platziere deine erste Wette', icon: '🎲', check: (s) => s.gamesPlayed >= 1 },
  { id: 'wager_100', title: 'Hundert-Einsatz', desc: 'Setze insgesamt $100', icon: '💵', check: (s) => s.totalWagered >= 100 },
  { id: 'wager_1000', title: 'Tausend-Einsatz', desc: 'Setze insgesamt $1.000', icon: '💰', check: (s) => s.totalWagered >= 1000 },
  { id: 'wager_10000', title: 'High-Roller', desc: 'Setze insgesamt $10.000', icon: '💎', check: (s) => s.totalWagered >= 10000 },
  { id: 'biggest_win_100', title: 'Vierstellig', desc: 'Gewinne $100 in einer Runde', icon: '💸', check: (s) => s.biggestWin >= 100 },
  { id: 'biggest_win_500', title: 'Großer Gewinn', desc: 'Gewinne $500 in einer Runde', icon: '🤑', check: (s) => s.biggestWin >= 500 },
  { id: 'streak_5', title: 'Heißer Streak', desc: '5 Gewinne in Folge', icon: '🔥', check: (s) => s.bestStreak >= 5 },
  { id: 'streak_10', title: 'Unaufhaltbar', desc: '10 Gewinne in Folge', icon: '⚡', check: (s) => s.bestStreak >= 10 },
  { id: 'roulette_straight', title: 'Volltreffer', desc: 'Triff eine Roulette-Nummer direkt', icon: '🎯', check: (s) => s.roulette.straightUps >= 1 },
  { id: 'roulette_red_5', title: 'Rot-Liebhaber', desc: '5-mal Rot in Roulette', icon: '❤️', check: (s) => s.roulette.redHits >= 5 },
  { id: 'coin_100', title: 'Münzmeister', desc: '100 Coin-Flips', icon: '🪙', check: (s) => s.coin.totalFlips >= 100 },
  { id: 'slot_jackpot', title: 'Jackpot-Knaller', desc: 'Drei Siebener', icon: '7️⃣', check: (s) => s.slot.threeOfAKind >= 1 },
  { id: 'hilo_streak_5', title: 'Karten-König', desc: '5er-Streak bei HiLo', icon: '🃏', check: (s) => s.hilo.bestStreak >= 5 },
  { id: 'crash_5x', title: 'Himmelsstürmer', desc: 'Crash-Multi 5× erreicht', icon: '🚀', check: (s) => s.crash.bestMultiplier >= 5 },
  { id: 'crash_10x', title: 'Mond-Mann', desc: 'Crash-Multi 10× erreicht', icon: '🌙', check: (s) => s.crash.bestMultiplier >= 10 },
  { id: 'dice_streak_5', title: 'Würfel-Wizard', desc: '5 Dice-Gewinne in Folge', icon: '🎲', check: (s) => s.dice.bestStreak >= 5 },
  { id: 'login_7', title: 'Wöchentlich', desc: '7 Tage Login-Streak', icon: '📅', check: (_s) => false },
  { id: 'play_100', title: 'Erfahren', desc: '100 Spiele gespielt', icon: '🎰', check: (s) => s.gamesPlayed >= 100 },
];

export const WHEEL_PRIZES = [25, 50, 100, 200, 25, 50, 500, 100, 25, 50, 100, 1000];

export type GameKey = 'coin' | 'slot' | 'hilo' | 'roulette' | 'crash' | 'dice';

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored) return { ...fallback, ...(JSON.parse(stored) as Partial<T>) };
  } catch {
    // ignore
  }
  return fallback;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getFavoriteGame(stats: CasinoStats): GameKey {
  const counts: Record<GameKey, number> = {
    coin: stats.coin.totalFlips,
    slot: stats.slot.spins,
    hilo: stats.hilo.gamesCashed + stats.hilo.gamesLost,
    roulette: stats.roulette.spins,
    crash: stats.crash.rounds,
    dice: stats.dice.rolls,
  };
  let best: GameKey = 'coin';
  let max = -1;
  for (const k in counts) {
    if (counts[k as GameKey] > max) {
      max = counts[k as GameKey];
      best = k as GameKey;
    }
  }
  return best;
}

const GAME_LABEL: Record<GameKey, string> = {
  coin: 'Coin Flip',
  slot: 'Slots',
  hilo: 'Higher or Lower',
  roulette: 'Roulette',
  crash: 'Crash',
  dice: 'Dice',
};

export function getFavoriteGameLabel(stats: CasinoStats): string {
  return GAME_LABEL[getFavoriteGame(stats)] || '—';
}

export function calcTierAndProgress(stats: CasinoStats, _session: CasinoSession): { tier: CasinoSession['tier']; progress: number } {
  const totalBets = stats.gamesPlayed;
  let tier: CasinoSession['tier'] = 'Bronze';
  let threshold = 0;
  let nextThreshold = 100;
  if (totalBets >= 5000) { tier = 'Diamant'; threshold = 5000; nextThreshold = 5000; }
  else if (totalBets >= 2000) { tier = 'Platin'; threshold = 2000; nextThreshold = 5000; }
  else if (totalBets >= 500) { tier = 'Gold'; threshold = 500; nextThreshold = 2000; }
  else if (totalBets >= 100) { tier = 'Silber'; threshold = 100; nextThreshold = 500; }
  const progress = Math.min(1, (totalBets - threshold) / Math.max(1, nextThreshold - threshold));
  return { tier, progress };
}

export function calcHotNumbers(stats: CasinoStats): { number: number; count: number; hot: boolean }[] {
  const counts: Record<number, number> = {};
  for (const n of stats.roulette.lastNumbers) {
    counts[n] = (counts[n] || 0) + 1;
  }
  const max = Math.max(0, ...Object.values(counts));
  return Object.entries(counts)
    .map(([n, c]) => ({ number: parseInt(n, 10), count: c, hot: max > 0 && c >= max && c >= 2 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export function useCasinoBank() {
  const [balance, setBalance] = useState<number>(() => {
    try {
      const stored = window.localStorage.getItem(BANK_KEY);
      if (stored !== null) {
        const v = Number(stored);
        if (Number.isFinite(v) && v >= 0) return v;
      }
    } catch {
      // ignore
    }
    return 1000;
  });

  const [stats, setStats] = useState<CasinoStats>(() => loadJSON(STATS_KEY, DEFAULT_STATS));
  const [gameState, setGameState] = useState<CasinoGameState>(() => loadJSON(STATE_KEY, DEFAULT_STATE));
  const [session, setSession] = useState<CasinoSession>(() => {
    const s = loadJSON(SESSION_KEY, DEFAULT_SESSION);
    const today = todayStr();
    const yesterday = yesterdayStr();
    if (s.lastSessionDate === today) {
      s.loginStreak = Math.max(1, s.loginStreak);
    } else if (s.lastSessionDate === yesterday) {
      s.loginStreak = s.loginStreak + 1;
    } else {
      s.loginStreak = 1;
    }
    s.lastSessionDate = today;
    s.sessionCount = (s.sessionCount || 0) + 1;
    s.sessionStart = Date.now();
    s.longestLoginStreak = Math.max(s.longestLoginStreak, s.loginStreak);
    return s;
  });
  const [achievements, setAchievements] = useState<CasinoAchievements>(() => loadJSON(ACHIEVEMENTS_KEY, DEFAULT_ACHIEVEMENTS));
  const initialized = useRef(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(BANK_KEY, String(balance));
    } catch {
      // ignore
    }
  }, [balance]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STATE_KEY, JSON.stringify(gameState));
    } catch {
      // ignore
    }
  }, [gameState]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
  }, [session]);

  useEffect(() => {
    try {
      window.localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    } catch {
      // ignore
    }
  }, [achievements]);

  useEffect(() => {
    const newUnlocks: string[] = [];
    for (const def of ACHIEVEMENT_DEFS) {
      if (def.id === 'login_7') {
        if (session.loginStreak >= 7 && !achievements.unlocked.includes(def.id)) {
          newUnlocks.push(def.id);
        }
      } else if (def.check(stats) && !achievements.unlocked.includes(def.id)) {
        newUnlocks.push(def.id);
      }
    }
    if (newUnlocks.length > 0) {
      setAchievements(prev => ({
        unlocked: [...prev.unlocked, ...newUnlocks],
        recent: newUnlocks.length > 0 ? { id: newUnlocks[newUnlocks.length - 1], key: Date.now() } : prev.recent,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, session.loginStreak]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (session.bonusClaimedDate !== todayStr() && session.sessionCount > 0) {
      const bonus = 50 + (session.loginStreak * 25);
      setBalance(b => b + bonus);
      setSession(s => ({ ...s, bonusAmount: bonus, bonusClaimedDate: todayStr() }));
    }
    const interval = window.setInterval(() => {
      setSession(s => {
        return { ...s, totalPlayTimeMs: s.totalPlayTimeMs + 5000 };
      });
    }, 5000);
    return () => window.clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placeBet = useCallback((amount: number): boolean => {
    if (amount <= 0 || amount > balance) return false;
    setBalance(b => b - amount);
    setStats(s => ({ ...s, totalWagered: s.totalWagered + amount, gamesPlayed: s.gamesPlayed + 1 }));
    return true;
  }, [balance]);

  const creditWinnings = useCallback((amount: number, wagered: number) => {
    if (amount <= 0) {
      setStats(s => ({ ...s, currentStreak: 0 }));
      setSession(s => ({ ...s, losingStreak: s.losingStreak + 1 }));
      return;
    }
    let cashback = 0;
    setSession(s => {
      if (s.losingStreak >= 3 && s.losingStreak < 5) cashback = 10;
      else if (s.losingStreak >= 5 && s.losingStreak < 10) cashback = 25;
      else if (s.losingStreak >= 10) cashback = 100;
      return { ...s, losingStreak: 0, cashbackPending: 0 };
    });
    const totalPayout = amount + cashback;
    const profit = totalPayout - wagered;
    setBalance(b => b + totalPayout);
    setStats(s => ({
      ...s,
      totalWon: s.totalWon + totalPayout,
      totalNet: s.totalNet + profit,
      biggestWin: Math.max(s.biggestWin, profit),
      currentStreak: s.currentStreak + 1,
      bestStreak: Math.max(s.bestStreak, s.currentStreak + 1),
    }));
  }, []);

  const addWinnings = useCallback((amount: number) => {
    if (amount <= 0) return;
    setBalance(b => b + amount);
    setStats(s => ({
      ...s,
      totalWon: s.totalWon + amount,
      biggestWin: Math.max(s.biggestWin, amount),
      currentStreak: s.currentStreak + 1,
      bestStreak: Math.max(s.bestStreak, s.currentStreak + 1),
    }));
  }, []);

  const updateStats = useCallback((updater: (s: CasinoStats) => CasinoStats) => {
    setStats(s => updater(s));
  }, []);

  const updateGameState = useCallback((updater: (s: CasinoGameState) => CasinoGameState) => {
    setGameState(s => updater(s));
  }, []);

  const reset = useCallback(() => {
    setBalance(1000);
    setStats(DEFAULT_STATS);
    setGameState(DEFAULT_STATE);
    setSession(s => ({ ...s, bonusClaimedDate: todayStr(), bonusAmount: 0, luckShowerGamesLeft: 0 }));
  }, []);

  const triggerLuckShower = useCallback(() => {
    setBalance(b => b + 100);
    setSession(s => ({ ...s, luckShowerGamesLeft: s.luckShowerGamesLeft + 1 }));
  }, []);

  const consumeLuckShower = useCallback(() => {
    setSession(s => ({ ...s, luckShowerGamesLeft: Math.max(0, s.luckShowerGamesLeft - 1) }));
  }, []);

  const tierInfo = calcTierAndProgress(stats, session);

  return {
    balance,
    stats,
    gameState,
    session,
    placeBet,
    creditWinnings,
    addWinnings,
    consumeLuckShower,
    updateStats,
    updateGameState,
    reset,
    triggerLuckShower,
    tierInfo,
  };
}

export function formatMoney(n: number): string {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  return `${sign}$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function getStreakBonus(streak: number): number {
  if (streak >= 10) return 0.5;
  if (streak >= 7) return 0.3;
  if (streak >= 5) return 0.2;
  if (streak >= 3) return 0.1;
  return 0;
}

export function getStreakLabel(streak: number): { label: string; color: string } | null {
  if (streak >= 10) return { label: 'UNSTOPPBAR', color: '#ff6b00' };
  if (streak >= 7) return { label: 'GÖTTLICH', color: '#ff006e' };
  if (streak >= 5) return { label: 'FEUER-STREAK', color: '#ff6b00' };
  if (streak >= 3) return { label: 'HEISS', color: '#f0c850' };
  return null;
}

export function getLossComeback(losingStreak: number): { label: string; payoutBoost: number } | null {
  if (losingStreak >= 10) return { label: 'RACHE-TIME!', payoutBoost: 0.25 };
  if (losingStreak >= 5) return { label: 'Jetzt zurückkommen!', payoutBoost: 0.1 };
  if (losingStreak >= 3) return { label: 'Du schaffst das!', payoutBoost: 0.05 };
  return null;
}

export { GAME_LABEL };
