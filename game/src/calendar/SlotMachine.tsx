import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Gift } from "lucide-react";
import confetti from "canvas-confetti";
import { CollectClueButton } from "../components/CollectClueButton";

type Props = { active: boolean; onClose: () => void };

type Symbol = {
  emoji: string;
  weight: number;
  pay2: number;
  pay3: number;
  tier: WinTier;
};

type WinTier = "small" | "big" | "mega" | "ultra" | "jackpot";

const SYMBOLS: Symbol[] = [
  { emoji: "🍒", weight: 30, pay2: 0, pay3: 3, tier: "big" },
  { emoji: "🍋", weight: 25, pay2: 0, pay3: 4, tier: "big" },
  { emoji: "⭐", weight: 20, pay2: 0, pay3: 8, tier: "mega" },
  { emoji: "💎", weight: 18, pay2: 0, pay3: 20, tier: "ultra" },
  { emoji: "7️⃣", weight: 7, pay2: 0, pay3: 50, tier: "jackpot" },
];

const BONUS_EMOJI = "🎁";

const PAYLINE_ROW = 1;

const STARTING_CREDITS = 200;
const SPIN_COST = 3;
const LUCKY_SPIN_INTERVAL = 7;
const STREAK_BONUS_AT = [3, 5, 8];
const STREAK_MULTIPLIERS = [2, 3, 5];

const CREDITS_KEY = "escape.sahur.credits";
const BEST_KEY = "escape.sahur.best";
const SPINS_KEY = "escape.sahur.spins";
const SESSION_KEY = "escape.sahur.session";

let audioCtx: AudioContext | null = null;
const getCtx = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      const Ctor = (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      audioCtx = new Ctor();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

const tone = (
  freq: number,
  dur: number,
  type: OscillatorType = "sine",
  vol = 0.12,
  t0 = 0,
  attack = 0.005,
  release = 0.05,
) => {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime + t0;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.setValueAtTime(vol, t + Math.max(attack, dur - release));
  g.gain.linearRampToValueAtTime(0, t + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
};

const noise = (dur: number, vol = 0.08, freq = 3000, t0 = 0) => {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime + t0;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.linearRampToValueAtTime(0, t + dur);
  src.connect(filter).connect(g).connect(ctx.destination);
  src.start(t);
  src.stop(t + dur);
};

const sweep = (
  f0: number,
  f1: number,
  dur: number,
  type: OscillatorType = "sawtooth",
  vol = 0.1,
  t0 = 0,
) => {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime + t0;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.linearRampToValueAtTime(0, t + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
};

const SFX = {
  click: () => {
    tone(900, 0.04, "square", 0.08);
    noise(0.02, 0.04, 5000);
  },
  hover: () => {
    tone(1500, 0.02, "sine", 0.03);
  },
  tick: () => {
    tone(1400, 0.025, "sine", 0.04);
  },
  spin: () => {
    sweep(180, 900, 0.35, "sawtooth", 0.09);
    noise(0.15, 0.05, 1200);
  },
  reelStop: () => {
    tone(160, 0.1, "triangle", 0.16);
    noise(0.05, 0.12, 600);
  },
  lose: () => {
    tone(420, 0.12, "sawtooth", 0.08, 0);
    tone(310, 0.18, "sawtooth", 0.08, 0.09);
    tone(220, 0.25, "sawtooth", 0.08, 0.22);
  },
  nearMiss: () => {
    tone(660, 0.08, "triangle", 0.08);
    tone(880, 0.12, "triangle", 0.08, 0.05);
  },
  smallWin: () => {
    [523, 659, 784].forEach((f, i) => tone(f, 0.18, "sine", 0.12, i * 0.06));
  },
  bigWin: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, "square", 0.13, i * 0.06));
    noise(0.3, 0.06, 4000, 0.05);
  },
  megaWin: () => {
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) =>
      tone(f, 0.4, "sawtooth", 0.13, i * 0.05),
    );
    noise(0.4, 0.07, 3000, 0.1);
  },
  ultraWin: () => {
    [262, 330, 392, 523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) =>
      tone(f, 0.5, "square", 0.12, i * 0.04),
    );
    noise(0.6, 0.08, 2000, 0.1);
  },
  jackpot: () => {
    const chord = (notes: number[], t0: number, dur: number, vol: number) => {
      notes.forEach((f) => tone(f, dur, "sawtooth", vol, t0));
    };
    chord([523, 659, 784], 0, 0.4, 0.14);
    chord([659, 784, 988], 0.18, 0.4, 0.14);
    chord([784, 988, 1175], 0.36, 0.4, 0.14);
    chord([1047, 1319, 1568], 0.54, 0.6, 0.16);
    chord([1568, 2093, 2637], 0.85, 1.2, 0.18);
    noise(1.0, 0.1, 3000, 0.6);
  },
  bonus: () => {
    for (let i = 0; i < 8; i++) {
      tone(800 + i * 180, 0.12, "sine", 0.1, i * 0.035);
    }
  },
  streakUp: () => {
    tone(440, 0.08, "sine", 0.1, 0);
    tone(660, 0.08, "sine", 0.1, 0.06);
    tone(880, 0.12, "sine", 0.1, 0.12);
  },
  freeSpin: () => {
    sweep(400, 1600, 0.4, "sine", 0.12);
    tone(1600, 0.3, "sine", 0.1, 0.4);
  },
  leverRatchet: () => {
    tone(300, 0.03, "square", 0.06);
    noise(0.02, 0.04, 3000);
  },
  leverRelease: () => {
    sweep(120, 600, 0.18, "sawtooth", 0.1);
    tone(180, 0.1, "triangle", 0.1, 0.05);
  },
  coinShower: () => {
    for (let i = 0; i < 14; i++) {
      const f = 1200 + Math.random() * 1800;
      tone(f, 0.08, "sine", 0.05, i * 0.025);
    }
  },
  loseHopeful: () => {
    tone(330, 0.1, "triangle", 0.07, 0);
    tone(440, 0.1, "triangle", 0.07, 0.08);
    tone(550, 0.18, "triangle", 0.07, 0.16);
  },
  almostWon: () => {
    sweep(700, 1300, 0.25, "sine", 0.1);
    tone(1100, 0.2, "sine", 0.08, 0.1);
  },
};

