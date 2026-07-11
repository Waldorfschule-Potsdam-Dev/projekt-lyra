import { useState, useMemo } from 'react';
import { Search as SearchIcon, X, Music } from 'lucide-react';
import { songs, genres, playlists } from '../data/songs';
import { usePlayer } from '../context/PlayerContext';
import { PlaylistCard } from '../components/Cards';

export default function Search() {
  const [query, setQuery] = useState('');
  const { playSong } = usePlayer();

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    const matchedSongs = songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q)
    );
    const matchedArtists = Array.from(new Set(songs.map((s) => s.artist))).filter((a) =>
      a.toLowerCase().includes(q)
    );
    const matchedPlaylists = playlists.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
    return { matchedSongs, matchedArtists, matchedPlaylists };
  }, [query]);

  return (
    <div>
      <div className="sp-searchbar">
        <SearchIcon size={16} className="sp-searchbar-icon" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Was willst du hören?"
        />
        {query && (
          <button className="sp-searchbar-clear" onClick={() => setQuery('')}>
            <X size={16} />
          </button>
        )}
      </div>

      {!results ? (
        <>
          <div className="sp-section-title"><span>Stöbere nach Genre</span></div>
          <div className="sp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {genres.map((g) => (
              <button
                key={g.id}
                className="sp-genre-tile"
                style={{ background: g.color }}
                onClick={() => setQuery(g.name)}
              >
                <h3>{g.name}</h3>
              </button>
            ))}
          </div>
          <div style={{ height: 24 }} />
        </>
      ) : (
        <>
          {results.matchedSongs.length > 0 && (
            <>
              <div className="sp-section-title"><span>Top-Treffer</span></div>
              <button
                className="sp-card"
                style={{ margin: '0 12px 12px', width: 'calc(100% - 24px)' }}
                onClick={() => playSong(results.matchedSongs[0], results.matchedSongs)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={results.matchedSongs[0].cover} alt="" className="sp-card-img" style={{ width: 80, height: 80, marginBottom: 0, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{results.matchedSongs[0].title}</div>
                    <div style={{ fontSize: 12, color: '#b3b3b3' }}>
                      {results.matchedSongs[0].artist} • Song
                    </div>
                  </div>
                </div>
              </button>

              <div className="sp-section-title"><span>Songs</span></div>
              <div style={{ padding: '0 4px' }}>
                {results.matchedSongs.slice(0, 10).map((s, i) => (
                  <button
                    key={s.id}
                    className="sp-songrow"
                    style={{ width: '100%', background: 'none', border: 'none', color: 'inherit', textAlign: 'left' }}
                    onClick={() => playSong(s, results.matchedSongs)}
                  >
                    <div className="sp-songrow-num">{i + 1}</div>
                    <img src={s.cover} alt="" className="sp-songrow-cover" />
                    <div className="sp-songrow-info">
                      <div className="sp-songrow-title">{s.title}</div>
                      <div className="sp-songrow-artist">{s.artist}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {results.matchedArtists.length > 0 && (
            <>
              <div className="sp-section-title"><span>Künstler</span></div>
              <div className="sp-grid">
                {results.matchedArtists.map((name) => (
                  <button key={name} className="sp-card">
                    <div
                      className="sp-card-img round"
                      style={{
                        background: 'linear-gradient(135deg, #404040, #181818)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 36, fontWeight: 800, color: '#b3b3b3',
                      }}
                    >
                      {name[0]}
                    </div>
                    <div className="sp-card-title">{name}</div>
                    <div className="sp-card-sub">Künstler</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {results.matchedPlaylists.length > 0 && (
            <>
              <div className="sp-section-title"><span>Playlists</span></div>
              <div className="sp-grid">
                {results.matchedPlaylists.map((p) => (
                  <PlaylistCard key={p.id} playlist={p} />
                ))}
              </div>
            </>
          )}

          {results.matchedSongs.length === 0 && results.matchedArtists.length === 0 && results.matchedPlaylists.length === 0 && (
            <div className="sp-empty">
              <Music size={40} style={{ opacity: 0.5, marginBottom: 12 }} />
              <div>Keine Ergebnisse für „{query}"</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}