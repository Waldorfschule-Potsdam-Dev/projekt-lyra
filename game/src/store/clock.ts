import { create } from 'zustand';

const STORAGE_KEY = 'escape-clock-offset';

export type ClockState = {
  offsetMs: number;
  now: number;
  setDeviceTime: (device: Date) => void;
  resetToReal: () => void;
};

function loadOffset(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function saveOffset(ms: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(ms));
  } catch {
    // ignore
  }
}

export const useClock = create<ClockState>((set) => {
  const offsetMs = loadOffset();
  return {
    offsetMs,
    now: Date.now() + offsetMs,
    setDeviceTime: (device) => {
      const offset = device.getTime() - Date.now();
      saveOffset(offset);
      set({ offsetMs: offset, now: device.getTime() });
    },
    resetToReal: () => {
      saveOffset(0);
      set({ offsetMs: 0, now: Date.now() });
    },
  };
});

if (typeof window !== 'undefined') {
  window.setInterval(() => {
    useClock.setState({ now: Date.now() + useClock.getState().offsetMs });
  }, 1000);
}
