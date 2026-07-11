import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, RotateCcw, Play, Music2, Disc3, Pause, Magnet, Zap, Trophy, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CollectClueButton } from '../../components/CollectClueButton';

const LANES = [-1, 0, 1] as const;
const LANE_W = 1.0;

type ObsType = 'low' | 'high' | 'wall' | 'train';
type PowerUpType = 'hoverboard' | 'magnet' | 'score2x';

interface Obs { lane: number; z: number; type: ObsType }
interface Note { lane: number; z: number; y: number; phase: number }
interface PowerUp { lane: number; z: number; y: number; type: PowerUpType; phase: number }
interface Part { x: number; y: number; z: number; vx: number; vy: number; life: number; color: string; size: number }
interface Trail { x: number; y: number; life: number; maxLife: number; color: string; size: number }
interface ScorePopup { value: number; x: number; y: number; z: number; life: number; color: string }

interface GameState {
  speed: number;
  maxSpeed: number;
  distance: number;
  player: {
    lane: number;
    laneTarget: number;
    x: number;
    y: number;
    vy: number;
    jumpT: number;
    sliding: boolean;
    slideT: number;
    runT: number;
  };
  obstacles: Obs[];
  notes: Note[];
  powerups: PowerUp[];
  particles: Part[];
  trail: Trail[];
  scorePopups: ScorePopup[];
  hoverboard: { active: boolean; time: number; duration: number };
  magnet: { active: boolean; time: number; duration: number };
  score2x: { active: boolean; time: number; duration: number };
  combo: { count: number; max: number; timer: number };
  shake: { intensity: number; time: number };
  camOffsetX: number;
  spawnZ: number;
  nextSpawn: number;
  trackOffset: number;
  bgOffset: number;
  coins: number;
  scoreGain: number;
  running: boolean;
  paused: boolean;
  dayPhase: number;
  flashRed: number;
}

const MUSICA_GREEN = '#1DB954';
const MUSICA_YELLOW = '#FFEB3B';
const MUSICA_PINK = '#FF5CD6';
const MUSICA_CYAN = '#00E0FF';
const MUSICA_PURPLE = '#9B59FF';

const COMBO_TIMEOUT = 2.0;

function comboMultiplier(count: number): number {
  if (count >= 20) return 4;
  if (count >= 10) return 3;
  if (count >= 5) return 2;
  return 1;
}

