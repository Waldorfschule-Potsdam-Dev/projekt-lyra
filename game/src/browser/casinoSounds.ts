let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (muted) return null;
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

export function setMuted(m: boolean) {
  muted = m;
  if (m && ctx) {
    ctx.close().catch(() => undefined);
    ctx = null;
  }
}

export function isMuted(): boolean {
  return muted;
}

export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === 'suspended') {
    void c.resume();
  }
}

function envelope(gain: GainNode, t0: number, attack: number, decay: number, peak: number, sustain: number) {
  gain.gain.cancelScheduledValues(t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + attack);
  gain.gain.linearRampToValueAtTime(sustain, t0 + attack + decay);
}

function tone(freq: number, durationMs: number, options: { type?: OscillatorType; peak?: number; attack?: number; decay?: number; detune?: number; delayMs?: number } = {}) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + (options.delayMs ?? 0) / 1000;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = options.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (options.detune) osc.detune.setValueAtTime(options.detune, t0);
  const peak = options.peak ?? 0.2;
  const attack = options.attack ?? 0.005;
  const decay = options.decay ?? 0.05;
  envelope(gain, t0, attack, decay, peak, 0.0001);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + durationMs / 1000 + 0.05);
}

function noise(durationMs: number, options: { peak?: number; bandpass?: number; highpass?: number; lowpass?: number; attack?: number; delayMs?: number } = {}) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + (options.delayMs ?? 0) / 1000;
  const sampleRate = c.sampleRate;
  const bufferLen = Math.ceil((durationMs / 1000) * sampleRate);
  const buffer = c.createBuffer(1, bufferLen, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferLen; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const gain = c.createGain();
  const peak = options.peak ?? 0.15;
  const attack = options.attack ?? 0.002;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);
  let last: AudioNode = src;
  if (options.bandpass) {
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = options.bandpass;
    f.Q.value = 6;
    last.connect(f);
    last = f;
  }
  if (options.highpass) {
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = options.highpass;
    last.connect(f);
    last = f;
  }
  if (options.lowpass) {
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = options.lowpass;
    last.connect(f);
    last = f;
  }
  last.connect(gain);
  gain.connect(c.destination);
  src.start(t0);
  src.stop(t0 + durationMs / 1000 + 0.05);
}

