export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover: string;
  url: string;
  genre: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string;
  color: [string, string];
  songIds: number[];
  owner?: 'user' | 'musica';
}

export interface Genre {
  id: string;
  name: string;
  color: string;
}

export interface Artist {
  id: string;
  name: string;
  cover: string;
}

export const songs: Song[] = [
  { id: 1, title: 'Sunset Drive', artist: 'Aurora Waves', album: 'Horizons', duration: 372, cover: 'https://picsum.photos/seed/song1/300/300', url: '', genre: 'Chill' },
  { id: 2, title: 'Neon Lights', artist: 'The Midnight', album: 'Endless Summer', duration: 285, cover: 'https://picsum.photos/seed/song2/300/300', url: '', genre: 'Synthwave' },
  { id: 3, title: 'Forest Echo', artist: 'Greenleaf', album: 'Nature Calls', duration: 421, cover: 'https://picsum.photos/seed/song3/300/300', url: '', genre: 'Ambient' },
  { id: 4, title: 'City Pulse', artist: 'Metro Beat', album: 'Downtown', duration: 198, cover: 'https://picsum.photos/seed/song4/300/300', url: '', genre: 'Electronic' },
  { id: 5, title: 'Ocean Breeze', artist: 'Tide Pool', album: 'Coastal', duration: 354, cover: 'https://picsum.photos/seed/song5/300/300', url: '', genre: 'Chill' },
  { id: 6, title: 'Mountain High', artist: 'Summit', album: 'Peaks', duration: 312, cover: 'https://picsum.photos/seed/song6/300/300', url: '', genre: 'Indie' },
  { id: 7, title: 'Midnight Run', artist: 'Aurora Waves', album: 'Horizons', duration: 267, cover: 'https://picsum.photos/seed/song7/300/300', url: '', genre: 'Synthwave' },
  { id: 8, title: 'Desert Storm', artist: 'Sahara', album: 'Mirage', duration: 389, cover: 'https://picsum.photos/seed/song8/300/300', url: '', genre: 'World' },
  { id: 9, title: 'Electric Dreams', artist: 'The Midnight', album: 'After Hours', duration: 244, cover: 'https://picsum.photos/seed/song9/300/300', url: '', genre: 'Synthwave' },
  { id: 10, title: 'Starlight', artist: 'Cosmos', album: 'Galaxy', duration: 408, cover: 'https://picsum.photos/seed/song10/300/300', url: '', genre: 'Ambient' },
  { id: 11, title: 'Rhythm Nation', artist: 'Metro Beat', album: 'Downtown', duration: 215, cover: 'https://picsum.photos/seed/song11/300/300', url: '', genre: 'Electronic' },
  { id: 12, title: 'Lazy Sunday', artist: 'Summit', album: 'Weekend', duration: 332, cover: 'https://picsum.photos/seed/song12/300/300', url: '', genre: 'Indie' },
  { id: 13, title: 'Whispers', artist: 'Tide Pool', album: 'Coastal', duration: 298, cover: 'https://picsum.photos/seed/song13/300/300', url: '', genre: 'Ambient' },
  { id: 14, title: 'Thunder Road', artist: 'Highway', album: 'Open Roads', duration: 367, cover: 'https://picsum.photos/seed/song14/300/300', url: '', genre: 'Rock' },
  { id: 15, title: 'Velvet Sky', artist: 'Aurora Waves', album: 'Horizons', duration: 401, cover: 'https://picsum.photos/seed/song15/300/300', url: '', genre: 'Chill' },
  { id: 16, title: 'Pulse', artist: 'Cosmos', album: 'Galaxy', duration: 233, cover: 'https://picsum.photos/seed/song16/300/300', url: '', genre: 'Electronic' },
];

export const playlists: Playlist[] = [
  { id: 'p1', name: 'Daily Mix 1', description: 'Aurora Waves, The Midnight, Metro Beat und mehr', cover: 'https://picsum.photos/seed/p1/400/400', color: ['#8e44ad', '#3498db'], songIds: [1, 2, 4, 7, 9, 11], owner: 'musica' },
  { id: 'p2', name: 'Chill Vibes', description: 'Entspannte Klänge für ruhige Stunden', cover: 'https://picsum.photos/seed/p2/400/400', color: ['#1DB954', '#0a8043'], songIds: [1, 3, 5, 10, 13, 15], owner: 'musica' },
  { id: 'p3', name: 'Synthwave Nights', description: 'Retro Beats für die Nacht', cover: 'https://picsum.photos/seed/p3/400/400', color: ['#e74c3c', '#8e44ad'], songIds: [2, 7, 9, 16, 4, 11], owner: 'musica' },
  { id: 'p4', name: 'Indie Discoveries', description: 'Frische Sounds aus der Indie-Szene', cover: 'https://picsum.photos/seed/p4/400/400', color: ['#f39c12', '#e67e22'], songIds: [6, 12, 14, 1, 8], owner: 'musica' },
  { id: 'p5', name: 'Focus Flow', description: 'Ambient Tracks zum Konzentrieren', cover: 'https://picsum.photos/seed/p5/400/400', color: ['#16a085', '#2c3e50'], songIds: [3, 10, 13, 15], owner: 'musica' },
  { id: 'p6', name: 'Top Hits', description: 'Die beliebtesten Songs', cover: 'https://picsum.photos/seed/p6/400/400', color: ['#ff6b6b', '#ee5a6f'], songIds: [1, 2, 4, 7, 11, 14, 16], owner: 'musica' },
];

export const genres: Genre[] = [
  { id: 'chill', name: 'Chill', color: 'linear-gradient(135deg,#10b981,#0d9488)' },
  { id: 'synthwave', name: 'Synthwave', color: 'linear-gradient(135deg,#d946ef,#7e22ce)' },
  { id: 'ambient', name: 'Ambient', color: 'linear-gradient(135deg,#0ea5e9,#4338ca)' },
  { id: 'electronic', name: 'Electronic', color: 'linear-gradient(135deg,#f43f5e,#be123c)' },
  { id: 'indie', name: 'Indie', color: 'linear-gradient(135deg,#f59e0b,#c2410c)' },
  { id: 'rock', name: 'Rock', color: 'linear-gradient(135deg,#dc2626,#9f1239)' },
  { id: 'world', name: 'World', color: 'linear-gradient(135deg,#eab308,#a16207)' },
  { id: 'pop', name: 'Pop', color: 'linear-gradient(135deg,#f472b6,#e11d48)' },
];

export const featuredArtists: Artist[] = [
  { id: 'a1', name: 'Aurora Waves', cover: 'https://picsum.photos/seed/artist1/400/400' },
  { id: 'a2', name: 'The Midnight', cover: 'https://picsum.photos/seed/artist2/400/400' },
  { id: 'a3', name: 'Metro Beat', cover: 'https://picsum.photos/seed/artist3/400/400' },
  { id: 'a4', name: 'Summit', cover: 'https://picsum.photos/seed/artist4/400/400' },
  { id: 'a5', name: 'Cosmos', cover: 'https://picsum.photos/seed/artist5/400/400' },
];

export const getSongById = (id: number): Song | undefined => songs.find((x) => x.id === id);
export const getPlaylistById = (id: string): Playlist | undefined => playlists.find((p) => p.id === id);
export const getPlaylistSongs = (playlist: Playlist): Song[] =>
  playlist.songIds.map(getSongById).filter((s): s is Song => Boolean(s));

export const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};