import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { playlists as initialPlaylists, type Playlist } from '../data/songs';

export const PROFILE_AVATAR = 'https://cdn.hackclub.com/019f52cf-4135-766e-9b1f-9a35103a8644/codebrecher-6a9c130c.webp';

export interface Profile {
  name: string;
  email: string;
  plan: string;
  country: string;
}

export interface Prefs {
  language: string;
  quality: string;
  crossfade: number;
  autoplay: boolean;
  notifications: boolean;
  explicitContent: boolean;
  theme: string;
}

interface LibraryState {
  likedSongs: number[];
  playlists: Playlist[];
  profile: Profile;
  prefs: Prefs;
  isLiked: (id: number) => boolean;
  toggleLike: (id: number) => void;
  createPlaylist: (name: string) => Playlist;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, songId: number) => void;
  removeSongFromPlaylist: (playlistId: string, songId: number) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  updatePrefs: (patch: Partial<Prefs>) => void;
  resetLibrary: () => void;
}

const LibraryContext = createContext<LibraryState | null>(null);

const DEFAULT_PROFILE: Profile = {
  name: 'Daniel Seidt',
  email: 'danielseidt@wab.de',
  plan: 'Premium',
  country: 'Deutschland',
};

const DEFAULT_PREFS: Prefs = {
  language: 'Deutsch',
  quality: 'Hohe Qualität',
  crossfade: 0,
  autoplay: true,
  notifications: true,
  explicitContent: false,
  theme: 'Dunkel',
};

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [likedSongs, setLikedSongs] = useState<number[]>(() => load('musica_liked', []));
  const [playlists, setPlaylists] = useState<Playlist[]>(() => load('musica_playlists', initialPlaylists));
  const [profile, setProfile] = useState<Profile>(() => load('musica_profile', DEFAULT_PROFILE));
  const [prefs, setPrefs] = useState<Prefs>(() => load('musica_prefs', DEFAULT_PREFS));

  useEffect(() => save('musica_liked', likedSongs), [likedSongs]);
  useEffect(() => save('musica_playlists', playlists), [playlists]);
  useEffect(() => save('musica_profile', profile), [profile]);
  useEffect(() => save('musica_prefs', prefs), [prefs]);

  const toggleLike = (id: number) => {
    setLikedSongs((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));
  };

  const createPlaylist = (name: string): Playlist => {
    const id = `user-${Date.now()}`;
    const pl: Playlist = {
      id,
      name,
      description: 'Eigene Playlist',
      cover: `https://picsum.photos/seed/${id}/400/400`,
      color: ['#1DB954', '#0a8043'],
      songIds: [],
      owner: 'user',
    };
    setPlaylists((p) => [pl, ...p]);
    return pl;
  };

  const deletePlaylist = (id: string) => setPlaylists((p) => p.filter((pl) => pl.id !== id));

  const addSongToPlaylist = (playlistId: string, songId: number) => {
    setPlaylists((p) =>
      p.map((pl) =>
        pl.id === playlistId && !pl.songIds.includes(songId)
          ? { ...pl, songIds: [...pl.songIds, songId] }
          : pl
      )
    );
  };

  const removeSongFromPlaylist = (playlistId: string, songId: number) => {
    setPlaylists((p) =>
      p.map((pl) =>
        pl.id === playlistId ? { ...pl, songIds: pl.songIds.filter((id) => id !== songId) } : pl
      )
    );
  };

  const updateProfile = (patch: Partial<Profile>) => setProfile((p) => ({ ...p, ...patch }));
  const updatePrefs = (patch: Partial<Prefs>) => setPrefs((p) => ({ ...p, ...patch }));

  const resetLibrary = () => {
    setLikedSongs([]);
    setPlaylists(initialPlaylists);
    setProfile(DEFAULT_PROFILE);
    setPrefs(DEFAULT_PREFS);
  };

  return (
    <LibraryContext.Provider
      value={{
        likedSongs,
        playlists,
        profile,
        prefs,
        isLiked: (id) => likedSongs.includes(id),
        toggleLike,
        createPlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        updateProfile,
        updatePrefs,
        resetLibrary,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryState {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside LibraryProvider');
  return ctx;
}