export const casinoSound = {
  click() {
    tone(900, 60, { type: 'square', peak: 0.08, attack: 0.001, decay: 0.01 });
  },
  bet() {
    tone(1200, 80, { type: 'sine', peak: 0.1, attack: 0.002, decay: 0.02 });
    noise(40, { peak: 0.05, highpass: 2000 });
  },
  tick() {
    tone(2000, 30, { type: 'square', peak: 0.06, attack: 0.001, decay: 0.005 });
  },
  coinFlip() {
    const c = getCtx();
    if (!c) return;
    const t0 = c.currentTime;
    for (let i = 0; i < 6; i++) {
      noise(120, { peak: 0.12, bandpass: 1800 + i * 200, delayMs: i * 220 });
    }
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, t0);
    osc.frequency.exponentialRampToValueAtTime(1500, t0 + 1.6);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.1, t0 + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.8);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + 1.9);
  },
  coinLandHeads() {
    const c = getCtx();
    if (!c) return;
    tone(800, 80, { type: 'sine', peak: 0.15 });
    tone(1200, 80, { type: 'sine', peak: 0.15, delayMs: 60 });
    tone(1600, 120, { type: 'sine', peak: 0.15, delayMs: 120 });
  },
  coinLandTails() {
    tone(400, 150, { type: 'sine', peak: 0.15 });
    tone(300, 200, { type: 'sine', peak: 0.12, delayMs: 80 });
  },
  coinWin() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((n, i) => tone(n, 180, { type: 'triangle', peak: 0.18, delayMs: i * 80 }));
  },
  coinLose() {
    tone(220, 250, { type: 'sawtooth', peak: 0.12 });
    tone(165, 350, { type: 'sawtooth', peak: 0.1, delayMs: 100 });
  },
  reelSpin() {
    for (let i = 0; i < 8; i++) {
      noise(40, { peak: 0.1, bandpass: 1200, delayMs: i * 80 });
    }
  },
  reelStop() {
    noise(80, { peak: 0.18, bandpass: 3000, attack: 0.001 });
    tone(200, 50, { type: 'sine', peak: 0.1, attack: 0.001 });
  },
  slotWin() {
    const notes = [523, 659, 784, 1046, 1318];
    notes.forEach((n, i) => tone(n, 220, { type: 'triangle', peak: 0.2, delayMs: i * 70 }));
    tone(2093, 400, { type: 'sine', peak: 0.15, delayMs: 5 * 70 });
  },
  slotLose() {
    tone(330, 100, { type: 'square', peak: 0.1 });
    tone(247, 200, { type: 'square', peak: 0.08, delayMs: 60 });
  },
  cardDeal() {
    noise(120, { peak: 0.14, highpass: 1500, lowpass: 6000, attack: 0.005 });
  },
  cardFlip() {
    const c = getCtx();
    if (!c) return;
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t0);
    osc.frequency.exponentialRampToValueAtTime(900, t0 + 0.2);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.12, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + 0.35);
  },
  hiloCorrect() {
    tone(660, 100, { type: 'triangle', peak: 0.18 });
    tone(880, 150, { type: 'triangle', peak: 0.18, delayMs: 60 });
  },
  hiloLose() {
    tone(180, 250, { type: 'sawtooth', peak: 0.15 });
    tone(140, 350, { type: 'sawtooth', peak: 0.12, delayMs: 80 });
  },
  hiloCashout() {
    const notes = [523, 784, 1046, 1318, 1568];
    notes.forEach((n, i) => tone(n, 200, { type: 'triangle', peak: 0.2, delayMs: i * 60 }));
  },
  rouletteSpin() {
    const c = getCtx();
    if (!c) return;
    const t0 = c.currentTime;
    const bufferSize = Math.ceil(c.sampleRate * 3.6);
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / c.sampleRate;
      const env = Math.max(0, 1 - t / 3.5);
      const tick = Math.sin(t * 220) > 0.85 ? 0.3 : 0;
      data[i] = (Math.random() * 2 - 1) * 0.15 * env + tick * env;
    }
    const src = c.createBufferSource();
    src.buffer = buffer;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.18, t0);
    gain.gain.linearRampToValueAtTime(0.05, t0 + 3.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 3.6);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 800;
    src.connect(lp);
    lp.connect(gain);
    gain.connect(c.destination);
    src.start(t0);
    src.stop(t0 + 3.7);
  },
  rouletteBallTick() {
    tone(2400, 25, { type: 'square', peak: 0.08, attack: 0.001, decay: 0.005 });
  },
  rouletteWin() {
    const notes = [523, 659, 784, 1046, 1318, 1568];
    notes.forEach((n, i) => tone(n, 250, { type: 'triangle', peak: 0.22, delayMs: i * 60 }));
    tone(2093, 600, { type: 'sine', peak: 0.18, delayMs: 6 * 60 });
  },
  rouletteLose() {
    tone(220, 300, { type: 'sawtooth', peak: 0.14 });
    tone(165, 400, { type: 'sawtooth', peak: 0.1, delayMs: 100 });
  },
  bigWin() {
    const arpeggio = [523, 659, 784, 1046, 1318, 1568, 2093];
    arpeggio.forEach((n, i) => tone(n, 300, { type: 'triangle', peak: 0.22, delayMs: i * 50 }));
    arpeggio.slice().reverse().forEach((n, i) => tone(n, 250, { type: 'sine', peak: 0.18, delayMs: 7 * 50 + i * 40 }));
  },
  jackpot() {
    for (let h = 0; h < 3; h++) {
      const base = 523 * Math.pow(2, h / 6);
      [1, 1.25, 1.5, 1.875].forEach((mult, i) => {
        tone(base * mult, 500, { type: 'triangle', peak: 0.18, delayMs: h * 200 + i * 30 });
      });
    }
  },
  error() {
    tone(150, 100, { type: 'square', peak: 0.1 });
    tone(120, 150, { type: 'square', peak: 0.1, delayMs: 80 });
  },
  chipPlace() {
    noise(50, { peak: 0.1, highpass: 3000 });
    tone(1500, 40, { type: 'sine', peak: 0.08, attack: 0.001 });
  },
  navigate() {
    tone(440, 60, { type: 'sine', peak: 0.08, attack: 0.005 });
  },
  crashTick() {
    tone(880, 25, { type: 'square', peak: 0.1, attack: 0.001, decay: 0.005 });
  },
  crashCashout() {
    const notes = [659, 988, 1318];
    notes.forEach((n, i) => tone(n, 180, { type: 'triangle', peak: 0.22, delayMs: i * 50 }));
  },
  crashBoom() {
    const c = getCtx();
    if (!c) return;
    const t0 = c.currentTime;
    noise(600, { peak: 0.32, lowpass: 800, delayMs: 0 });
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t0);
    osc.frequency.exponentialRampToValueAtTime(40, t0 + 0.5);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.22, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.5);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + 0.55);
  },
  diceRoll() {
    const c = getCtx();
    if (!c) return;
    const t0 = c.currentTime;
    for (let i = 0; i < 8; i++) {
      noise(60, { peak: 0.18, bandpass: 1400 + (i % 3) * 600, delayMs: i * 80 });
    }
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t0);
    osc.frequency.exponentialRampToValueAtTime(200, t0 + 0.5);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.12, t0 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.6);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + 0.65);
  },
  diceWin() {
    const notes = [523, 659, 784, 1046, 1318];
    notes.forEach((n, i) => tone(n, 200, { type: 'triangle', peak: 0.22, delayMs: i * 50 }));
  },
  diceLose() {
    tone(220, 200, { type: 'sawtooth', peak: 0.14 });
    tone(165, 300, { type: 'sawtooth', peak: 0.1, delayMs: 100 });
  },
  streak() {
    const notes = [523, 784, 1046, 1318];
    notes.forEach((n, i) => tone(n, 140, { type: 'triangle', peak: 0.18, delayMs: i * 50 }));
  },
  nearMiss() {
    tone(1320, 60, { type: 'sine', peak: 0.16 });
    tone(1660, 100, { type: 'sine', peak: 0.14, delayMs: 50 });
    tone(880, 180, { type: 'sine', peak: 0.18, delayMs: 120 });
  },
  allIn() {
    const notes = [392, 523, 659, 784, 1046];
    notes.forEach((n, i) => tone(n, 160, { type: 'triangle', peak: 0.22, delayMs: i * 60 }));
  },
};
