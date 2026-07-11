import { Play } from 'lucide-react';
import { playlists, genres, featuredArtists, getPlaylistSongs } from '../data/songs';
import { PlaylistCard, ArtistCard, GenreTile } from '../components/Cards';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { playSong } = usePlayer();
  const navigate = useNavigate();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6) return 'Gute Nacht';
    if (h < 11) return 'Guten Morgen';
    if (h < 14) return 'Guten Tag';
    if (h < 18) return 'Schönen Nachmittag';
    if (h < 22) return 'Guten Abend';
    return 'Gute Nacht';
  })();

  const quickPicks = playlists.slice(0, 6);

  return (
    <div>
      <div className="sp-greeting">{greeting}</div>

      {/* Quick picks */}
      <div style={{ paddingBottom: 8 }}>
        {quickPicks.map((pl) => (
          <button
            key={pl.id}
            className="sp-quickpick"
            onClick={() => navigate(`/musica/playlist/${pl.id}`)}
          >
            <img src={pl.cover} alt="" />
            <span className="sp-quickpick-title">{pl.name}</span>
            <span className="sp-quickpick-play">
              <Play size={16} fill="#000" style={{ marginLeft: 1 }} />
            </span>
          </button>
        ))}
      </div>

      <div className="sp-section-title">
        <span>Empfohlen für dich</span>
      </div>
      <div className="sp-grid">
        {playlists.slice(0, 6).map((p) => (
          <PlaylistCard key={p.id} playlist={p} />
        ))}
      </div>

      <div className="sp-section-title">
        <span>Genres & Stimmungen</span>
      </div>
      <div className="sp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {genres.slice(0, 6).map((g) => (
          <GenreTile key={g.id} name={g.name} color={g.color} />
        ))}
      </div>

      <div className="sp-section-title">
        <span>Beliebte Künstler</span>
      </div>
      <div className="sp-grid">
        {featuredArtists.map((a) => (
          <ArtistCard key={a.id} artist={a} />
        ))}
      </div>

      <div className="sp-section-title">
        <span>Schnellzugriff</span>
      </div>
      <div style={{ padding: '0 12px 24px' }}>
        {playlists.slice(0, 4).map((pl) => {
          const s = getPlaylistSongs(pl)[0];
          if (!s) return null;
          return (
            <button
              key={pl.id}
              className="sp-row"
              onClick={() => playSong(s, getPlaylistSongs(pl))}
              style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 6, marginBottom: 6, width: '100%', border: 'none', textAlign: 'left' }}
            >
              <img src={s.cover} alt="" className="sp-row-cover sm" />
              <div className="sp-row-info">
                <div className="sp-row-title">{s.title}</div>
                <div className="sp-row-sub">{s.artist}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}