const burstConfetti = (tier: WinTier) => {
  if (typeof window === "undefined") return;
  const colors =
    tier === "jackpot"
      ? ["#ffd700", "#ff4d8d", "#00ffaa", "#ff8a00", "#7c4dff"]
      : tier === "ultra"
        ? ["#ffd700", "#ff4d8d", "#7c4dff"]
        : tier === "mega"
          ? ["#ffd700", "#ff8a00", "#ff4d8d"]
          : tier === "big"
            ? ["#7c4dff", "#ff4d8d"]
            : ["#7c4dff", "#ff4d8d", "#ffd700"];

  if (tier === "small") {
    confetti({
      particleCount: 30,
      spread: 50,
      startVelocity: 25,
      origin: { y: 0.5 },
      colors,
      scalar: 0.7,
    });
    return;
  }
  const burst = (origin: { x: number; y: number }, count: number, power: number) => {
    confetti({
      particleCount: count,
      angle: 60,
      spread: 70,
      startVelocity: power,
      origin: { ...origin, x: origin.x + 0.1 },
      colors,
    });
    confetti({
      particleCount: count,
      angle: 120,
      spread: 70,
      startVelocity: power,
      origin: { ...origin, x: origin.x - 0.1 },
      colors,
    });
  };
  burst({ x: 0.5, y: 0.5 }, tier === "jackpot" ? 200 : tier === "ultra" ? 150 : 90, tier === "jackpot" ? 70 : 55);
  if (tier === "jackpot" || tier === "ultra") {
    setTimeout(() => burst({ x: 0.5, y: 0.3 }, 120, 60), 200);
    setTimeout(() => burst({ x: 0.5, y: 0.7 }, 120, 60), 400);
  }
};

const SYMBOL_MAP = new Map<string, Symbol>(SYMBOLS.map((s) => [s.emoji, s]));

const randomSymbol = (): Symbol => {
  const total = SYMBOLS.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const s of SYMBOLS) {
    r -= s.weight;
    if (r <= 0) return s;
  }
  return SYMBOLS[0];
};

type SpinResult = {
  results: Symbol[][];
  baseMult: number;
  tier: WinTier | null;
  bonusCount: number;
  message: string;
  isWin: boolean;
  isFree: boolean;
  winningRow: number;
};

const TIER_ORDER: WinTier[] = ["small", "big", "mega", "ultra", "jackpot"];

const evaluate = (reels: Symbol[][], forceFree: boolean, jackpotBoosted: boolean): SpinResult => {
  const flat = reels.flat();
  const bonusCount = flat.filter((s) => s.emoji === BONUS_EMOJI).length;
  let baseMult = 0;
  let tier: WinTier | null = null;
  let winningRow = -1;
  let message = "Nichts — versuch's nochmal!";
  let isWin = false;

  for (let row = 0; row < 3; row++) {
    const a = reels[0][row];
    const b = reels[1][row];
    const c = reels[2][row];
    if (a.emoji !== BONUS_EMOJI && a.emoji === b.emoji && b.emoji === c.emoji) {
      const s = SYMBOL_MAP.get(a.emoji);
      if (s) {
        const candidateTier = jackpotBoosted ? "jackpot" : s.tier;
        if (!tier || TIER_ORDER.indexOf(candidateTier) > TIER_ORDER.indexOf(tier)) {
          baseMult = s.pay3;
          tier = candidateTier;
          winningRow = row;
        }
        isWin = true;
      }
    }
  }

  if (isWin && tier) {
    const labels: Record<WinTier, string> = {
      small: "Kleiner Gewinn!",
      big: "GEWINN!",
      mega: "MEGA GEWINN!",
      ultra: "ULTRA GEWINN!",
      jackpot: "🎰 JACKPOT! 🎰",
    };
    message = labels[tier];
  }

  if (bonusCount >= 3) {
    message = `🎁 ${bonusCount} BONUS — 5 FREE SPINS!`;
    isWin = true;
  } else if (bonusCount === 2) {
    message = `🎁 2 BONUS — 2 FREE SPINS!`;
    isWin = true;
  } else if (bonusCount === 1 && !isWin) {
    message = "🎁 1 Bonus — knapp!";
  }

  return { results: reels, baseMult, tier, bonusCount, message, isWin: isWin || forceFree, isFree: forceFree, winningRow };
};

const HOPEFUL_MESSAGES = [
  "Knapp! Nochmal!",
  "Nächstes Mal klappt's!",
  "Spürst du's? Es kommt!",
  "Ein Dreh noch…",
  "Die Maschine wird wach…",
  "Noch 1 Klick zum Bonus!",
  "JACKPOT ist überfällig!",
  "Versuch's nochmal — Glück wechselt!",
];

