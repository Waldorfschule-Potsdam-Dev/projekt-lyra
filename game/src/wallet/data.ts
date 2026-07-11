import { useState, useEffect } from 'react';

export type Card = {
  id: string;
  name: string;
  number: string;
  holder: string;
  addedAt: number;
};

export const STORAGE_KEY = 'wallet-cards';
export const STORAGE_BANK_NUMBER = 'wallet-demo-bank-number';
export const PIN = '3785';

export function getStableBankNumber(): string {
  try {
    const stored = localStorage.getItem(STORAGE_BANK_NUMBER);
    if (stored && /^\d{4} \d{4} \d{4} \d{4}$/.test(stored)) return stored;
  } catch {
    /* ignore */
  }
  const fresh = Array.from({ length: 4 }, () =>
    String(Math.floor(Math.random() * 10000)).padStart(4, '0'),
  ).join(' ');
  try {
    localStorage.setItem(STORAGE_BANK_NUMBER, fresh);
  } catch {
    /* ignore */
  }
  return fresh;
}

export function loadCards(): Card[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Card[];
  } catch {
    return [];
  }
}

export function saveCards(cards: Card[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function formatNumber(num: string): string {
  const digits = num.replace(/\D/g, '');
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

export const CARD_PALETTES: { from: string; mid: string; to: string }[] = [
  { from: '#1a1f71', mid: '#2a52be', to: '#4a7dd1' },
  { from: '#0B8043', mid: '#16a05a', to: '#3ac878' },
  { from: '#b00020', mid: '#d63644', to: '#ef6e7a' },
  { from: '#4a148c', mid: '#7b1fa2', to: '#ba68c8' },
  { from: '#ff6f00', mid: '#ff8f00', to: '#ffb300' },
  { from: '#263238', mid: '#455a64', to: '#78909c' },
];

export function paletteFor(id: string): { from: string; mid: string; to: string } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return CARD_PALETTES[h % CARD_PALETTES.length];
}


export function formatEUR(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' €';
}

export type Balance = { giro: number; spar: number };

export const BALANCE_KEY = 'wallet-balance';
export const DEFAULT_BALANCE: Balance = { giro: 8346.23, spar: 70000.0 };

export let balanceState: Balance = (() => {
  try {
    localStorage.removeItem(BALANCE_KEY);
  } catch {
    /* ignore */
  }
  return DEFAULT_BALANCE;
})();
balanceState = DEFAULT_BALANCE;

export const balanceListeners = new Set<() => void>();

export function setBalance(next: Balance) {
  balanceState = next;
  try {
    localStorage.setItem(BALANCE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  balanceListeners.forEach((l) => l());
}

export function useBalance(): [Balance, (next: Balance) => void] {
  const [b, setB] = useState<Balance>(balanceState);
  useEffect(() => {
    const l = () => setB(balanceState);
    balanceListeners.add(l);
    return () => {
      balanceListeners.delete(l);
    };
  }, []);
  return [b, setBalance];
}

