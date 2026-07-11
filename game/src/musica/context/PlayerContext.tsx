import type { ReactNode } from 'react';
import { usePlayerStore } from './playerStore';

export type { PlayerStore as PlayerState } from './playerStore';

export function PlayerProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function usePlayer() {
  return usePlayerStore();
}