const isNearMiss = (reels: Symbol[][]): boolean => {
  for (let row = 0; row < 3; row++) {
    const a = reels[0][row];
    const b = reels[1][row];
    const c = reels[2][row];
    if (a.emoji === BONUS_EMOJI || b.emoji === BONUS_EMOJI || c.emoji === BONUS_EMOJI) continue;
    const same = (x: Symbol, y: Symbol) => x.emoji === y.emoji;
    const matchCount = [same(a, b), same(a, c), same(b, c)].filter(Boolean).length;
    if (matchCount >= 1 && matchCount < 3) return true;
  }
  return false;
};

export default function SlotMachine({ active, onClose }: Props) {
  const [spinning, setSpinning] = useState<boolean[]>([false, false, false]);
  const [credits, setCredits] = useState<number>(STARTING_CREDITS);
  const [bet] = useState<number>(SPIN_COST);
  const [lastWin, setLastWin] = useState<number>(0);
  const [displayedWin, setDisplayedWin] = useState<number>(0);
  const [message, setMessage] = useState<string>("Drück DREHEN — erstes Spin GRATIS!");
  const [tier, setTier] = useState<WinTier | null>(null);
  const [best, setBest] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [freeSpins, setFreeSpins] = useState<number>(0);
  const [spins, setSpins] = useState<number>(0);
  const [jackpotMeter, setJackpotMeter] = useState<number>(0);
  const [shake, setShake] = useState<number>(0);
  const [showBonusBanner, setShowBonusBanner] = useState<boolean>(false);
  const [showStreakBanner, setShowStreakBanner] = useState<boolean>(false);
  const [jackpotPrimed, setJackpotPrimed] = useState<boolean>(false);
  const [freeSpinAvailable, setFreeSpinAvailable] = useState<boolean>(true);
  const [flashUrgent, setFlashUrgent] = useState<boolean>(false);
  const [floatingWins, setFloatingWins] = useState<Array<{ id: number; amount: number; tier: WinTier; x: number }>>([]);

  const [displayReels, setDisplayReels] = useState<Symbol[][]>(() => [
    [randomSymbol(), randomSymbol(), randomSymbol()],
    [randomSymbol(), randomSymbol(), randomSymbol()],
    [randomSymbol(), randomSymbol(), randomSymbol()],
  ]);

  const tickRefs = useRef<number[]>([]);
  const stopTimers = useRef<number[]>([]);
  const finalResults = useRef<Symbol[][]>([
    [randomSymbol(), randomSymbol(), randomSymbol()],
    [randomSymbol(), randomSymbol(), randomSymbol()],
    [randomSymbol(), randomSymbol(), randomSymbol()],
  ]);
  const creditsRef = useRef<number>(credits);
  const spinningRef = useRef<boolean[]>(spinning);
  const spinsRef = useRef<number>(spins);
  const jackpotMeterRef = useRef<number>(0);
  const jackpotPrimedRef = useRef<boolean>(false);
  const freeSpinAvailableRef = useRef<boolean>(true);

  useEffect(() => {
    creditsRef.current = credits;
  }, [credits]);
  useEffect(() => {
    spinningRef.current = spinning;
  }, [spinning]);
  useEffect(() => {
    if (spinning.some(Boolean)) {
      setFlashUrgent(false);
      return;
    }
    const id = window.setInterval(() => {
      setFlashUrgent((v) => !v);
    }, 220);
    return () => clearInterval(id);
  }, [spinning]);
  useEffect(() => {
    spinsRef.current = spins;
  }, [spins]);
  useEffect(() => {
    jackpotMeterRef.current = jackpotMeter;
  }, [jackpotMeter]);
  useEffect(() => {
    jackpotPrimedRef.current = jackpotPrimed;
  }, [jackpotPrimed]);
  useEffect(() => {
    freeSpinAvailableRef.current = freeSpinAvailable;
  }, [freeSpinAvailable]);

  useEffect(() => {
    if (!active) return;
    const storedCredits = Number(localStorage.getItem(CREDITS_KEY));
    setCredits(Number.isFinite(storedCredits) ? storedCredits : STARTING_CREDITS);
    const storedBest = Number(localStorage.getItem(BEST_KEY) ?? 0);
    if (Number.isFinite(storedBest)) setBest(storedBest);
    const storedSpins = Number(localStorage.getItem(SPINS_KEY) ?? 0);
    const nextFreeAvailable = !(Number.isFinite(storedSpins) && storedSpins > 0);
    setFreeSpinAvailable(nextFreeAvailable);
    setSpins(0);
    setStreak(0);
    setFreeSpins(0);
    setJackpotMeter(0);
    setJackpotPrimed(false);
    setShake(0);
    setShowBonusBanner(false);
    setShowStreakBanner(false);
    setTier(null);
    setLastWin(0);
    setDisplayedWin(0);
    setMessage(
      nextFreeAvailable
        ? "Erstes Spin heute GRATIS — Drück DREHEN!"
        : "Drück DREHEN und gewinne!",
    );
    const initial: Symbol[][] = [
      [randomSymbol(), randomSymbol(), randomSymbol()],
      [randomSymbol(), randomSymbol(), randomSymbol()],
      [randomSymbol(), randomSymbol(), randomSymbol()],
    ];
    setDisplayReels(initial);
    finalResults.current = initial;
    tickRefs.current.forEach((id) => clearInterval(id));
    tickRefs.current = [];
    stopTimers.current.forEach((id) => clearTimeout(id));
    stopTimers.current = [];
    try {
      localStorage.setItem(SESSION_KEY, Date.now().toString());
    } catch {
      /* ignore */
    }
    return () => {
      tickRefs.current.forEach((id) => clearInterval(id));
      tickRefs.current = [];
      stopTimers.current.forEach((id) => clearTimeout(id));
      stopTimers.current = [];
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (!spinningRef.current.some(Boolean)) {
          SFX.click();
          handleSpin();
        }
      } else if (e.code === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, onClose]);

  useEffect(() => {
    if (!active) return;
    if (credits <= 0 && freeSpins <= 0 && !spinning.some(Boolean)) {
      setMessage("Pleite — Reset auf 200 Credits");
      setCredits(STARTING_CREDITS);
      try {
        localStorage.setItem(CREDITS_KEY, String(STARTING_CREDITS));
      } catch {
        /* ignore */
      }
    }
  }, [credits, freeSpins, spinning, active]);

  const tickCounter = useRef(0);

  const handleSpin = useCallback(() => {
    if (spinningRef.current.some(Boolean)) return;
    const currentCredits = creditsRef.current;
    const isFree = freeSpinAvailableRef.current || freeSpins > 0;
    const useFreeSpin = freeSpins > 0;

    if (!isFree && currentCredits < bet) {
      setMessage("Nicht genug Credits!");
      SFX.lose();
      return;
    }

    tickRefs.current.forEach((id) => clearInterval(id));
    tickRefs.current = [];
    stopTimers.current.forEach((id) => clearTimeout(id));
    stopTimers.current = [];
    tickCounter.current = 0;

    if (isFree) {
      if (useFreeSpin) {
        setFreeSpins((n) => n - 1);
      } else {
        setFreeSpinAvailable(false);
        SFX.freeSpin();
      }
    } else {
      const newCredits = currentCredits - bet;
      setCredits(newCredits);
      try {
        localStorage.setItem(CREDITS_KEY, String(newCredits));
      } catch {
        /* ignore */
      }
    }

    const newSpins = spinsRef.current + 1;
    spinsRef.current = newSpins;
    setSpins(newSpins);
    try {
      localStorage.setItem(SPINS_KEY, String(newSpins));
    } catch {
      /* ignore */
    }

    SFX.spin();

    const isLuckySpin = newSpins > 0 && newSpins % LUCKY_SPIN_INTERVAL === 0;
    const newJackpotMeter = Math.min(100, jackpotMeterRef.current + 4);
    jackpotMeterRef.current = newJackpotMeter;
    setJackpotMeter(newJackpotMeter);
    const primed = newJackpotMeter >= 100;
    if (primed && !jackpotPrimedRef.current) {
      SFX.streakUp();
      setMessage("JACKPOT-PRIMED! Nächster 3er-Match = JACKPOT!");
    }
    jackpotPrimedRef.current = primed;
    setJackpotPrimed(primed);

    setSpinning([true, true, true]);
    setLastWin(0);
    setDisplayedWin(0);
    setTier(null);

    const forceWin = Math.random() < 0.5;
    const winRow = Math.floor(Math.random() * 3);
    const winSymbol = isLuckySpin
      ? SYMBOL_MAP.get("💎")!
      : SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

    const buildCol = (): Symbol[] => {
      if (forceWin) {
        return [0, 1, 2].map((row) => (row === winRow ? winSymbol : randomSymbol()));
      }
      return [randomSymbol(), randomSymbol(), randomSymbol()];
    };

    const results: Symbol[][] = [buildCol(), buildCol(), buildCol()];
    finalResults.current = results;

    [0, 1, 2].forEach((col) => {
      const id = window.setInterval(() => {
        tickCounter.current += 1;
        if (tickCounter.current % 3 === 0) SFX.tick();
        setDisplayReels((prev) => {
          const next = prev.map((c) => [...c]) as Symbol[][];
          next[col] = [randomSymbol(), randomSymbol(), randomSymbol()];
          return next;
        });
      }, 60 + col * 12);
      tickRefs.current.push(id);
    });

    const stopDelays = [700, 1050, 1400];
    stopDelays.forEach((delay, idx) => {
      const id = window.setTimeout(() => {
        const intervalId = tickRefs.current[idx];
        if (intervalId) clearInterval(intervalId);
        tickRefs.current[idx] = 0;
        SFX.reelStop();
        setDisplayReels((prev) => {
          const next = prev.map((c) => [...c]) as Symbol[][];
          next[idx] = [...finalResults.current[idx]];
          return next;
        });
        setSpinning((prev) => {
          const next = [...prev];
          next[idx] = false;
          if (next.every((s) => !s)) {
            window.setTimeout(() => finishSpin(results, useFreeSpin), 80);
          }
          return next;
        });
      }, delay);
      stopTimers.current.push(id);
    });
  }, [bet, freeSpins]);

  const finishSpin = (results: Symbol[][], wasFreeSpin: boolean) => {
    const bonusCount = results.flat().filter((s) => s.emoji === BONUS_EMOJI).length;
    const evaluation = evaluate(results, wasFreeSpin, jackpotPrimedRef.current);

    if (jackpotPrimedRef.current && evaluation.tier === "jackpot") {
      jackpotMeterRef.current = 0;
      setJackpotMeter(0);
      setJackpotPrimed(false);
    } else if (jackpotPrimedRef.current && evaluation.tier) {
      jackpotMeterRef.current = 0;
      setJackpotMeter(0);
      setJackpotPrimed(false);
    }

    const newStreak = evaluation.isWin ? streak + 1 : 0;
    setStreak(newStreak);
    const streakIdx = STREAK_BONUS_AT.findIndex((t) => t === newStreak);
    if (streakIdx >= 0) {
      SFX.streakUp();
      setShowStreakBanner(true);
      setTimeout(() => setShowStreakBanner(false), 1800);
    }

    if (bonusCount >= 2) {
      SFX.bonus();
      setShowBonusBanner(true);
      setTimeout(() => setShowBonusBanner(false), 2200);
      setFreeSpins((n) => n + (bonusCount >= 3 ? 5 : 2));
    }

    let multiplier = 1;
    for (let i = 0; i < streakIdx; i++) multiplier *= STREAK_MULTIPLIERS[i] || 1;
    if (wasFreeSpin) multiplier *= 2;

    let winAmount = 0;
    if (evaluation.tier) {
      winAmount = Math.round(bet * evaluation.baseMult * multiplier);
      if (evaluation.tier === "jackpot") {
        SFX.jackpot();
        setShake(18);
        setTimeout(() => setShake(0), 900);
      } else if (evaluation.tier === "ultra") {
        SFX.ultraWin();
        setShake(14);
        setTimeout(() => setShake(0), 700);
      } else if (evaluation.tier === "mega") {
        SFX.megaWin();
        setShake(10);
        setTimeout(() => setShake(0), 600);
      } else if (evaluation.tier === "big") {
        SFX.bigWin();
      } else {
        SFX.smallWin();
      }
      setTier(evaluation.tier);
      burstConfetti(evaluation.tier);

      const newCredits = creditsRef.current + winAmount;
      setCredits(newCredits);
      try {
        localStorage.setItem(CREDITS_KEY, String(newCredits));
      } catch {
        /* ignore */
      }
      if (newCredits > best) {
        setBest(newCredits);
        try {
          localStorage.setItem(BEST_KEY, String(newCredits));
        } catch {
          /* ignore */
        }
      }

      setLastWin(winAmount);
      const start = performance.now();
      const from = 0;
      const dur = Math.min(1100, 200 + winAmount * 6);
      const tickAnim = (t: number) => {
        const k = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        setDisplayedWin(Math.round(from + (winAmount - from) * eased));
        if (k < 1) requestAnimationFrame(tickAnim);
      };
      requestAnimationFrame(tickAnim);

      let finalMsg = evaluation.message;
      if (multiplier > 1) finalMsg += ` ×${multiplier}`;
      setMessage(finalMsg);

      SFX.coinShower();
      const id = Date.now() + Math.random();
      setFloatingWins((arr) => [
        ...arr,
        { id, amount: winAmount, tier: evaluation.tier!, x: 30 + Math.random() * 40 },
      ]);
      setTimeout(() => {
        setFloatingWins((arr) => arr.filter((f) => f.id !== id));
      }, 1600);
    } else {
      const nm = isNearMiss(results);
      if (nm && bonusCount === 0) {
        SFX.almostWon();
        setMessage("😱 KNAPP DANEBEN! Nochmal!");
      } else {
        SFX.loseHopeful();
        setMessage(HOPEFUL_MESSAGES[Math.floor(Math.random() * HOPEFUL_MESSAGES.length)]);
      }
    }
  };

  useEffect(() => {
    if (!tier) return;
    const id = window.setTimeout(() => setTier(null), tier === "jackpot" ? 3500 : 2400);
    return () => clearTimeout(id);
  }, [tier]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="slot-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 300,
            display: "flex",
            flexDirection: "column",
            background:
              "radial-gradient(ellipse at top, #3a1066 0%, #1a0833 70%, #0a0418 100%)",
            color: "#fff",
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            overflow: "hidden",
            transform: shake > 0 ? `translate(${(Math.random() - 0.5) * shake}px, ${(Math.random() - 0.5) * shake}px)` : undefined,
          }}
        >
          <style>{`
            @keyframes sahurSpin {
              0%   { transform: translateY(-3px); filter: blur(1.4px); }
              50%  { transform: translateY(3px);  filter: blur(0.4px); }
              100% { transform: translateY(-3px); filter: blur(1.4px); }
            }
            @keyframes sahurLand {
              0%   { transform: translateY(-22px) scale(1.05); }
              55%  { transform: translateY(6px)   scale(0.96); }
              80%  { transform: translateY(-2px)  scale(1.01); }
              100% { transform: translateY(0)     scale(1); }
            }
            @keyframes sahurPulse {
              0%, 100% { transform: scale(1); }
              50%      { transform: scale(1.12); }
            }
            @keyframes sahurPayline {
              0%, 100% { box-shadow: 0 0 18px rgba(255,215,0,0.4), inset 0 0 18px rgba(255,215,0,0.2); }
              50%      { box-shadow: 0 0 36px rgba(255,215,0,0.9), inset 0 0 32px rgba(255,215,0,0.6); }
            }
            @keyframes sahurWin {
              0%   { transform: translateY(0)    scale(1); }
              40%  { transform: translateY(-10px) scale(1.18); filter: drop-shadow(0 0 14px #ffd700); }
              70%  { transform: translateY(4px)  scale(0.96); }
              100% { transform: translateY(0)    scale(1); }
            }
            @keyframes sahurBig {
              0%   { transform: scale(0.5) rotate(-8deg); opacity: 0; }
              40%  { transform: scale(1.3) rotate(4deg);  opacity: 1; }
              70%  { transform: scale(0.95) rotate(-2deg); }
              100% { transform: scale(1) rotate(0); opacity: 1; }
            }
            @keyframes sahurBonusPop {
              0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
              50%  { transform: scale(1.4) rotate(20deg); opacity: 1; }
              100% { transform: scale(1) rotate(0); opacity: 1; }
            }
            @keyframes sahurStreak {
              0%, 100% { transform: translateY(0) scale(1); }
              50%      { transform: translateY(-6px) scale(1.08); }
            }
            @keyframes sahurJackpotBar {
              from { width: 0%; }
              to   { width: var(--jp, 0%); }
            }
          `}</style>

          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              opacity: 0.35,
              background:
                "radial-gradient(circle at 20% 30%, rgba(255,215,0,0.18) 0%, transparent 35%), radial-gradient(circle at 80% 70%, rgba(255,0,128,0.18) 0%, transparent 35%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 12,
              zIndex: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                background: "rgba(0,0,0,0.35)",
                borderRadius: 999,
                backdropFilter: "blur(8px)",
                fontSize: 13,
                fontWeight: 700,
                color: "#ffd700",
              }}
            >
              <Sparkles size={14} color="#ffd700" />
              SAHUR
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <CollectClueButton clueId="games:slots" size={16} />
              <button
                onClick={onClose}
                onMouseEnter={() => SFX.hover()}
                onClickCapture={() => SFX.click()}
                aria-label="Schließen"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,0.35)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(6px)",
                }}
              >
                <X size={22} color="#fff" />
              </button>
            </div>
          </div>

          <div
            style={{
              paddingTop: 64,
              paddingBottom: 8,
              textAlign: "center",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: 4,
                color: "#ffd700",
                textShadow:
                  "0 0 20px rgba(255,215,0,0.5), 0 3px 0 rgba(0,0,0,0.5)",
                fontFamily:
                  "'Trebuchet MS', 'Verdana', system-ui, sans-serif",
              }}
            >
              ROYAL
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 3,
                color: "rgba(255,255,255,0.6)",
                marginTop: 2,
              }}
            >
              SAHUR · SLOTS
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 6,
              padding: "0 12px 8px",
              position: "relative",
              zIndex: 2,
            }}
          >
            <StatBox label="Credits" value={credits} accent={lastWin > 0} />
            <StatBox label="Einsatz" value={bet} />
            <StatBox
              label="Streak"
              value={streak}
              icon={streak >= 3 ? "🔥" : undefined}
            />
            <StatBox label="Best" value={best} gold />
          </div>

          {freeSpins > 0 && (
            <div
              style={{
                margin: "0 16px 8px",
                padding: "6px 10px",
                borderRadius: 10,
                background:
                  "linear-gradient(90deg, rgba(124,77,255,0.35) 0%, rgba(255,77,141,0.35) 100%)",
                border: "1px solid rgba(255,215,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                color: "#ffd700",
                letterSpacing: 0.5,
                position: "relative",
                zIndex: 2,
              }}
            >
              <Gift size={14} color="#ffd700" />
              {freeSpins} FREE SPINS — Gewinne ×2!
            </div>
          )}

          <div
            style={{
              padding: "0 16px 8px",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: jackpotPrimed ? "#ffd700" : "rgba(255,255,255,0.6)",
                letterSpacing: 1.5,
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
                textShadow: jackpotPrimed ? "0 0 8px rgba(255,215,0,0.8)" : undefined,
              }}
            >
              <span>JACKPOT-METER</span>
              <span>{jackpotPrimed ? "PRIMED!" : `${Math.floor(jackpotMeter)}%`}</span>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background: "rgba(0,0,0,0.4)",
                overflow: "hidden",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  width: `${jackpotPrimed ? 100 : jackpotMeter}%`,
                  height: "100%",
                  background: jackpotPrimed
                    ? "linear-gradient(90deg, #ff4d8d, #ffd700, #7c4dff, #ffd700)"
                    : "linear-gradient(90deg, #7c4dff 0%, #ff4d8d 60%, #ffd700 100%)",
                  boxShadow: jackpotPrimed
                    ? "0 0 16px rgba(255,215,0,0.8)"
                    : "0 0 6px rgba(255,77,141,0.6)",
                  backgroundSize: jackpotPrimed ? "200% 100%" : undefined,
                  animation: jackpotPrimed ? "sahurPulse 0.8s ease-in-out infinite" : undefined,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              padding: "0 12px",
              position: "relative",
              zIndex: 2,
              minHeight: 0,
            }}
          >
            <SlotFrame>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 10,
                  padding: 14,
                  height: "100%",
                  position: "relative",
                }}
              >
                {[0, 1, 2].map((col) => (
                  <ReelColumn
                    key={col}
                    topSymbol={displayReels[col][0]}
                    midSymbol={displayReels[col][1]}
                    bottomSymbol={displayReels[col][2]}
                    isSpinning={spinning[col]}
                    isWin={!spinning[col] && tier !== null}
                    isBonus={displayReels[col].some((s) => s.emoji === BONUS_EMOJI)}
                  />
                ))}
                <div
                  style={{
                    position: "absolute",
                    left: 14,
                    right: 14,
                    top: "50%",
                    height: `${100 / 3}%`,
                    transform: "translateY(-50%)",
                    border: "2px solid rgba(255,215,0,0.6)",
                    borderRadius: 10,
                    background: "rgba(255,215,0,0.08)",
                    pointerEvents: "none",
                    animation: "sahurPayline 1.4s ease-in-out infinite",
                  }}
                />
              </div>
            </SlotFrame>
          </div>

          {floatingWins.map((fw) => (
            <div
              key={fw.id}
              style={{
                position: "absolute",
                left: `${fw.x}%`,
                top: "36%",
                transform: "translateX(-50%)",
                zIndex: 6,
                pointerEvents: "none",
                fontSize: 28,
                fontWeight: 900,
                color:
                  fw.tier === "jackpot"
                    ? "#ffd700"
                    : fw.tier === "ultra"
                      ? "#ff4d8d"
                      : fw.tier === "mega"
                        ? "#7c4dff"
                        : "#00ffaa",
                WebkitTextStroke: "2px #000",
                paintOrder: "stroke fill",
                textShadow: "0 0 16px currentColor",
                animation: "sahurFloatUp 1.5s ease-out forwards",
              }}
            >
              +{fw.amount}
            </div>
          ))}
          <style>{`
            @keyframes sahurFloatUp {
              0%   { transform: translate(-50%, 0)    scale(0.6); opacity: 0; }
              20%  { transform: translate(-50%, -10px) scale(1.1); opacity: 1; }
              100% { transform: translate(-50%, -120px) scale(1.2); opacity: 0; }
            }
          `}</style>

          <AnimatePresence>
            {showBonusBanner && (
              <motion.div
                key="bonus-banner"
                initial={{ opacity: 0, scale: 0.4, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ type: "spring", damping: 12 }}
                style={{
                  position: "absolute",
                  top: "32%",
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  pointerEvents: "none",
                  zIndex: 6,
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "14px 32px",
                    background:
                      "linear-gradient(135deg, #ff4d8d 0%, #7c4dff 100%)",
                    borderRadius: 20,
                    boxShadow: "0 8px 30px rgba(255,77,141,0.6)",
                    animation: "sahurBonusPop 0.6s ease-out",
                  }}
                >
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      color: "#fff",
                      WebkitTextStroke: "2px #7a3e00",
                      paintOrder: "stroke fill",
                      letterSpacing: 2,
                    }}
                  >
                    🎁 BONUS! 🎁
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showStreakBanner && (
              <motion.div
                key="streak-banner"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{
                  position: "absolute",
                  top: "22%",
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  pointerEvents: "none",
                  zIndex: 6,
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "10px 20px",
                    background: "linear-gradient(135deg, #ff8a00 0%, #ff4d8d 100%)",
                    borderRadius: 16,
                    boxShadow: "0 6px 20px rgba(255,138,0,0.6)",
                    animation: "sahurStreak 0.6s ease-in-out infinite",
                  }}
                >
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: "#fff",
                      letterSpacing: 1.5,
                    }}
                  >
                    🔥 STREAK {streak}! ×{STREAK_MULTIPLIERS[STREAK_BONUS_AT.findIndex((t) => t === streak)] ?? 1}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {tier && (
              <motion.div
                key={tier + spins}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", damping: 14 }}
                style={{
                  position: "absolute",
                  top: "38%",
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              >
                <div
                  style={{
                    fontSize: tier === "jackpot" ? 48 : tier === "ultra" ? 44 : 38,
                    fontWeight: 900,
                    color:
                      tier === "jackpot"
                        ? "#ffd700"
                        : tier === "ultra"
                          ? "#ff4d8d"
                          : tier === "mega"
                            ? "#7c4dff"
                            : tier === "big"
                              ? "#00ffaa"
                              : "#fff",
                    WebkitTextStroke: "3px #000",
                    paintOrder: "stroke fill",
                    textShadow:
                      tier === "jackpot"
                        ? "0 0 40px rgba(255,215,0,0.9), 0 0 80px rgba(255,77,141,0.6)"
                        : tier === "ultra"
                          ? "0 0 30px rgba(255,77,141,0.9)"
                          : "0 0 20px rgba(124,77,255,0.7)",
                    letterSpacing: 2,
                    animation: "sahurBig 0.6s ease-out",
                  }}
                >
                  {tier === "jackpot"
                    ? "🎰 JACKPOT! 🎰"
                    : tier === "ultra"
                      ? "ULTRA!"
                      : tier === "mega"
                        ? "MEGA GEWINN!"
                        : tier === "big"
                          ? "GEWINN!"
                          : "KLEINER GEWINN!"}
                </div>
                {lastWin > 0 && (
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#ffd700",
                      marginTop: 4,
                      textShadow: "0 0 16px rgba(255,215,0,0.8)",
                      animation: "sahurPulse 0.8s ease-in-out infinite",
                    }}
                  >
                    +{displayedWin} Credits
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div
            style={{
              padding: "12px 20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              alignItems: "center",
              position: "relative",
              zIndex: 3,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: lastWin > 0 ? "#ffd700" : "rgba(255,255,255,0.85)",
                minHeight: 20,
                letterSpacing: 0.4,
                textAlign: "center",
              }}
            >
              {message}
            </div>
            <button
              onClick={() => {
                SFX.click();
                handleSpin();
              }}
              onMouseEnter={() => SFX.hover()}
              disabled={spinning.some(Boolean)}
              style={{
                width: "100%",
                maxWidth: 320,
                height: 60,
                borderRadius: 30,
                border: "3px solid #ffd700",
                background: spinning.some(Boolean)
                  ? "linear-gradient(180deg, #5a2e8a 0%, #3a1066 100%)"
                  : freeSpinAvailable || freeSpins > 0
                    ? "linear-gradient(180deg, #00ffaa 0%, #00b894 100%)"
                    : "linear-gradient(180deg, #ff4d8d 0%, #c2185b 100%)",
                color: "#fff",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 6,
                cursor: spinning.some(Boolean) ? "not-allowed" : "pointer",
                boxShadow:
                  freeSpinAvailable || freeSpins > 0
                    ? "0 6px 0 rgba(0,0,0,0.35), 0 0 30px rgba(0,255,170,0.5)"
                    : "0 6px 0 rgba(0,0,0,0.35), 0 0 30px rgba(255,77,141,0.5)",
                textShadow: "0 2px 0 rgba(0,0,0,0.4)",
                transition: "transform 0.1s",
                opacity: spinning.some(Boolean) ? 0.85 : 1,
                animation:
                  !spinning.some(Boolean)
                    ? freeSpinAvailable || freeSpins > 0
                      ? "sahurPulse 0.9s ease-in-out infinite"
                      : "sahurPulse 1.6s ease-in-out infinite"
                    : undefined,
              }}
              onPointerDown={(e) => {
                if (spinning.some(Boolean)) return;
                e.currentTarget.style.transform = "translateY(2px)";
              }}
              onPointerUp={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onPointerLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {spinning.some(Boolean)
                ? "..."
                : freeSpinAvailable
                  ? "GRATIS DREHEN"
                  : freeSpins > 0
                    ? `FREE ×${freeSpins}`
                    : flashUrgent
                      ? "DREH DREH DREH DREH"
                      : "DREHEN"}
            </button>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: 1,
              }}
            >
              Leertaste = Spin · Esc = Schließen
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SlotFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 380,
        aspectRatio: "1 / 1",
        maxHeight: 360,
        background:
          "linear-gradient(180deg, #ff4d8d 0%, #b80050 50%, #6b002e 100%)",
        borderRadius: 24,
        padding: 6,
        boxShadow:
          "0 12px 0 rgba(0,0,0,0.4), 0 0 50px rgba(255,77,141,0.4), inset 0 2px 0 rgba(255,255,255,0.2)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(180deg, #1a0833 0%, #0a0418 100%)",
          borderRadius: 18,
          padding: 4,
          boxShadow: "inset 0 0 30px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            overflow: "hidden",
            borderRadius: 14,
            background:
              "linear-gradient(180deg, #fff8e1 0%, #ffe0a0 50%, #ffcc66 100%)",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.2)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function ReelColumn({
  topSymbol,
  midSymbol,
  bottomSymbol,
  isSpinning,
  isWin,
  isBonus,
}: {
  topSymbol: Symbol;
  midSymbol: Symbol;
  bottomSymbol: Symbol;
  isSpinning: boolean;
  isWin: boolean;
  isBonus: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        borderRadius: 10,
        background:
          "linear-gradient(180deg, #ffffff 0%, #f5f5f5 50%, #e8e8e8 100%)",
        overflow: "hidden",
        boxShadow:
          "inset 0 0 10px rgba(0,0,0,0.3), inset 0 0 0 2px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "28%",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "28%",
          background:
            "linear-gradient(0deg, rgba(255,255,255,0.95) 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />
      <Cell symbol={topSymbol} row={0} isSpinning={isSpinning} isWin={false} isBonus={false} />
      <Cell
        symbol={midSymbol}
        row={1}
        isSpinning={isSpinning}
        isWin={isWin}
        isBonus={isBonus}
      />
      <Cell symbol={bottomSymbol} row={2} isSpinning={isSpinning} isWin={false} isBonus={false} />
    </div>
  );
}

function Cell({
  symbol,
  row,
  isSpinning,
  isWin,
  isBonus,
}: {
  symbol: Symbol;
  row: number;
  isSpinning: boolean;
  isWin: boolean;
  isBonus: boolean;
}) {
  const top = `${row * 33.333}%`;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        height: "33.333%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "min(12vw, 54px)",
        lineHeight: 1,
        zIndex: row === PAYLINE_ROW ? 2 : 1,
        animation: isSpinning
          ? "sahurSpin 0.08s linear infinite"
          : isWin
            ? "sahurWin 0.6s ease-out"
            : row === PAYLINE_ROW
              ? "sahurLand 0.45s cubic-bezier(0.2, 0.8, 0.3, 1)"
              : "none",
        filter: isBonus && row === PAYLINE_ROW ? "drop-shadow(0 0 14px #ffd700)" : undefined,
      }}
    >
      {symbol.emoji}
    </div>
  );
}

function StatBox({
  label,
  value,
  accent,
  gold,
  icon,
}: {
  label: string;
  value: number;
  accent?: boolean;
  gold?: boolean;
  icon?: string;
}) {
  const bg = gold
    ? "linear-gradient(180deg, rgba(255,215,0,0.25) 0%, rgba(255,215,0,0.1) 100%)"
    : accent
      ? "linear-gradient(180deg, rgba(76,175,80,0.3) 0%, rgba(76,175,80,0.1) 100%)"
      : "rgba(0,0,0,0.35)";
  return (
    <div
      style={{
        padding: "6px 6px",
        borderRadius: 12,
        background: bg,
        backdropFilter: "blur(8px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        border: gold ? "1px solid rgba(255,215,0,0.4)" : "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: "rgba(255,255,255,0.65)",
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 17,
          fontWeight: 800,
          color: gold ? "#ffd700" : "#fff",
          fontVariantNumeric: "tabular-nums",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
        {value}
      </span>
    </div>
  );
}
