import { create } from 'zustand';
import type { Song } from '../data/songs';

type Repeat = 'off' | 'all' | 'one';

export interface PlayerStore {
  currentSong: Song | null;
  queue: Song[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: Repeat;

  playSong: (song: Song, queue?: Song[] | null) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

const audio = (() => {
  if (typeof document === 'undefined') return null;
  const el = new Audio();
  el.preload = 'metadata';
  document.body.appendChild(el);
  return el;
})();

function updateMediaSession(song: Song | null, isPlaying: boolean) {
  if (!('mediaSession' in navigator)) return;
  if (!song) {
    navigator.mediaSession.metadata = null;
    return;
  }
  navigator.mediaSession.metadata = new MediaMetadata({
    title: song.title,
    artist: song.artist,
    album: song.album,
    artwork: song.cover ? [{ src: song.cover }] : [],
  });
  navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
}

function playSrc(url: string) {
  if (!audio) return;
  audio.src = url;
  audio.load();
  audio.play().catch(() => {});
}

export const usePlayerStore = create<PlayerStore>((set, get) => {
  if (audio) {
    audio.addEventListener('timeupdate', () => set({ currentTime: audio.currentTime }));
    audio.addEventListener('loadedmetadata', () => set({ duration: audio.duration || 0 }));
    audio.addEventListener('play', () => {
      set({ isPlaying: true });
      updateMediaSession(get().currentSong, true);
    });
    audio.addEventListener('pause', () => {
      set({ isPlaying: false });
      updateMediaSession(get().currentSong, false);
    });
    audio.addEventListener('ended', () => {
      if (get().repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        get().next();
      }
    });
  }

  return {
    currentSong: null,
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    shuffle: false,
    repeat: 'off',

    playSong: (song, queueList = null) => {
      const state = get();
      if (queueList && queueList.length > 0) {
        const idx = queueList.findIndex((s) => s.id === song.id);
        set({ queue: queueList, currentIndex: idx >= 0 ? idx : 0, currentSong: song });
      } else {
        const idx = state.queue.findIndex((s) => s.id === song.id);
        if (idx >= 0) {
          set({ currentIndex: idx, currentSong: song });
        } else {
          const next = [...state.queue, song];
          set({ queue: next, currentIndex: next.length - 1, currentSong: song });
        }
      }
      set({ currentTime: 0, duration: 0 });
      updateMediaSession(song, true);
      playSrc(song.url);
    },

    togglePlay: () => {
      if (!audio || !get().currentSong) return;
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    },

    next: () => {
      const state = get();
      if (state.queue.length === 0 || !audio) return;
      if (state.repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      let nextIdx: number;
      if (state.shuffle) {
        nextIdx = state.currentIndex;
        if (state.queue.length > 1) {
          while (nextIdx === state.currentIndex) {
            nextIdx = Math.floor(Math.random() * state.queue.length);
          }
        }
      } else {
        nextIdx = (state.currentIndex + 1) % state.queue.length;
      }
      const nextSong = state.queue[nextIdx];
      set({ currentIndex: nextIdx, currentSong: nextSong, currentTime: 0 });
      updateMediaSession(nextSong, true);
      playSrc(nextSong.url);
    },

    prev: () => {
      const state = get();
      if (state.queue.length === 0 || !audio) return;
      if (state.currentTime > 3) {
        audio.currentTime = 0;
        return;
      }
      const prevIdx = (state.currentIndex - 1 + state.queue.length) % state.queue.length;
      const prevSong = state.queue[prevIdx];
      set({ currentIndex: prevIdx, currentSong: prevSong, currentTime: 0 });
      updateMediaSession(prevSong, true);
      playSrc(prevSong.url);
    },

    seek: (time) => {
      if (!audio) return;
      audio.currentTime = time;
      set({ currentTime: time });
    },

    setVolume: (v) => {
      set({ volume: v });
      if (audio) audio.volume = v;
    },

    toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
    cycleRepeat: () =>
      set((s) => ({ repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off' })),
  };
});

if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', () => usePlayerStore.getState().togglePlay());
  navigator.mediaSession.setActionHandler('pause', () => usePlayerStore.getState().togglePlay());
  navigator.mediaSession.setActionHandler('nexttrack', () => usePlayerStore.getState().next());
  navigator.mediaSession.setActionHandler('previoustrack', () => usePlayerStore.getState().prev());
}
