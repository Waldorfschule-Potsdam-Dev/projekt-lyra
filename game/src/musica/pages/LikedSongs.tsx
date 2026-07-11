import { Play, Pause, Heart } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { getSongById } from '../data/songs';
import SongRow from '../components/SongRow';
import { usePlayer } from '../context/PlayerContext';

export default function LikedSongs() {
  const { likedSongs } = useLibrary();
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();

  const songs = likedSongs.map(getSongById).filter((s): s is NonNullable<typeof s> => Boolean(s));
  const totalDuration = songs.reduce((sum, s) => sum + s.duration, 0);
  const isCurrent = currentSong ? songs.some((s) => s.id === currentSong.id) : false;

  const handlePlay = () => {
    if (songs.length === 0) return;
    if (isCurrent) togglePlay();
    else playSong(songs[0], songs);
  };

  return (
    <div>
      <div
        className="sp-hero"
        style={{ background: 'linear-gradient(180deg, rgba(79,70,229,0.6), rgba(124,58,237,0.2), transparent)' }}
      >
        <div
          className="sp-hero-img"
          style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Heart size={56} fill="#fff" color="#fff" />
        </div>
        <div className="sp-hero-info">
          <div className="sp-hero-label">Playlist</div>
          <div className="sp-hero-title">Gefällt mir</div>
          <div className="sp-hero-sub">
            Du • {songs.length} Titel, {Math.floor(totalDuration / 60)} Min.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, padding: '0 12px 12px', alignItems: 'center' }}>
        <button
          className="sp-btn-bigplay"
          onClick={handlePlay}
          disabled={songs.length === 0}
          style={{ opacity: songs.length === 0 ? 0.5 : 1 }}
        >
          {isCurrent && isPlaying ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" style={{ marginLeft: 2 }} />}
        </button>
      </div>

      {songs.length === 0 ? (
        <div className="sp-empty">
          <Heart size={40} style={{ opacity: 0.5, marginBottom: 12 }} />
          <div>Du hast noch keine Songs gemerkt.</div>
          <div style={{ fontSize: 11, marginTop: 6, opacity: 0.7 }}>
            Tippe auf das Herz bei einem Song, um ihn hier hinzuzufügen.
          </div>
        </div>
      ) : (
        <div>
          {songs.map((s, i) => (
            <SongRow key={s.id} song={s} queue={songs} index={i + 1} />
          ))}
          <div style={{ height: 16 }} />
        </div>
      )}
    </div>
  );
}