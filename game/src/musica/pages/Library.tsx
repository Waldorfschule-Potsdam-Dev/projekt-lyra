import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';

export default function Library() {
  const { playlists, likedSongs } = useLibrary();
  const [filter, setFilter] = useState<'alle' | 'eigene' | 'musica'>('alle');
  const navigate = useNavigate();

  const filtered = playlists.filter((p) => {
    if (filter === 'eigene') return p.owner === 'user';
    if (filter === 'musica') return p.owner !== 'user';
    return true;
  });

  return (
    <div>
      <div className="sp-section-title"><span>Bibliothek</span></div>
      <div className="sp-filters">
        {[
          { id: 'alle', label: 'Alle' },
          { id: 'eigene', label: 'Eigene' },
          { id: 'musica', label: 'Für dich' },
        ].map((t) => (
          <button
            key={t.id}
            className={`sp-tab${filter === t.id ? ' active' : ''}`}
            onClick={() => setFilter(t.id as 'alle' | 'eigene' | 'musica')}
          >
            {t.label}
          </button>
        ))}
      </div>

      <button className="sp-liked-card" onClick={() => navigate('/musica/liked')}>
        <div className="sp-liked-icon">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Gefällt mir</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>Playlist • {likedSongs.length} Titel</div>
        </div>
      </button>

      <div style={{ paddingBottom: 16 }}>
        {filtered.length === 0 ? (
          <div className="sp-empty">Keine Playlists in dieser Ansicht.</div>
        ) : (
          filtered.map((pl) => (
            <div
              key={pl.id}
              className="sp-row"
              onClick={() => navigate(`/musica/playlist/${pl.id}`)}
            >
              <img src={pl.cover} alt="" className="sp-row-cover" />
              <div className="sp-row-info">
                <div className="sp-row-title">{pl.name}</div>
                <div className="sp-row-sub">
                  Playlist • {pl.owner === 'user' ? 'Du' : 'Musica'} • {pl.songIds.length} Titel
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}