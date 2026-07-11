import { useSyncExternalStore } from 'react';
import type { Status } from './types';

const ME_ID = 'me';
const ME_NAME = 'Ich';
const ME_COLOR = '#008069';

const SEED_CONTACT_STATUSES: Status[] = [
  {
    id: 'seed-helena-1',
    authorId: 'helena',
    authorName: 'Helena',
    authorColor: '#EC4899',
    imageUrl: 'https://cdn.hackclub.com/019f52cf-60b1-7c5c-9f32-59dcb51e8a09/codebrecher-cc0a2394.webp',
    caption: 'Kaffeepause. Endlich.',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    seen: false,
  },
  {
    id: 'seed-mutter-1',
    authorId: 'mutter',
    authorName: 'Mama',
    authorColor: '#16A34A',
    imageUrl: 'https://cdn.hackclub.com/019f52cf-5bae-7b6e-8487-1f42827c3131/codebrecher-322aa205.webp',
    caption: 'Im Garten. Endlich Frühling.',
    timestamp: Date.now() - 7 * 60 * 60 * 1000,
    seen: true,
  },
  {
    id: 'seed-sarah-1',
    authorId: 'schwester-sarah',
    authorName: 'Sarah',
    authorColor: '#78716C',
    imageUrl: 'https://cdn.hackclub.com/019f52cf-5f3a-7adf-ad1f-99b4d737b1f9/codebrecher-917e2c5e.webp',
    caption: 'Kaserne. Wieder.',
    timestamp: Date.now() - 22 * 60 * 60 * 1000,
    seen: true,
  },
];

const HIDDEN_PASSWORD = 'Morgenröte Alpha';

let statuses: Status[] = [];
let mutedChats = new Set<string>();
let readChats = new Set<string>();
let unlockedHiddenChats = new Set<string>();
const listeners = new Set<() => void>();

const UNLOCKED_KEY = 'wa:unlockedHiddenChats';

const loadFromStorage = () => {
  if (typeof window === 'undefined') return;
  try {
    const unlockedRaw = window.localStorage.getItem(UNLOCKED_KEY);
    if (unlockedRaw) {
      const arr = JSON.parse(unlockedRaw);
      if (Array.isArray(arr)) unlockedHiddenChats = new Set(arr.filter((x) => typeof x === 'string'));
    }
  } catch {
    // ignore
  }
};
const persistUnlocked = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(UNLOCKED_KEY, JSON.stringify(Array.from(unlockedHiddenChats)));
  } catch {
    // ignore
  }
};

loadFromStorage();

const emit = () => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const getStatusesSnapshot = () => statuses;
const getMutedSnapshot = () => mutedChats;
const getReadSnapshot = () => readChats;
const getUnlockedHiddenSnapshot = () => unlockedHiddenChats;

const seedIfEmpty = () => {
  if (statuses.length === 0) {
    statuses = [...SEED_CONTACT_STATUSES];
  }
};
if (typeof window !== 'undefined') seedIfEmpty();

export const useStatuses = () =>
  useSyncExternalStore(subscribe, getStatusesSnapshot, getStatusesSnapshot);

export const useMutedChats = () =>
  useSyncExternalStore(subscribe, getMutedSnapshot, getMutedSnapshot);

export const useReadChats = () =>
  useSyncExternalStore(subscribe, getReadSnapshot, getReadSnapshot);

export const isChatMuted = (chatId: string): boolean => mutedChats.has(chatId);

export const isChatRead = (chatId: string): boolean => readChats.has(chatId);

export const markChatRead = (chatId: string) => {
  const next = new Set(readChats);
  next.add(chatId);
  readChats = next;
  emit();
};

export const postStatus = (imageUrl: string, caption?: string) => {
  const status: Status = {
    id: `me-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    authorId: ME_ID,
    authorName: ME_NAME,
    authorColor: ME_COLOR,
    imageUrl,
    caption: caption?.trim() || undefined,
    timestamp: Date.now(),
    seen: true,
  };
  statuses = [status, ...statuses];
  emit();
};

export const markStatusSeen = (statusId: string) => {
  const next = statuses.map((s) => (s.id === statusId ? { ...s, seen: true } : s));
  if (next.some((s, i) => s !== statuses[i])) {
    statuses = next;
    emit();
  }
};

export const deleteStatus = (statusId: string) => {
  statuses = statuses.filter((s) => s.id !== statusId);
  emit();
};

export const toggleMute = (chatId: string) => {
  const next = new Set(mutedChats);
  if (next.has(chatId)) next.delete(chatId);
  else next.add(chatId);
  mutedChats = next;
  emit();
};

export const useHiddenChatPassword = () => HIDDEN_PASSWORD;

export const useUnlockedHiddenChats = () =>
  useSyncExternalStore(subscribe, getUnlockedHiddenSnapshot, getUnlockedHiddenSnapshot);

export const checkHiddenChatPassword = (pwd: string): boolean => pwd === HIDDEN_PASSWORD;

export const unlockHiddenChat = (chatId: string) => {
  if (!unlockedHiddenChats.has(chatId)) {
    const next = new Set(unlockedHiddenChats);
    next.add(chatId);
    unlockedHiddenChats = next;
    persistUnlocked();
    emit();
  }
};

export const lockHiddenChat = (chatId: string) => {
  if (unlockedHiddenChats.has(chatId)) {
    const next = new Set(unlockedHiddenChats);
    next.delete(chatId);
    unlockedHiddenChats = next;
    persistUnlocked();
    emit();
  }
};

export const isHiddenChatUnlocked = (chatId: string): boolean => unlockedHiddenChats.has(chatId);

export { ME_ID, ME_NAME, ME_COLOR };
