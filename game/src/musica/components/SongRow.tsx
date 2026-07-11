import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { formatTime, type Song } from '../data/songs';

interface Props {
  song: Song;
  queue: Song[];
  index?: number;
  onRemove?: () => void;
  showAlbum?: boolean;
}

export default function SongRow({ song, queue, index, onRemove, showAlbum }: Props) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { isLiked, toggleLike, playlists, addSongToPlaylist } = useLibrary();
  const [showMenu, setShowMenu] = useState(false);

  const isCurrent = currentSong?.id === song.id;
  const liked = isLiked(song.id);

  const handlePlay = () => {
    if (isCurrent) togglePlay();
    else playSong(song, queue);
  };

  const userPlaylists = playlists.filter((p) => p.owner === 'user');

  return (
    <div className="sp-songrow" onDoubleClick={handlePlay}>
      <div className="sp-songrow-num" onClick={handlePlay}>
        {isCurrent && isPlaying ? (
          <Pause size={14} fill="#1DB954" color="#1DB954" style={{ marginLeft: 4 }} />
        ) : isCurrent ? (
          <Play size={14} fill="#1DB954" color="#1DB954" style={{ marginLeft: 4 }} />
        ) : (
          index ?? ''
        )}
      </div>
      <img src={song.cover} alt="" className="sp-songrow-cover" onClick={handlePlay} />
      <div className="sp-songrow-info" onClick={handlePlay}>
        <div className={`sp-songrow-title${isCurrent ? ' now' : ''}`}>{song.title}</div>
        <div className="sp-songrow-artist">{showAlbum ? song.album : song.artist}</div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
        style={{ background: 'none', border: 'none', padding: 4, color: liked ? '#1DB954' : '#b3b3b3', cursor: 'pointer' }}
        aria-label="Gefällt mir"
      >
        <Heart size={16} fill={liked ? '#1DB954' : 'none'} />
      </button>
      <span className="sp-songrow-time">{formatTime(song.duration)}</span>
      <button
        onClick={(e) => { e.stopPropagation(); setShowMenu(true); }}
        style={{ background: 'none', border: 'none', padding: 4, color: '#b3b3b3', cursor: 'pointer', position: 'relative' }}
        aria-label="Mehr"
      >
        <MoreHorizontal size={16} />
      </button>
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ background: 'none', border: 'none', padding: 4, color: '#b3b3b3', cursor: 'pointer', fontSize: 11 }}
          aria-label="Entfernen"
        >
          ✕
        </button>
      )}

      {showMenu && (
        <div className="sp-modal-overlay" onClick={() => setShowMenu(false)}>
          <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 4 }}>{song.title}</h3>
            <div style={{ fontSize: 11, color: '#b3b3b3', marginBottom: 12 }}>{song.artist}</div>
            {userPlaylists.length > 0 && (
              <div style={{ fontSize: 11, color: '#b3b3b3', marginBottom: 6 }}>Zu Playlist hinzufügen:</div>
            )}
            <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
              {userPlaylists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => { addSongToPlaylist(pl.id, song.id); setShowMenu(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    background: 'none', border: 'none', color: '#fff', padding: 6, cursor: 'pointer',
                    textAlign: 'left', borderRadius: 4,
                  }}
                >
                  <img src={pl.cover} alt="" style={{ width: 32, height: 32, borderRadius: 4 }} />
                  <span style={{ fontSize: 13 }}>{pl.name}</span>
                </button>
              ))}
              {userPlaylists.length === 0 && (
                <div style={{ fontSize: 12, color: '#b3b3b3', padding: 8 }}>Erstelle erst eine eigene Playlist.</div>
              )}
            </div>
            <div className="sp-modal-actions">
              <button className="sp-btn-ghost" onClick={() => setShowMenu(false)}>Schließen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}