// === Audio (Web Audio API - synthesized) ===
class GameAudio {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  sfxGain: GainNode | null = null;
  musicGain: GainNode | null = null;
  musicPlaying = false;
  musicInterval: number | null = null;
  bpm = 128;

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterGain.connect(this.ctx.destination);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.4;
      this.sfxGain.connect(this.masterGain);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.12;
      this.musicGain.connect(this.masterGain);
    } catch {
      this.ctx = null;
    }
  }

  resume() {
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }

  tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.2, slide?: number) {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.sfxGain);
    o.start(t); o.stop(t + dur);
  }

  noise(dur: number, vol = 0.1, freq = 1000) {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.sfxGain);
    src.start(t);
  }

  jump() { this.tone(420, 0.12, 'square', 0.18, 1.8); this.tone(660, 0.08, 'square', 0.1, 1.4); }
  land() { this.noise(0.08, 0.12, 600); }
  coin(combo: number) {
    const base = 660 + Math.min(combo, 30) * 30;
    this.tone(base, 0.08, 'sine', 0.2);
    if (combo > 0 && combo % 5 === 0) this.tone(base * 1.5, 0.18, 'sine', 0.15);
  }
  comboBreak() { this.tone(180, 0.2, 'sawtooth', 0.1, 0.5); }
  hover() {
    this.tone(220, 0.35, 'sawtooth', 0.15, 1.5);
    this.tone(330, 0.35, 'triangle', 0.1, 1.5);
  }
  hoverEnd() { this.tone(440, 0.15, 'sine', 0.1, 0.6); }
  crash() {
    this.noise(0.5, 0.35, 300);
    this.tone(80, 0.4, 'sawtooth', 0.3, 0.3);
  }
  smash() { this.tone(200, 0.12, 'square', 0.2); this.noise(0.1, 0.15, 2000); }
  magnetPickup() { this.tone(523, 0.12, 'sine', 0.18); this.tone(784, 0.18, 'sine', 0.15); }
  score2xPickup() {
    this.tone(659, 0.1, 'triangle', 0.18);
    this.tone(784, 0.1, 'triangle', 0.16);
    this.tone(988, 0.2, 'triangle', 0.14);
  }
  click() { this.tone(800, 0.04, 'square', 0.15); }

  startMusic() {
    if (!this.ctx || this.musicPlaying) return;
    this.musicPlaying = true;
    const beatMs = 60000 / this.bpm;
    let step = 0;
    const playStep = () => {
      if (!this.musicPlaying || !this.ctx || !this.musicGain) return;
      const t = this.ctx.currentTime;
      // Kick on every beat
      const kick = this.ctx.createOscillator();
      const kg = this.ctx.createGain();
      kick.frequency.setValueAtTime(140, t);
      kick.frequency.exponentialRampToValueAtTime(40, t + 0.1);
      kg.gain.setValueAtTime(0.5, t);
      kg.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      kick.connect(kg); kg.connect(this.musicGain);
      kick.start(t); kick.stop(t + 0.15);
      // Bassline
      const notes = [55, 55, 73, 65, 55, 55, 82, 73];
      const bass = this.ctx.createOscillator();
      const bg = this.ctx.createGain();
      bass.type = 'sawtooth';
      bass.frequency.value = notes[step % notes.length];
      bg.gain.setValueAtTime(0.1, t);
      bg.gain.exponentialRampToValueAtTime(0.001, t + beatMs / 1000 * 0.8);
      const bf = this.ctx.createBiquadFilter();
      bf.type = 'lowpass'; bf.frequency.value = 400;
      bass.connect(bf); bf.connect(bg); bg.connect(this.musicGain);
      bass.start(t); bass.stop(t + beatMs / 1000);
      // Hi-hat
      if (step % 2 === 1) this.noise(0.05, 0.05, 6000);
      step++;
    };
    this.musicInterval = window.setInterval(playStep, beatMs / 2);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

const audio = new GameAudio();

export default function TunnelDash() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [boardTime, setBoardTime] = useState(0);
  const [magnetTime, setMagnetTime] = useState(0);
  const [score2xTime, setScore2xTime] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [phase, setPhase] = useState<'start' | 'play' | 'over'>('start');
  const [paused, setPaused] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalCoins, setFinalCoins] = useState(0);
  const [finalMaxCombo, setFinalMaxCombo] = useState(0);
  const [finalDistance, setFinalDistance] = useState(0);
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem('sp_runner_best') || 0));
  const [topScores, setTopScores] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem('sp_runner_top');
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter((n) => typeof n === 'number').slice(0, 5) : [];
    } catch {
      return [];
    }
  });

  const stateRef = useRef<GameState>({
    speed: 0.42,
    maxSpeed: 1.6,
    distance: 0,
    player: { lane: 0, laneTarget: 0, x: 0, y: 0, vy: 0, jumpT: 0, sliding: false, slideT: 0, runT: 0 },
    obstacles: [],
    notes: [],
    powerups: [],
    particles: [],
    trail: [],
    scorePopups: [],
    hoverboard: { active: false, time: 0, duration: 8 },
    magnet: { active: false, time: 0, duration: 7 },
    score2x: { active: false, time: 0, duration: 10 },
    combo: { count: 0, max: 0, timer: 0 },
    shake: { intensity: 0, time: 0 },
    spawnZ: 95,
    nextSpawn: 18,
    trackOffset: 0,
    bgOffset: 0,
    coins: 0,
    scoreGain: 0,
    running: false,
    paused: false,
    dayPhase: 0,
    flashRed: 0,
    camOffsetX: 0,
  });

  const sizeRef = useRef({ W: 0, H: 0, CX: 0, HORIZON: 0, ROAD_HALF: 0 });
  const uiTickRef = useRef(0);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sizeRef.current = {
      W: rect.width,
      H: rect.height,
      CX: rect.width / 2,
      HORIZON: rect.height * 0.42,
      ROAD_HALF: Math.min(rect.width * 0.55, 230),
    };
  }, []);

  const project = useCallback((wx: number, wy: number, wz: number) => {
    const { H, CX, HORIZON, ROAD_HALF } = sizeRef.current;
    const focal = 8;
    const s = focal / (wz + focal);
    return {
      x: CX + wx * s * ROAD_HALF,
      y: HORIZON + wy * s * H,
      s,
    };
  }, []);

  const randLane = () => LANES[Math.floor(Math.random() * 3)];
  const pickObsType = (speed: number): ObsType => {
    const r = Math.random();
    if (speed > 0.7 && r < 0.15) return 'train';
    if (r < 0.5) return 'low';
    if (r < 0.85) return 'high';
    return 'wall';
  };

  const spawnWave = useCallback(() => {
    const s = stateRef.current;
    const r = Math.random();
    if (r < 0.5) {
      const lanes = [-1, 0, 1].sort(() => Math.random() - 0.5);
      const count = Math.random() < 0.6 ? 1 : 2;
      for (let i = 0; i < count; i++) {
        const type = pickObsType(s.speed);
        if (type === 'train') {
          // Train spans 2 adjacent lanes — clamp to valid range and share a single z
          const lane1 = lanes[i];
          const adjacent = [lane1 - 1, lane1 + 1].filter((l) => l >= -1 && l <= 1);
          const lane2 = adjacent[Math.floor(Math.random() * adjacent.length)];
          const z = s.spawnZ + Math.random() * 6;
          s.obstacles.push({ lane: lane1, z, type });
          s.obstacles.push({ lane: lane2, z, type });
        } else {
          s.obstacles.push({ lane: lanes[i], z: s.spawnZ + Math.random() * 8, type });
        }
      }
    } else if (r < 0.82) {
      const lane = randLane();
      const count = 4 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        s.notes.push({
          lane,
          z: s.spawnZ + i * 2.6,
          y: 0.4 + (i % 2) * 0.18,
          phase: Math.random() * Math.PI * 2,
        });
      }
    } else if (r < 0.93) {
      s.powerups.push({
        lane: randLane(),
        z: s.spawnZ + 6,
        y: 0.5,
        type: 'hoverboard',
        phase: Math.random() * Math.PI * 2,
      });
    } else if (r < 0.97) {
      s.powerups.push({
        lane: randLane(),
        z: s.spawnZ + 6,
        y: 0.5,
        type: 'magnet',
        phase: Math.random() * Math.PI * 2,
      });
    } else {
      s.powerups.push({
        lane: randLane(),
        z: s.spawnZ + 6,
        y: 0.5,
        type: 'score2x',
        phase: Math.random() * Math.PI * 2,
      });
    }
  }, []);

  const canDodge = (type: ObsType) => {
    const s = stateRef.current;
    if (type === 'low') return s.player.jumpT > 0 && s.player.y > 0.05;
    if (type === 'high') return s.player.sliding || s.player.slideT > 0;
    return false;
  };

  const explode = (z: number, lane: number, y: number, color?: string) => {
    const s = stateRef.current;
    const colors = color ? [color, color, color, '#fff'] : [MUSICA_PINK, MUSICA_CYAN, MUSICA_YELLOW, MUSICA_GREEN];
    for (let i = 0; i < 18; i++) {
      s.particles.push({
        x: lane * LANE_W, y, z,
        vx: (Math.random() - 0.5) * 0.6,
        vy: Math.random() * 0.5 + 0.2,
        life: 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5,
      });
    }
  };
  const sparkle = (z: number, lane: number, y: number, color: string, count = 8) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      s.particles.push({
        x: lane * LANE_W, y, z,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        life: 0.5,
        color,
        size: 4,
      });
    }
  };
  const addScorePopup = (value: number, x: number, y: number, z: number, color: string) => {
    stateRef.current.scorePopups.push({ value, x, y, z, life: 0.8, color });
  };
  const triggerShake = (intensity: number, time: number) => {
    const sh = stateRef.current.shake;
    if (intensity > sh.intensity) {
      sh.intensity = intensity;
      sh.time = time;
    }
  };

  const collectNote = (n: Note) => {
    const s = stateRef.current;
    s.combo.count++;
    s.combo.timer = COMBO_TIMEOUT;
    if (s.combo.count > s.combo.max) s.combo.max = s.combo.count;
    const mult = comboMultiplier(s.combo.count);
    const baseGain = 10;
    const gain = Math.round(baseGain * mult * (s.score2x.active ? 2 : 1));
    s.scoreGain += gain;
    s.coins += 1;
    audio.coin(s.combo.count);
    sparkle(n.z, n.lane, n.y, mult >= 3 ? MUSICA_PINK : MUSICA_YELLOW, mult >= 3 ? 14 : 8);
    addScorePopup(gain, n.lane * LANE_W, n.y + 0.3, n.z, mult >= 3 ? MUSICA_PINK : MUSICA_YELLOW);
  };

  const collectPowerUp = (p: PowerUp) => {
    const s = stateRef.current;
    if (p.type === 'hoverboard') {
      s.hoverboard.active = true;
      s.hoverboard.time = s.hoverboard.duration;
      audio.hover();
    } else if (p.type === 'magnet') {
      s.magnet.active = true;
      s.magnet.time = s.magnet.duration;
      audio.magnetPickup();
    } else {
      s.score2x.active = true;
      s.score2x.time = s.score2x.duration;
      audio.score2xPickup();
    }
    sparkle(p.z, p.lane, p.y, p.type === 'hoverboard' ? MUSICA_GREEN : p.type === 'magnet' ? MUSICA_PINK : MUSICA_YELLOW, 16);
    addScorePopup(0, p.lane * LANE_W, p.y + 0.4, p.z, MUSICA_CYAN);
  };

  const update = useCallback((dt: number): boolean => {
    const s = stateRef.current;
    if (!s.running || s.paused) return false;
    s.distance += s.speed * dt * 60;
    s.trackOffset += s.speed * dt * 60;
    s.bgOffset += s.speed * dt * 60;
    // Steeper ramp: ramps up faster, peaks at 1.6
    s.speed = Math.min(s.maxSpeed, 0.42 + s.distance / 5500);
    s.dayPhase = (s.dayPhase + dt / 60) % 1;
    if (s.flashRed > 0) s.flashRed -= dt;

    s.player.lane += (s.player.laneTarget - s.player.lane) * Math.min(1, dt * 12);
    s.player.x = s.player.lane * LANE_W;
    s.player.runT += dt * (8 + s.speed * 6);

    // Camera follow: minimal shift so the player stays fully visible on the side lane.
    // 0 = world stays fixed, the player visibly walks to the left/right lane.
    const { ROAD_HALF } = sizeRef.current;
    const playerScale = 1;
    const targetCam = -s.player.x * 0.0 * ROAD_HALF * playerScale;
    s.camOffsetX += (targetCam - s.camOffsetX) * Math.min(1, dt * 6);

    const wasGrounded = s.player.jumpT === 0;
    if (s.player.jumpT > 0) {
      s.player.jumpT += dt;
      s.player.y += s.player.vy;
      s.player.vy -= dt * 1.5;
      if (s.player.y <= 0) {
        s.player.y = 0;
        s.player.jumpT = 0;
        s.player.vy = 0;
        if (!wasGrounded) audio.land();
      }
    }
    if (s.player.slideT > 0) {
      s.player.slideT -= dt;
      if (s.player.slideT <= 0) s.player.slideT = 0;
    }
    if (s.player.sliding && s.player.slideT <= 0) s.player.sliding = false;

    if (s.hoverboard.active) {
      s.hoverboard.time -= dt;
      if (s.hoverboard.time <= 0) { s.hoverboard.active = false; s.hoverboard.time = 0; audio.hoverEnd(); }
    }
    if (s.magnet.active) {
      s.magnet.time -= dt;
      if (s.magnet.time <= 0) s.magnet.active = false;
    }
    if (s.score2x.active) {
      s.score2x.time -= dt;
      if (s.score2x.time <= 0) s.score2x.active = false;
    }

    if (s.combo.count > 0) {
      s.combo.timer -= dt;
      if (s.combo.timer <= 0) {
        s.combo.count = 0;
        s.combo.timer = 0;
        audio.comboBreak();
      }
    }

    if (s.shake.time > 0) {
      s.shake.time -= dt;
      if (s.shake.time <= 0) s.shake.intensity = 0;
    }

    // Particle trail — color follows the highest active buff
    if (Math.random() < 0.5 + s.speed * 0.3) {
      let trailColor: string;
      if (s.hoverboard.active) trailColor = MUSICA_GREEN;
      else if (s.magnet.active) trailColor = MUSICA_PINK;
      else if (s.score2x.active) trailColor = MUSICA_YELLOW;
      else if (s.combo.count >= 20) trailColor = MUSICA_PINK;
      else if (s.combo.count >= 10) trailColor = MUSICA_CYAN;
      else if (s.combo.count >= 5) trailColor = MUSICA_YELLOW;
      else trailColor = 'rgba(255,255,255,0.5)';
      s.trail.push({
        x: s.player.x * LANE_W + (Math.random() - 0.5) * 0.1,
        y: 0.1,
        life: 0.4,
        maxLife: 0.4,
        color: trailColor,
        size: 3 + Math.random() * 2 + (s.combo.count >= 10 ? 1.5 : 0),
      });
    }

    const mv = s.speed * dt * 60;
    for (let i = 0; i < s.obstacles.length; i++) s.obstacles[i].z -= mv;
    for (let i = 0; i < s.notes.length; i++) s.notes[i].z -= mv;
    for (let i = 0; i < s.powerups.length; i++) s.powerups[i].z -= mv;
    for (let i = 0; i < s.particles.length; i++) {
      s.particles[i].x += s.particles[i].vx * dt;
      s.particles[i].y += s.particles[i].vy * dt;
      s.particles[i].life -= dt;
    }
    for (let i = 0; i < s.trail.length; i++) {
      s.trail[i].life -= dt;
    }
    for (let i = 0; i < s.scorePopups.length; i++) {
      s.scorePopups[i].y += dt * 0.4;
      s.scorePopups[i].life -= dt;
    }

    s.obstacles = s.obstacles.filter((o) => o.z > -3);
    s.notes = s.notes.filter((c) => c.z > -3);
    s.powerups = s.powerups.filter((p) => p.z > -3);
    s.particles = s.particles.filter((p) => p.life > 0);
    s.trail = s.trail.filter((t) => t.life > 0);
    s.scorePopups = s.scorePopups.filter((p) => p.life > 0);

    // Cap particle / popup counts so a Smash-spam can't tank the framerate
    if (s.particles.length > 250) s.particles = s.particles.slice(-250);
    if (s.trail.length > 80) s.trail = s.trail.slice(-80);
    if (s.scorePopups.length > 30) s.scorePopups = s.scorePopups.slice(-30);

    s.nextSpawn -= mv;
    if (s.nextSpawn <= 0) {
      spawnWave();
      // Fair spacing: minimum ~0.5s between waves even at top speed
      s.nextSpawn = Math.max(25, 22 + Math.random() * 8 - s.speed * 1.5);
    }

    const px = s.player.x;
    const playerY = s.player.y + 0.45;
    const magnetActive = s.magnet.active;

    // Magnet effect - attract notes
    if (magnetActive) {
      /* eslint-disable react-hooks/immutability */
      for (const c of s.notes) {
        if (c.z > 0 && c.z < 15) {
          const dx = (s.player.lane - c.lane) * 0.3 * dt * 4;
          c.lane += dx;
          if (c.lane < -1) c.lane = -1;
          if (c.lane > 1) c.lane = 1;
        }
      }
      /* eslint-enable react-hooks/immutability */
    }

    for (const o of s.obstacles) {
      if (o.z > -0.5 && o.z < 1.0 && Math.abs(o.lane - px) < 0.7) {
        if (canDodge(o.type)) continue;
        if (s.hoverboard.active || s.player.sliding) {
          explode(o.z, o.lane, 0.4);
          o.z = -100;
          triggerShake(6, 0.2);
          audio.smash();
        } else {
          audio.crash();
          triggerShake(18, 0.5);
          s.flashRed = 0.3;
          return true; // died
        }
      }
    }
    for (const c of s.notes) {
      if (c.z > -0.5 && c.z < 1.0 && Math.abs(c.lane - px) < 0.7 && Math.abs(c.y - playerY) < 0.7) {
        collectNote(c);
        c.z = -100;
      }
    }
    for (const p of s.powerups) {
      if (p.z > -0.5 && p.z < 1.0 && Math.abs(p.lane - px) < 0.7 && Math.abs(p.y - playerY) < 0.8) {
        collectPowerUp(p);
        p.z = -100;
        triggerShake(2, 0.1);
      }
    }
    return false;
    // collectNote/collectPowerUp read refs only — safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spawnWave]);

  // === Drawing ===
  const lerpColor = (a: string, b: string, t: number) => {
    const ah = a.replace('#', '');
    const bh = b.replace('#', '');
    const ar = parseInt(ah.slice(0, 2), 16), ag = parseInt(ah.slice(2, 4), 16), ab = parseInt(ah.slice(4, 6), 16);
    const br = parseInt(bh.slice(0, 2), 16), bg = parseInt(bh.slice(2, 4), 16), bb = parseInt(bh.slice(4, 6), 16);
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const b2 = Math.round(ab + (bb - ab) * t);
    return `rgb(${r},${g},${b2})`;
  };

  const drawSky = (ctx: CanvasRenderingContext2D) => {
    const { W, H, HORIZON } = sizeRef.current;
    const t = stateRef.current.bgOffset * 0.001;
    // Day/night cycle: 0 = day, 0.25 = sunset, 0.5 = dusk, 0.75 = night
    const phase = stateRef.current.dayPhase;
    let top: string, mid: string, low: string;
    if (phase < 0.25) {
      top = '#0a0a30'; mid = '#3a1a6a'; low = '#a03060';
    } else if (phase < 0.5) {
      const k = (phase - 0.25) / 0.25;
      top = lerpColor('#0a0a30', '#1a0a3a', k);
      mid = lerpColor('#3a1a6a', '#6a2a4a', k);
      low = lerpColor('#a03060', '#ff6a3a', k);
    } else if (phase < 0.75) {
      const k = (phase - 0.5) / 0.25;
      top = lerpColor('#1a0a3a', '#050520', k);
      mid = lerpColor('#6a2a4a', '#1a0a30', k);
      low = lerpColor('#ff6a3a', '#3a1a4a', k);
    } else {
      const k = (phase - 0.75) / 0.25;
      top = lerpColor('#050520', '#0a0a30', k);
      mid = lerpColor('#1a0a30', '#3a1a6a', k);
      low = lerpColor('#3a1a4a', '#a03060', k);
    }
    const g = ctx.createLinearGradient(0, 0, 0, HORIZON);
    g.addColorStop(0, top);
    g.addColorStop(0.5, mid);
    g.addColorStop(0.85, low);
    g.addColorStop(1, lerpColor(low, '#ff6a3a', 0.3));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, HORIZON);

    // Sun/moon position depends on phase
    const isNight = phase > 0.5 && phase < 0.85;
    const sunX = W * 0.72;
    const sunY = HORIZON * (0.5 + 0.2 * Math.sin(phase * Math.PI * 2));
    const sunR = Math.min(W, H) * 0.18;
    if (!isNight) {
      const sun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
      sun.addColorStop(0, 'rgba(255,235,59,0.9)');
      sun.addColorStop(0.4, 'rgba(255,140,80,0.5)');
      sun.addColorStop(1, 'rgba(255,140,80,0)');
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, W, HORIZON);
    } else {
      // Moon
      ctx.fillStyle = '#e0e0ff';
      ctx.shadowColor = '#aaaaff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Stars (visible at night)
    if (isNight) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (let i = 0; i < 60; i++) {
        const x = (i * 73 + t * 20) % W;
        const y = ((i * 37) % (HORIZON * 0.7));
        const tw = Math.sin(t * 3 + i) * 0.5 + 0.5;
        const r = ((i * 13) % 3) * 0.5 + 0.5;
        ctx.globalAlpha = tw;
        ctx.fillRect(x, y, r, r);
      }
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (let i = 0; i < 30; i++) {
        const x = (i * 73 + t * 20) % W;
        const y = ((i * 37) % (HORIZON * 0.5));
        const r = ((i * 13) % 3) * 0.5 + 0.5;
        ctx.fillRect(x, y, r, r);
      }
    }
  };

  const drawSpeedLines = (ctx: CanvasRenderingContext2D) => {
    const s = stateRef.current;
    if (s.speed < 0.7) return;
    const { CX, HORIZON } = sizeRef.current;
    const intensity = (s.speed - 0.7) / (s.maxSpeed - 0.7);
    ctx.strokeStyle = `rgba(255,255,255,${0.15 * intensity})`;
    ctx.lineWidth = 1;
    const t = performance.now() * 0.001;
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2 + t * 0.5;
      const r1 = 80 + Math.random() * 40;
      const r2 = r1 + 60 + Math.random() * 100 * intensity;
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(angle) * r1, HORIZON + Math.sin(angle) * r1 * 0.5);
      ctx.lineTo(CX + Math.cos(angle) * r2, HORIZON + Math.sin(angle) * r2 * 0.5);
      ctx.stroke();
    }
  };

  const drawBuildings = (ctx: CanvasRenderingContext2D) => {
    const baseOffset = (stateRef.current.bgOffset * 0.3) % 8;
    const isNight = stateRef.current.dayPhase > 0.5 && stateRef.current.dayPhase < 0.85;
    for (let side = -1; side <= 1; side += 2) {
      for (let i = -1; i < 12; i++) {
        const z = i * 6 - baseOffset;
        if (z < 1 || z > 100) continue;
        const baseX = side * 2.2;
        const p = project(baseX, 0, z);
        const top = project(baseX, 1.6, z);
        const w = 0.65 * p.s * sizeRef.current.ROAD_HALF;
        const h = (p.y - top.y) * 1.15;
        if (h < 4) continue;
        const hue = (i * 47 + stateRef.current.distance) % 360;
        ctx.fillStyle = `hsl(${(hue + 260) % 360}, 50%, ${isNight ? 6 + (i % 3) * 3 : 12 + (i % 3) * 5}%)`;
        ctx.fillRect(p.x - w, p.y - h, w * 2, h);
        const winSize = Math.max(2, w * 0.16);
        const winGap = w * 0.35;
        for (let wy = 0; wy < h - winGap; wy += winGap * 1.4) {
          for (let wx = -w + winGap; wx < w - winGap; wx += winGap * 1.4) {
            if ((i + Math.floor(wy / winGap) + Math.floor(wx / winGap)) % (isNight ? 2 : 3) === 0) continue;
            ctx.fillStyle = isNight ? `hsla(${(hue + 60) % 360}, 90%, 75%, 0.95)` : `hsla(${(hue + 60) % 360}, 80%, 65%, 0.85)`;
            ctx.fillRect(p.x + wx, p.y - h + wy, winSize, winSize);
          }
        }
        if (i % 3 === 0) {
          ctx.fillStyle = MUSICA_GREEN;
          const bw = w * 1.2;
          const bh = w * 1.2;
          const by = p.y - h * 0.55;
          ctx.beginPath();
          ctx.arc(p.x, by + bh / 2, bw / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(p.x - bw * 0.15, by + bh * 0.4, bw * 0.18, 0.2, Math.PI - 0.2, true);
          ctx.lineTo(p.x + bw * 0.1, by + bh * 0.55);
          ctx.lineTo(p.x + bw * 0.25, by + bh * 0.35);
          ctx.fill();
        }
      }
    }
  };

  const drawRoad = (ctx: CanvasRenderingContext2D) => {
    const { W, H, HORIZON, CX, ROAD_HALF } = sizeRef.current;
    // Matter, fast einheitlicher Asphalt — kein glänzender Wasser-/Spiegel-Verlauf mehr.
    const g = ctx.createLinearGradient(0, HORIZON, 0, H);
    g.addColorStop(0, '#15101c');
    g.addColorStop(1, '#0c0a14');
    ctx.fillStyle = g;
    ctx.fillRect(0, HORIZON, W, H - HORIZON);

    ctx.fillStyle = '#120d18';
    ctx.beginPath();
    ctx.moveTo(CX - 6, HORIZON);
    ctx.lineTo(CX + 6, HORIZON);
    ctx.lineTo(CX + ROAD_HALF, H);
    ctx.lineTo(CX - ROAD_HALF, H);
    ctx.closePath();
    ctx.fill();

    const off = (stateRef.current.trackOffset * 0.4) % 4;
    ctx.lineWidth = 2;
    for (let i = 0; i < 26; i++) {
      const z = i * 4 + off;
      if (z < 0.5) continue;
      const a1 = project(-LANE_W / 2, 0, z);
      const a2 = project(-LANE_W / 2, 0, z + 1.4);
      const b1 = project(LANE_W / 2, 0, z);
      const b2 = project(LANE_W / 2, 0, z + 1.4);
      ctx.globalAlpha = Math.min(1, a1.s * 1.6);
      ctx.strokeStyle = MUSICA_GREEN;
      ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(a2.x, a2.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(b1.x, b1.y); ctx.lineTo(b2.x, b2.y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const e1 = project(-1.5, 0, 0.1);
    const e2 = project(-1.5, 0.001, 80);
    const e3 = project(1.5, 0.001, 80);
    const e4 = project(1.5, 0, 0.1);
    ctx.strokeStyle = MUSICA_GREEN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(e1.x, e1.y); ctx.lineTo(e2.x, e2.y);
    ctx.moveTo(e4.x, e4.y); ctx.lineTo(e3.x, e3.y);
    ctx.stroke();
  };

  const drawTrail = (ctx: CanvasRenderingContext2D) => {
    const s = stateRef.current;
    for (const t of s.trail) {
      const p = project(t.x, t.y, 0);
      const a = Math.max(0, t.life / t.maxLife);
      ctx.fillStyle = t.color;
      ctx.globalAlpha = a * 0.7;
      ctx.beginPath();
      ctx.arc(p.x, p.y + 18 * (1 - a), t.size * a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const drawObstacles = (ctx: CanvasRenderingContext2D) => {
    const s = stateRef.current;
    for (const o of s.obstacles) {
      if (o.z < 0.5 || o.z > 100) continue;
      const x = o.lane * LANE_W;
      let w: number, y: number, c1: string, c2: string, kind: string, glowColor: string;
      if (o.type === 'low') { w = 0.6; y = 0.35; c1 = '#ff3333'; c2 = '#aa0000'; kind = 'speaker'; glowColor = 'rgba(255,60,60,0.55)'; }
      else if (o.type === 'high') { w = 0.75; y = 0.85; c1 = '#ff8a00'; c2 = '#cc5500'; kind = 'boom'; glowColor = 'rgba(255,140,40,0.55)'; }
      else if (o.type === 'train') { w = 0.55; y = 0.7; c1 = '#1a1a2e'; c2 = '#0a0a1a'; kind = 'train'; glowColor = 'rgba(29,185,84,0.6)'; }
      else { w = 0.5; y = 1.1; c1 = MUSICA_PURPLE; c2 = '#5e2a99'; kind = 'tower'; glowColor = 'rgba(155,89,255,0.5)'; }

      // Ground warning streak — shows the danger zone on the road before the obstacle arrives
      const streakFar = project(x, 0.01, o.z + 4);
      const streakNear = project(x, 0.01, o.z - 0.5);
      const streakW = w * 0.4 * streakFar.s * sizeRef.current.ROAD_HALF;
      const streakGrad = ctx.createLinearGradient(streakFar.x, 0, streakNear.x, 0);
      streakGrad.addColorStop(0, glowColor.replace(/[\d.]+\)$/, '0)'));
      streakGrad.addColorStop(1, glowColor);
      ctx.fillStyle = streakGrad;
      ctx.beginPath();
      ctx.moveTo(streakFar.x - streakW, streakFar.y);
      ctx.lineTo(streakFar.x + streakW, streakFar.y);
      ctx.lineTo(streakNear.x + streakW * 0.55, streakNear.y);
      ctx.lineTo(streakNear.x - streakW * 0.55, streakNear.y);
      ctx.closePath();
      ctx.fill();

      // Countdown ring — pulsing circle on the road that closes in as the obstacle approaches
      if (o.z > 1.5 && o.z < 30) {
        const ringZ = o.z - 1.2;
        const ringPos = project(x, 0.01, ringZ);
        const ringR = Math.max(18, w * 0.7 * ringPos.s * sizeRef.current.ROAD_HALF);
        const proximity = 1 - Math.min(1, (o.z - 1.5) / 25);
        const pulse = 0.7 + Math.sin(s.distance * 0.4) * 0.3;
        const ringInner = ringR * (1 - proximity * 0.85) * pulse;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ringPos.x, ringPos.y, ringR, 0, Math.PI * 2);
        ctx.stroke();
        if (ringInner > 4) {
          ctx.globalAlpha = 0.6 + proximity * 0.4;
          ctx.fillStyle = glowColor.replace(/[\d.]+\)$/, `${0.15 + proximity * 0.35})`);
          ctx.beginPath();
          ctx.arc(ringPos.x, ringPos.y, ringInner, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // Glow halo around the obstacle (visibility boost)
      const glowCenter = project(x, y * 0.5, o.z);
      const glowR = Math.max(20, w * 1.4 * glowCenter.s * sizeRef.current.ROAD_HALF);
      const glowGrad = ctx.createRadialGradient(glowCenter.x, glowCenter.y, 0, glowCenter.x, glowCenter.y, glowR);
      glowGrad.addColorStop(0, glowColor);
      glowGrad.addColorStop(1, glowColor.replace(/[\d.]+\)$/, '0)'));
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(glowCenter.x, glowCenter.y, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Shadow on the ground (grounds the obstacle, no mirror effect)
      const shadow = project(x, 0.02, o.z);
      let shadowWidth = w * 0.55;
      let shadowHeight = 0.3;
      let shadowBlur = 0;
      let shadowColor = 'rgba(0,0,0,0.45)';
      if (o.type === 'low') {
        // Lower/obstacle - flat, dark shadow
        shadowHeight = 0.25;
        shadowColor = 'rgba(0,0,0,0.5)';
      } else if (o.type === 'high') {
        // Upper obstacle - taller, softer shadow
        shadowHeight = 0.35;
        shadowColor = 'rgba(0,0,0,0.25)';
        shadowBlur = 2;
      } else if (o.type === 'train') {
        // Train - wider, darker, broken shadow (rail track look)
        shadowWidth = 1.3;
        shadowHeight = 0.2;
        shadowColor = 'rgba(0,0,0,0.6)';
      } else {
        // Wall/tower - deep, soft shadow with spread
        shadowHeight = 0.45;
        shadowColor = 'rgba(0,0,0,0.35)';
        shadowBlur = 4;
      }

      const sw = shadowWidth * shadow.s * sizeRef.current.ROAD_HALF;
      ctx.fillStyle = shadowColor;
      ctx.beginPath();
      ctx.ellipse(shadow.x, shadow.y, sw, sw * shadowHeight, 0, 0, Math.PI * 2);
      if (shadowBlur > 0) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
      }
      ctx.fill();
      if (shadowBlur > 0) ctx.shadowBlur = 0;

      const p1 = project(x - w / 2, y, o.z - 0.4);
      const p2 = project(x + w / 2, y, o.z - 0.4);
      const p3 = project(x + w / 2, y, o.z + 0.4);
      const p4 = project(x - w / 2, y, o.z + 0.4);
      ctx.fillStyle = c1;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
      ctx.closePath(); ctx.fill();

      const p5 = project(x - w / 2, 0, o.z + 0.4);
      const p6 = project(x + w / 2, 0, o.z + 0.4);
      const grd = ctx.createLinearGradient(0, p5.y, 0, p4.y);
      grd.addColorStop(0, c1); grd.addColorStop(1, c2);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(p5.x, p5.y); ctx.lineTo(p6.x, p6.y);
      ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
      ctx.closePath(); ctx.fill();

      const p7 = project(x + w / 2, 0, o.z - 0.4);
      const p8 = project(x + w / 2, y, o.z - 0.4);
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.moveTo(p6.x, p6.y); ctx.lineTo(p7.x, p7.y);
      ctx.lineTo(p8.x, p8.y); ctx.lineTo(p3.x, p3.y);
      ctx.closePath(); ctx.fill();

      const cx = (p5.x + p6.x) / 2;
      const cy = (p5.y + p4.y) / 2;
      const rw = Math.abs(p6.x - p5.x) * 0.6;
      const rh = Math.abs(p5.y - p4.y) * 0.6;
      if (kind === 'speaker') {
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.ellipse(cx, cy, rw * 0.35, rh * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = MUSICA_GREEN;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rw * 0.12, rh * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === 'boom') {
        ctx.fillStyle = '#000';
        for (let i = 0; i < 2; i++) {
          ctx.beginPath();
          ctx.ellipse(cx - rw * 0.2 + i * rw * 0.4, cy, rw * 0.2, rh * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (kind === 'train') {
        // Train = subway car
        ctx.fillStyle = MUSICA_GREEN;
        ctx.fillRect(cx - rw * 0.45, cy - rh * 0.3, rw * 0.9, rh * 0.6);
        ctx.fillStyle = '#000';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(cx - rw * 0.35 + i * rw * 0.32, cy - rh * 0.15, rw * 0.18, rh * 0.3);
        }
        // Headlights
        ctx.fillStyle = '#ffff80';
        ctx.beginPath();
        ctx.arc(cx - rw * 0.4, cy + rh * 0.35, rw * 0.06, 0, Math.PI * 2);
        ctx.arc(cx + rw * 0.4, cy + rh * 0.35, rw * 0.06, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillRect(cx - rw * 0.4, cy - rh * 0.3, rw * 0.8, rh * 0.6);
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - rw * 0.18, cy, rh * 0.12, 0, Math.PI * 2);
        ctx.arc(cx + rw * 0.18, cy, rh * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const drawNotes = (ctx: CanvasRenderingContext2D) => {
    const s = stateRef.current;
    for (const n of s.notes) {
      if (n.z < 0.5 || n.z > 100) continue;
      const x = n.lane * LANE_W;
      const bob = Math.sin(s.distance * 0.1 + n.phase) * 0.08;
      const p = project(x, n.y + bob, n.z);
      const r = Math.max(4, 0.18 * p.s * 100);
      if (r < 3) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      const tilt = Math.sin(s.distance * 0.15 + n.phase) * 0.2;
      ctx.rotate(tilt);
      const grad = ctx.createLinearGradient(-r, -r, r, r);
      grad.addColorStop(0, '#fff4a3');
      grad.addColorStop(0.5, MUSICA_YELLOW);
      grad.addColorStop(1, '#ff8a00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, r * 0.4, r * 0.55, r * 0.4, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(r * 0.35, -r * 0.8, r * 0.18, r * 1.2);
      ctx.beginPath();
      ctx.moveTo(r * 0.53, -r * 0.8);
      ctx.quadraticCurveTo(r * 1.2, -r * 0.4, r * 0.53, -r * 0.1);
      ctx.lineWidth = r * 0.18;
      ctx.strokeStyle = grad;
      ctx.stroke();
      ctx.restore();
      // Subtle glow above the note only — no ground reflection
      const glowGrad = ctx.createRadialGradient(p.x, p.y - r * 0.4, 0, p.x, p.y - r * 0.4, r * 0.9);
      glowGrad.addColorStop(0, 'rgba(255,235,59,0.35)');
      glowGrad.addColorStop(1, 'rgba(255,235,59,0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y - r * 0.4, r * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawPowerUps = (ctx: CanvasRenderingContext2D) => {
    const s = stateRef.current;
    for (const p of s.powerups) {
      if (p.z < 0.5 || p.z > 100) continue;
      const x = p.lane * LANE_W;
      const bob = Math.sin(s.distance * 0.1 + p.phase) * 0.08;
      const pp = project(x, p.y + bob, p.z);
      const r = Math.max(6, 0.35 * pp.s * 100);
      if (r < 4) continue;

      let color: string, symbol: string;
      if (p.type === 'hoverboard') { color = MUSICA_GREEN; symbol = '🛹'; }
      else if (p.type === 'magnet') { color = MUSICA_PINK; symbol = '🧲'; }
      else { color = MUSICA_YELLOW; symbol = '⚡'; }

      const pulse = 0.85 + Math.sin(s.distance * 0.35 + p.phase) * 0.25;
      const beaconH = Math.max(60, pp.s * 220) * pulse;
      const beaconGrad = ctx.createLinearGradient(0, pp.y - beaconH, 0, pp.y);
      beaconGrad.addColorStop(0, color + '00');
      beaconGrad.addColorStop(1, color + 'cc');
      ctx.fillStyle = beaconGrad;
      ctx.beginPath();
      ctx.moveTo(pp.x - r * 0.4, pp.y);
      ctx.lineTo(pp.x + r * 0.4, pp.y);
      ctx.lineTo(pp.x + r * 0.15, pp.y - beaconH);
      ctx.lineTo(pp.x - r * 0.15, pp.y - beaconH);
      ctx.closePath();
      ctx.fill();

      const glow = ctx.createRadialGradient(pp.x, pp.y, 0, pp.x, pp.y, r * 2.6 * pulse);
      glow.addColorStop(0, color + 'cc');
      glow.addColorStop(1, color + '00');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(pp.x, pp.y, r * 2.6 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Disc/circle background
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pp.x, pp.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(pp.x, pp.y, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.font = `bold ${r * 1.0}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, pp.x, pp.y);
    }
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    const s = stateRef.current;
    const p = s.player;
    const { H, CX } = sizeRef.current;
    const sliding = p.sliding && p.jumpT === 0;
    // Spielfigur an fixer Pixelposition (nicht in der 3D-Welt-Tiefe) — bleibt immer sichtbar
    // Lane-Offset: 100px pro Lane. Y-Offset: 250px pro maximalem Sprung.
    const px = CX + p.x * 100;
    const groundY = H - 60;
    const py = groundY - p.y * 250;
    const scale = 1;

    // Magnet aura
    if (s.magnet.active) {
      const aura = ctx.createRadialGradient(px, py, 0, px, py, 80 * scale);
      aura.addColorStop(0, 'rgba(255,92,214,0.3)');
      aura.addColorStop(0.6, 'rgba(255,92,214,0.1)');
      aura.addColorStop(1, 'rgba(255,92,214,0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(px, py, 80 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    if (s.score2x.active) {
      const aura = ctx.createRadialGradient(px, py, 0, px, py, 70 * scale);
      aura.addColorStop(0, 'rgba(255,235,59,0.4)');
      aura.addColorStop(1, 'rgba(255,235,59,0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(px, py, 70 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(px, py);

    if (s.hoverboard.active || sliding) {
      const tilt = Math.sin(s.distance * 0.3) * 0.08;
      ctx.save();
      ctx.rotate(tilt);
      const grad = ctx.createLinearGradient(-50 * scale, 0, 50 * scale, 0);
      grad.addColorStop(0, '#ff0044');
      grad.addColorStop(0.2, MUSICA_YELLOW);
      grad.addColorStop(0.4, MUSICA_GREEN);
      grad.addColorStop(0.6, MUSICA_CYAN);
      grad.addColorStop(0.8, MUSICA_PINK);
      grad.addColorStop(1, '#ff0044');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 24 * scale, 55 * scale, 8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 3; i++) {
        const a = s.distance * 0.2 + i * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 45 * scale, 24 * scale + Math.sin(a * 2) * 3, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (sliding) {
      ctx.rotate(-0.15);
      ctx.fillStyle = MUSICA_GREEN;
      ctx.fillRect(-22 * scale, -16 * scale, 52 * scale, 20 * scale);
      ctx.fillStyle = '#000';
      ctx.fillRect(-26 * scale, -12 * scale, 6 * scale, 14 * scale);
      ctx.fillStyle = '#ffd9b3';
      ctx.beginPath();
      ctx.arc(32 * scale, -6 * scale, 13 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(32 * scale, -12 * scale, 13 * scale, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(19 * scale, -14 * scale, 26 * scale, 3 * scale);
      ctx.strokeStyle = MUSICA_PINK;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(32 * scale, -6 * scale, 16 * scale, Math.PI * 0.8, Math.PI * 0.2, true);
      ctx.stroke();
    } else {
      const run = p.runT;
      const legSwing = Math.sin(run) * 0.5;
      const armSwing = Math.sin(run) * 0.45;
      const bobY = Math.abs(Math.sin(run)) * 3;
      ctx.translate(0, -bobY * scale);

      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 22 * scale, 22 * scale, 5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1a1a2e';
      ctx.save();
      ctx.translate(-7 * scale, 4 * scale);
      ctx.rotate(legSwing);
      ctx.fillRect(-4 * scale, 0, 8 * scale, 20 * scale);
      ctx.restore();
      ctx.save();
      ctx.translate(7 * scale, 4 * scale);
      ctx.rotate(-legSwing);
      ctx.fillRect(-4 * scale, 0, 8 * scale, 20 * scale);
      ctx.restore();

      ctx.fillStyle = MUSICA_GREEN;
      ctx.fillRect(-11 * scale, 21 * scale, 10 * scale, 5 * scale);
      ctx.fillRect(1 * scale, 21 * scale, 10 * scale, 5 * scale);

      ctx.fillStyle = MUSICA_GREEN;
      ctx.beginPath();
      ctx.roundRect(-13 * scale, -18 * scale, 26 * scale, 28 * scale, 4 * scale);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(-12 * scale, -10 * scale, 24 * scale, 2 * scale);
      ctx.fillStyle = '#000';
      ctx.fillRect(-16 * scale, -13 * scale, 6 * scale, 16 * scale);

      ctx.fillStyle = '#ffd9b3';
      ctx.save();
      ctx.translate(-13 * scale, -14 * scale);
      ctx.rotate(armSwing);
      ctx.fillRect(-4 * scale, 0, 7 * scale, 16 * scale);
      ctx.restore();
      ctx.save();
      ctx.translate(13 * scale, -14 * scale);
      ctx.rotate(-armSwing);
      ctx.fillRect(-3 * scale, 0, 7 * scale, 16 * scale);
      ctx.restore();

      ctx.fillStyle = '#ffd9b3';
      ctx.beginPath();
      ctx.arc(0, -27 * scale, 12 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a2a1a';
      ctx.beginPath();
      ctx.arc(0, -32 * scale, 12 * scale, Math.PI * 1.15, Math.PI * 1.85);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(0, -32 * scale, 12 * scale, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-12 * scale, -34 * scale, 24 * scale, 3 * scale);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, -29 * scale, 12 * scale, 2.5 * scale);
      ctx.strokeStyle = MUSICA_PINK;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(0, -27 * scale, 14 * scale, Math.PI * 0.85, Math.PI * 0.15, true);
      ctx.stroke();
      ctx.fillStyle = MUSICA_PINK;
      ctx.fillRect(-14 * scale, -28 * scale, 4 * scale, 6 * scale);
      ctx.fillRect(10 * scale, -28 * scale, 4 * scale, 6 * scale);
      // Blink occasionally
      const blink = Math.sin(p.runT * 0.3) > 0.98;
      ctx.fillStyle = '#000';
      if (blink) {
        ctx.fillRect(-5 * scale, -29 * scale, 5 * scale, 1.5 * scale);
        ctx.fillRect(1 * scale, -29 * scale, 5 * scale, 1.5 * scale);
      } else {
        ctx.fillRect(-4 * scale, -29 * scale, 2.5 * scale, 2.5 * scale);
        ctx.fillRect(2 * scale, -29 * scale, 2.5 * scale, 2.5 * scale);
      }
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.arc(0, -23 * scale, 3 * scale, 0, Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    const s = stateRef.current;
    for (const p of s.particles) {
      if (p.z < 0.5 || p.z > 100) continue;
      const pp = project(p.x, p.y, p.z);
      const a = Math.max(0, Math.min(1, p.life));
      ctx.fillStyle = p.color;
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(pp.x, pp.y, p.size * a + 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const drawScorePopups = (ctx: CanvasRenderingContext2D) => {
    const s = stateRef.current;
    for (const p of s.scorePopups) {
      if (p.z < 0.5 || p.z > 100) continue;
      const pp = project(p.x, p.y, p.z);
      const a = Math.max(0, Math.min(1, p.life / 0.8));
      const isHighCombo = p.color === MUSICA_PINK;
      const baseSize = isHighCombo ? 24 : 16;
      const fontSize = Math.max(10, baseSize * pp.s * 4);
      // Bounce: starts at 1.35x, settles to 1.0x as the popup ages
      const scale = 1 + (1 - a) * 0.35;

      ctx.save();
      ctx.translate(pp.x, pp.y);
      ctx.scale(scale, scale);
      if (isHighCombo) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
      }
      ctx.fillStyle = p.color;
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = isHighCombo ? 4 : 3;
      ctx.font = `900 ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (p.value > 0) {
        ctx.strokeText(`+${p.value}`, 0, 0);
        ctx.fillText(`+${p.value}`, 0, 0);
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { W, H } = sizeRef.current;
    const s = stateRef.current;
    ctx.save();
    // Camera follow (keeps player visible at edges)
    ctx.translate(s.camOffsetX, 0);
    // Screen shake
    if (s.shake.time > 0) {
      const k = s.shake.time / 0.5;
      const amp = s.shake.intensity * k;
      ctx.translate((Math.random() - 0.5) * amp, (Math.random() - 0.5) * amp);
    }
    ctx.clearRect(-20, -20, W + 40, H + 40);
    drawSky(ctx);
    drawBuildings(ctx);
    drawSpeedLines(ctx);
    drawRoad(ctx);
    drawTrail(ctx);
    drawObstacles(ctx);
    drawNotes(ctx);
    drawPowerUps(ctx);
    drawPlayer(ctx);
    drawParticles(ctx);
    drawScorePopups(ctx);
    if (s.flashRed > 0) {
      ctx.fillStyle = `rgba(255,0,0,${s.flashRed * 0.5})`;
      ctx.fillRect(-20, -20, W + 40, H + 40);
    }
    ctx.restore();
    // draw functions read from refs only — safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  // Resize
  useEffect(() => {
    resize();
    const onR = () => resize();
    window.addEventListener('resize', onR);
    const ro = new ResizeObserver(onR);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => {
      window.removeEventListener('resize', onR);
      ro.disconnect();
    };
  }, [resize]);

  useEffect(() => { render(); }, [render]);

  // Game loop
  useEffect(() => {
    if (phase !== 'play') {
      audio.stopMusic();
      return;
    }
    audio.init();
    audio.resume();
    audio.startMusic();
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const died = update(dt);
      if (died) {
        audio.stopMusic();
        const s = stateRef.current;
        s.running = false;
        const fs = s.scoreGain + Math.floor(s.distance / 5);
        setFinalScore(fs);
        setFinalCoins(s.coins);
        setFinalMaxCombo(s.combo.max);
        setFinalDistance(Math.floor(s.distance / 5));
        setBestScore((prev) => {
          const ns = Math.max(prev, fs);
          try {
            localStorage.setItem('sp_runner_best', String(ns));
          } catch {
            /* ignore storage errors */
          }
          // Confetti on new best
          if (ns > prev) {
            try {
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              setTimeout(() => confetti({ particleCount: 60, spread: 90, origin: { y: 0.4 } }), 200);
            } catch { /* ignore */ }
          }
          return ns;
        });
        // Top-5 leaderboard
        setTopScores((prev) => {
          const next = [...prev, fs].sort((a, b) => b - a).slice(0, 5);
          try {
            localStorage.setItem('sp_runner_top', JSON.stringify(next));
          } catch {
            /* ignore */
          }
          return next;
        });
        setPhase('over');
        return;
      }
      uiTickRef.current += dt;
      if (uiTickRef.current > 0.1) {
        uiTickRef.current = 0;
        const s = stateRef.current;
        setScore(s.scoreGain + Math.floor(s.distance / 5));
        setCoins(s.coins);
        setBoardTime(s.hoverboard.active ? s.hoverboard.time : 0);
        setMagnetTime(s.magnet.active ? s.magnet.time : 0);
        setScore2xTime(s.score2x.active ? s.score2x.time : 0);
        setComboCount(s.combo.count);
      }
      render();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      audio.stopMusic();
    };
  }, [phase, update, render]);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.speed = 0.42;
    s.maxSpeed = 1.6;
    s.distance = 0;
    s.player = { lane: 0, laneTarget: 0, x: 0, y: 0, vy: 0, jumpT: 0, sliding: false, slideT: 0, runT: 0 };
    s.obstacles = [];
    s.notes = [];
    s.powerups = [];
    s.particles = [];
    s.trail = [];
    s.scorePopups = [];
    s.hoverboard = { active: false, time: 0, duration: 6 };
    s.magnet = { active: false, time: 0, duration: 5 };
    s.score2x = { active: false, time: 0, duration: 8 };
    s.combo = { count: 0, max: 0, timer: 0 };
    s.shake = { intensity: 0, time: 0 };
    s.spawnZ = 95;
    s.nextSpawn = 18;
    s.trackOffset = 0;
    s.bgOffset = 0;
    s.coins = 0;
    s.scoreGain = 0;
    s.running = true;
    s.paused = false;
    s.dayPhase = 0;
    s.flashRed = 0;
    s.camOffsetX = 0;
    setScore(0);
    setCoins(0);
    setBoardTime(0);
    setMagnetTime(0);
    setScore2xTime(0);
    setComboCount(0);
    setFinalScore(0);
    setPaused(false);
    setPhase('play');
    audio.init();
    audio.resume();
    audio.click();
  }, []);

  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (phase !== 'play') return;
    if (s.paused) {
      s.paused = false;
      setPaused(false);
      audio.resume();
      audio.startMusic();
    } else {
      s.paused = true;
      setPaused(true);
      audio.stopMusic();
    }
  }, [phase]);

  const touchRef = useRef({ x: 0, y: 0, t: 0, active: false });

  const performAction = useCallback((action: 'left' | 'right' | 'jump' | 'slide') => {
    const s = stateRef.current;
    if (!s.running || s.paused) return;
    if (action === 'left' && s.player.laneTarget > -1) s.player.laneTarget--;
    if (action === 'right' && s.player.laneTarget < 1) s.player.laneTarget++;
    if (action === 'jump' && s.player.jumpT === 0 && !s.player.sliding) {
      s.player.vy = 0.85;
      s.player.jumpT = 1;
      audio.jump();
    }
    if (action === 'slide') {
      s.player.slideT = 0.7;
      if (s.player.jumpT > 0) s.player.vy = -0.5;
      else s.player.sliding = true;
    }
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter', 'Escape', 'p', 'P'].includes(e.key)) {
        e.preventDefault();
      }
      if ((e.key === 'p' || e.key === 'P') && phase === 'play') {
        togglePause();
        return;
      }
      if (phase === 'start' && (e.key === ' ' || e.key === 'Enter')) {
        startGame();
        return;
      }
      if (phase === 'over' && (e.key === ' ' || e.key === 'Enter' || e.key === 'r' || e.key === 'R')) {
        startGame();
        return;
      }
      if (phase !== 'play' || paused) return;
      if (e.key === 'ArrowLeft') performAction('left');
      if (e.key === 'ArrowRight') performAction('right');
      if (e.key === 'ArrowUp') performAction('jump');
      if (e.key === 'ArrowDown') performAction('slide');
      if (e.key === 'Escape') {
        if (paused) togglePause();
        else navigate('/musica/settings');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, paused, startGame, navigate, togglePause, performAction]);

  // Touch / swipe controls
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const SWIPE_MIN = 30;
    const SWIPE_MAX_TIME = 600;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      touchRef.current = { x: t.clientX, y: t.clientY, t: performance.now(), active: true };
    };
    const onMove = (e: TouchEvent) => {
      // Prevent default to stop scrolling/zooming
      if (touchRef.current.active) e.preventDefault();
    };
    const onEnd = (e: TouchEvent) => {
      if (!touchRef.current.active) return;
      touchRef.current.active = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchRef.current.x;
      const dy = t.clientY - touchRef.current.y;
      const dt = performance.now() - touchRef.current.t;
      if (dt > SWIPE_MAX_TIME) return;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (absX < SWIPE_MIN && absY < SWIPE_MIN) return;
      if (phase !== 'play' || paused) return;
      if (absX > absY) {
        if (dx > 0) performAction('right');
        else performAction('left');
      } else {
        if (dy < 0) performAction('jump');
        else performAction('slide');
      }
    };
    const opts = { passive: false } as AddEventListenerOptions;
    wrap.addEventListener('touchstart', onStart, opts);
    wrap.addEventListener('touchmove', onMove, opts);
    wrap.addEventListener('touchend', onEnd, opts);
    wrap.addEventListener('touchcancel', onEnd, opts);
    return () => {
      wrap.removeEventListener('touchstart', onStart);
      wrap.removeEventListener('touchmove', onMove);
      wrap.removeEventListener('touchend', onEnd);
      wrap.removeEventListener('touchcancel', onEnd);
    };
  }, [phase, paused, performAction]);

  const mult = comboMultiplier(comboCount);
  const isBest = finalScore >= bestScore && finalScore > 0;

  return (
    <div className="sp-runner" ref={wrapRef}>
      <canvas ref={canvasRef} className="sp-runner-canvas" />

      <div className="sp-runner-hud">
        <div className="sp-runner-hud-left">
          <div className="sp-runner-score">
            <span className="sp-runner-label">SCORE</span>
            <span className="sp-runner-value">{score}</span>
          </div>
          {comboCount >= 2 && (
            <div className="sp-runner-combo" style={{ borderColor: mult >= 3 ? MUSICA_PINK : MUSICA_YELLOW }}>
              <span className="sp-runner-combo-mult">×{mult}</span>
              <span className="sp-runner-combo-count">{comboCount}</span>
            </div>
          )}
        </div>
        <div className="sp-runner-hud-right">
          {magnetTime > 0 && (
            <div className="sp-runner-pu sp-runner-magnet">
              <Magnet size={12} />
              <div className="sp-runner-pu-bar">
                <div className="sp-runner-pu-fill" style={{ width: `${(magnetTime / 5) * 100}%`, background: MUSICA_PINK }} />
              </div>
            </div>
          )}
          {score2xTime > 0 && (
            <div className="sp-runner-pu sp-runner-2x">
              <Zap size={12} />
              <div className="sp-runner-pu-bar">
                <div className="sp-runner-pu-fill" style={{ width: `${(score2xTime / 8) * 100}%`, background: MUSICA_YELLOW }} />
              </div>
            </div>
          )}
          {boardTime > 0 && (
            <div className="sp-runner-board">
              <Disc3 size={12} />
              <span>{boardTime.toFixed(1)}s</span>
            </div>
          )}
          <div className="sp-runner-coins">
            <Music2 size={12} />
            <span>{coins}</span>
          </div>
        </div>
      </div>

      {paused && (
        <div className="sp-runner-overlay">
          <div className="sp-runner-card">
            <Pause size={40} color={MUSICA_GREEN} style={{ marginBottom: 8 }} />
            <h2>PAUSE</h2>
            <p className="sp-runner-desc">Drücke P oder ESC zum Fortsetzen</p>
            <button className="sp-runner-btn" onClick={togglePause}>
              <Play size={18} /> WEITER
            </button>
            <button className="sp-runner-btn-ghost" onClick={() => navigate('/musica/settings')}>
              <X size={16} /> Beenden
            </button>
          </div>
        </div>
      )}

      {phase === 'start' && (
        <div className="sp-runner-overlay">
          <div className="sp-runner-card">
            <div className="sp-runner-title">
              <Disc3 size={36} className="sp-runner-title-icon" />
              <h2>SUBWAY RUNNER</h2>
              <p className="sp-runner-sub">Musica Edition v2</p>
            </div>
            <p className="sp-runner-desc">
              Weiche Hindernissen aus, sammle Noten und nutze Power-ups:<br/>
              <span style={{ color: MUSICA_PINK }}>🧲 Magnet</span> ·
              <span style={{ color: MUSICA_YELLOW }}> ⚡ 2× Score</span> ·
              <span style={{ color: MUSICA_GREEN }}> 🛹 Hoverboard</span>
            </p>
            <button className="sp-runner-btn" onClick={startGame}>
              <Play size={18} /> RUNDE STARTEN
            </button>
            <div className="sp-runner-keys">
              <div className="sp-runner-key-row">
                <div className="sp-runner-key" />
                <div className="sp-runner-key">↑</div>
                <div className="sp-runner-key" />
              </div>
              <div className="sp-runner-key-row">
                <div className="sp-runner-key">←</div>
                <div className="sp-runner-key">↓</div>
                <div className="sp-runner-key">→</div>
              </div>
            </div>
            <div className="sp-runner-keyinfo">
              <span>⬆️ Springen</span>
              <span>⬇️ Rutschen</span>
              <span>⬅️ ➡️ Spur</span>
            </div>
            <div className="sp-runner-touch">
              <div className="sp-runner-touch-label">📱 Touch / Swipe</div>
              <div className="sp-runner-touch-row">
                <span>👆 Wischen</span>
              </div>
              <div className="sp-runner-touch-info">
                <span>↑ Springen</span>
                <span>↓ Rutschen</span>
                <span>← → Spur</span>
              </div>
            </div>
            <div className="sp-runner-keyinfo" style={{ marginTop: 4 }}>
              <span>P / ESC</span>
              <span>Pause</span>
            </div>
            {bestScore > 0 && <div className="sp-runner-best">Best: {bestScore}</div>}
          </div>
        </div>
      )}

      {phase === 'over' && (
        <div className="sp-runner-overlay sp-runner-overlay-over">
          <div className="sp-runner-card">
            {isBest && finalScore > 0 && (
              <div className="sp-runner-best-badge">
                <Trophy size={16} /> NEUER HIGHSCORE!
              </div>
            )}
            <h2 className="sp-runner-gameover">GAME OVER</h2>
            <div className="sp-runner-stats">
              <div>
                <div className="sp-runner-stat-label">SCORE</div>
                <div className="sp-runner-stat-val">{finalScore}</div>
              </div>
              <div>
                <div className="sp-runner-stat-label">BEST</div>
                <div className="sp-runner-stat-val">{Math.max(bestScore, finalScore)}</div>
              </div>
            </div>
            <div className="sp-runner-stats-detail">
              <div><span>🎵 Noten</span><span>{finalCoins}</span></div>
              <div><span>🔥 Max Combo</span><span>{finalMaxCombo}×</span></div>
              <div><span>📏 Distanz</span><span>{finalDistance}m</span></div>
            </div>
            {topScores.length > 0 && (
              <div className="sp-runner-leaderboard">
                <div className="sp-runner-leaderboard-title">🏆 Top 5</div>
                {topScores.map((sc, i) => (
                  <div
                    key={`${sc}-${i}`}
                    className={`sp-runner-leaderboard-row${sc === finalScore ? ' sp-runner-leaderboard-you' : ''}`}
                  >
                    <span className="sp-runner-leaderboard-rank">{i + 1}.</span>
                    <span className="sp-runner-leaderboard-score">{sc}</span>
                    {i === 0 && <Trophy size={12} color={MUSICA_YELLOW} />}
                  </div>
                ))}
              </div>
            )}
            <button className="sp-runner-btn" onClick={startGame}>
              <RotateCcw size={18} /> NOCHMAL
            </button>
            <button className="sp-runner-btn-ghost" onClick={() => navigate('/musica/settings')}>
              <X size={16} /> Zurück zu Einstellungen
            </button>
            <p className="sp-runner-hint">Tipp: Wechsle die Sprache für eine neue Runde 🎵</p>
          </div>
        </div>
      )}

      {phase === 'play' && !paused && (
        <div className="sp-runner-controls">
          <div className="sp-runner-controls-side">
            <button
              className="sp-runner-btn-ctrl"
              onTouchStart={(e) => { e.preventDefault(); performAction('left'); }}
              onClick={() => performAction('left')}
              aria-label="Spur links"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              className="sp-runner-btn-ctrl"
              onTouchStart={(e) => { e.preventDefault(); performAction('right'); }}
              onClick={() => performAction('right')}
              aria-label="Spur rechts"
            >
              <ChevronRight size={28} />
            </button>
          </div>
          <div className="sp-runner-controls-side">
            <button
              className="sp-runner-btn-ctrl sp-runner-btn-ctrl-up"
              onTouchStart={(e) => { e.preventDefault(); performAction('jump'); }}
              onClick={() => performAction('jump')}
              aria-label="Springen"
            >
              <ChevronUp size={28} />
            </button>
            <button
              className="sp-runner-btn-ctrl sp-runner-btn-ctrl-down"
              onTouchStart={(e) => { e.preventDefault(); performAction('slide'); }}
              onClick={() => performAction('slide')}
              aria-label="Duken"
            >
              <ChevronDown size={28} />
            </button>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 100, display: 'flex', gap: 8, alignItems: 'center' }}>
        <CollectClueButton clueId="games:musica" size={16} />
        <button
          className="sp-runner-close"
          onClick={() => {
            if (phase === 'play' && !paused) togglePause();
            else navigate('/musica/settings');
          }}
          aria-label="Schließen"
          style={{ position: 'static' }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
