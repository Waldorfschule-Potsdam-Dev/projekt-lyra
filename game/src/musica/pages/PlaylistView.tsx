import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Shuffle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { getPlaylistById, getPlaylistSongs } from '../data/songs';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import SongRow from '../components/SongRow';

export default function PlaylistView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const playlist = id ? getPlaylistById(id) : undefined;
  const { playSong, togglePlay, currentSong, isPlaying } = usePlayer();
  const { deletePlaylist, removeSongFromPlaylist } = useLibrary();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!playlist) {
    return (
      <div className="sp-empty">
        <div style={{ fontSize: 14, marginBottom: 12 }}>Playlist nicht gefunden</div>
        <button className="sp-btn-green" onClick={() => navigate('/musica/library')}>Zur Bibliothek</button>
      </div>
    );
  }

  const songs = getPlaylistSongs(playlist);
  const totalDuration = songs.reduce((sum, s) => sum + s.duration, 0);
  const isCurrentPlaylist = currentSong ? songs.some((s) => s.id === currentSong.id) : false;
  const isUser = playlist.owner === 'user';

  // Hide songs from musica-owned playlists if none defined (placeholder)
  const showSongs = songs.length > 0;

  const handlePlay = () => {
    if (songs.length === 0) return;
    if (isCurrentPlaylist) togglePlay();
    else playSong(songs[0], songs);
  };

  const handleShuffle = () => {
    if (songs.length === 0) return;
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    playSong(shuffled[0], shuffled);
  };

  return (
    <div>
      <div
        className="sp-hero"
        style={{
          background: `linear-gradient(180deg, ${playlist.color[0]}80, ${playlist.color[1]}30, transparent)`,
        }}
      >
        <img src={playlist.cover} alt="" className="sp-hero-img" />
        <div className="sp-hero-info">
          <div className="sp-hero-label">Playlist</div>
          <div className="sp-hero-title">{playlist.name}</div>
          <div className="sp-hero-sub">
            {isUser ? 'Du' : 'Musica'} • {songs.length} Titel, {Math.floor(totalDuration / 60)} Min.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, padding: '0 12px 12px', alignItems: 'center' }}>
        <button
          className="sp-btn-bigplay"
          onClick={handlePlay}
          disabled={!showSongs}
          style={{ opacity: showSongs ? 1 : 0.5 }}
        >
          {isCurrentPlaylist && isPlaying ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" style={{ marginLeft: 2 }} />}
        </button>
        <button
          onClick={handleShuffle}
          disabled={!showSongs}
          style={{ background: 'none', border: 'none', color: '#1DB954', cursor: showSongs ? 'pointer' : 'default', opacity: showSongs ? 1 : 0.5, padding: 4 }}
          aria-label="Zufällig"
        >
          <Shuffle size={26} />
        </button>
        {isUser && (
          <button
            onClick={() => {
              if (confirmDelete) {
                deletePlaylist(playlist.id);
                navigate('/musica/library');
              } else {
                setConfirmDelete(true);
                setTimeout(() => setConfirmDelete(false), 3000);
              }
            }}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: confirmDelete ? '#ef4444' : '#b3b3b3',
              cursor: 'pointer',
              padding: 4,
            }}
            title={confirmDelete ? 'Tippen zum Bestätigen' : 'Löschen'}
          >
            <Trash2 size={22} />
          </button>
        )}
      </div>

      {showSongs ? (
        <div style={{ paddingBottom: 16 }}>
          {songs.map((s, i) => (
            <SongRow
              key={s.id}
              song={s}
              queue={songs}
              index={i + 1}
              onRemove={isUser ? () => removeSongFromPlaylist(playlist.id, s.id) : undefined}
              showAlbum
            />
          ))}
        </div>
      ) : (
        <div className="sp-empty">
          <div style={{ marginBottom: 12 }}>Diese Playlist ist leer.</div>
          <button className="sp-btn-green" onClick={() => navigate('/musica/search')}>Songs suchen</button>
        </div>
      )}
    </div>
  );
}