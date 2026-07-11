import { useSyncExternalStore } from 'react';

export type Profile = {
  name: string;
  email: string;
  phone: string;
  color: string;
};

/**
 * ADMIN-DEFAULT-PROFIL
 *
 * Quelle der Wahrheit für Projekt Lyra. Wer was ändert, ändert
 * es hier und committet — alle Spieler sehen es nach Reload +
 * "Auf Standard zurücksetzen".
 *
 * `MAILBOXES` listet die Postfächer, die der User in der App
 * benutzen kann (z.B. privater + beruflicher Account).
 */
export const ADMIN_PROFILE: Profile = {
  name: 'Daniel Seidt',
  email: 'danielseidt@wab.de',
  phone: '',
  color: '#1A73E8',
};

export type Mailbox = {
  id: string;
  label: string;
  email: string;
  color: string;
};

export const MAILBOXES: Mailbox[] = [
  { id: 'private', label: 'Privat',  email: 'danielseidt@wab.de', color: '#1A73E8' },
  { id: 'work',    label: 'Beruf',  email: 'daniel.s@pes.de',     color: '#34A853' },
];

const STORAGE_KEY = 'ymail.profile.v1';
const STAMP_KEY = 'ymail.profile.stamp';
const MAILBOX_KEY = 'ymail.mailbox.v1';
const COLORS = ['#1A73E8', '#4285F4', '#34A853', '#FBBC05', '#8E44AD', '#F29900', '#00B8D9', '#E91E63'];
const DEFAULT: Profile = ADMIN_PROFILE;
const DEFAULT_MAILBOX = 'private';

const load = (): Profile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT, ...parsed };
    }
  } catch {}
  return DEFAULT;
};

let profile: Profile = typeof window === 'undefined' ? DEFAULT : load();
let stamp = typeof window === 'undefined' ? '0' : (localStorage.getItem(STAMP_KEY) ?? '0');
let mailboxId: string = typeof window === 'undefined' ? DEFAULT_MAILBOX : (localStorage.getItem(MAILBOX_KEY) ?? DEFAULT_MAILBOX);
const listeners = new Set<() => void>();

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    localStorage.setItem(STAMP_KEY, stamp);
    localStorage.setItem(MAILBOX_KEY, mailboxId);
  } catch {}
};

const emit = () => listeners.forEach(l => l());
const subscribe = (cb: () => void) => { listeners.add(cb); return () => listeners.delete(cb); };
const getSnapshot = () => profile;
const getMailboxSnapshot = () => mailboxId;

const reloadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const newStamp = localStorage.getItem(STAMP_KEY) ?? '0';
    const newMailbox = localStorage.getItem(MAILBOX_KEY) ?? DEFAULT_MAILBOX;
    if (newStamp === stamp && newMailbox === mailboxId) return;
    stamp = newStamp;
    mailboxId = newMailbox;
    if (raw) {
      profile = { ...DEFAULT, ...JSON.parse(raw) };
    } else {
      profile = DEFAULT;
    }
    emit();
  } catch {}
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === STAMP_KEY || e.key === MAILBOX_KEY) {
      reloadFromStorage();
    }
  });
}

export const useProfile = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
export const useMailbox = () => useSyncExternalStore(subscribe, getMailboxSnapshot, getMailboxSnapshot);

export const getActiveMailbox = (): Mailbox => MAILBOXES.find(m => m.id === mailboxId) ?? MAILBOXES[0];

export const updateProfile = (patch: Partial<Profile>) => {
  profile = { ...profile, ...patch };
  stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  persist();
  emit();
};

export const setMailbox = (id: string) => {
  if (!MAILBOXES.find(m => m.id === id)) return;
  mailboxId = id;
  stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  persist();
  emit();
};

export const resetProfile = () => {
  profile = { ...DEFAULT };
  mailboxId = DEFAULT_MAILBOX;
  stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  persist();
  emit();
};

export const isLocalOverride = (): boolean => {
  try {
    return localStorage.getItem(STAMP_KEY) !== null;
  } catch {
    return false;
  }
};

export const pickRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
