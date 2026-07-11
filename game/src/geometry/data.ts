export const BRAND = '#8E44AD';

export type Level = {
  id: string;
  name: string;
  diff: number;
  color1: string;
  color2: string;
  length: number;
};

export const LEVELS: Level[] = [
  { id: 'stereo',   name: 'Stereo Madness',         diff: 1, color1: '#00E1FF', color2: '#0077B6', length: 70 },
  { id: 'backon',   name: 'Back on Track',          diff: 1, color1: '#FF6B6B', color2: '#C9184A', length: 80 },
  { id: 'polar',    name: 'Polargeist',             diff: 2, color1: '#7DF9FF', color2: '#3A506B', length: 90 },
  { id: 'dryout',   name: 'Dry Out',                diff: 2, color1: '#FFB400', color2: '#FF6B00', length: 90 },
  { id: 'base',     name: 'Base After Base',        diff: 2, color1: '#9D4EDD', color2: '#5A189A', length: 100 },
  { id: 'cantlet',  name: "Can't Let Go",           diff: 3, color1: '#06D6A0', color2: '#1B9AAA', length: 95 },
  { id: 'jumper',   name: 'Jumper',                 diff: 3, color1: '#EF476F', color2: '#B5179E', length: 100 },
  { id: 'timem',    name: 'Time Machine',           diff: 3, color1: '#F72585', color2: '#7209B7', length: 105 },
  { id: 'cycles',   name: 'Cycles',                 diff: 4, color1: '#4CC9F0', color2: '#4361EE', length: 110 },
  { id: 'xstep',    name: 'xStep',                  diff: 4, color1: '#FFD60A', color2: '#FF006E', length: 115 },
  { id: 'clutter',  name: 'Clutterfunk',            diff: 5, color1: '#00F5D4', color2: '#00BBF9', length: 120 },
  { id: 'theory',   name: 'Theory of Everything',   diff: 6, color1: '#F15BB5', color2: '#9B5DE5', length: 130 },
];

export function getProgress(id: string): number {
  try {
    const v = localStorage.getItem(`gd_progress_${id}`);
    return v ? Number(v) : 0;
  } catch {
    return 0;
  }
}

export function saveProgress(id: string, pct: number) {
  try {
    const prev = getProgress(id);
    if (pct > prev) localStorage.setItem(`gd_progress_${id}`, String(pct));
  } catch {
    /* noop */
  }
}

export function getBest(): number {
  try { return Number(localStorage.getItem('gd_best') || 0); } catch { return 0; }
}

export function setBest(pct: number) {
  try {
    if (pct > getBest()) localStorage.setItem('gd_best', String(pct));
  } catch {
    /* noop */
  }
}

export function getAttempts(): number {
  try { return Number(localStorage.getItem('gd_attempts') || 0); } catch { return 0; }
}

export function bumpAttempts() {
  try { localStorage.setItem('gd_attempts', String(getAttempts() + 1)); } catch {
    /* noop */
  }
}
