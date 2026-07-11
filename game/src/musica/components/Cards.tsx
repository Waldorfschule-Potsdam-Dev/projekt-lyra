import { useNavigate } from 'react-router-dom';
import type { Playlist, Artist } from '../data/songs';

interface PProps { playlist: Playlist }
interface AProps { artist: Artist }

export function PlaylistCard({ playlist }: PProps) {
  const navigate = useNavigate();
  return (
    <button className="sp-card" onClick={() => navigate(`/musica/playlist/${playlist.id}`)}>
      <img src={playlist.cover} alt="" className="sp-card-img" />
      <div className="sp-card-title">{playlist.name}</div>
      <div className="sp-card-sub">{playlist.description}</div>
    </button>
  );
}

export function ArtistCard({ artist }: AProps) {
  return (
    <button className="sp-card">
      <img src={artist.cover} alt="" className="sp-card-img round" />
      <div className="sp-card-title">{artist.name}</div>
      <div className="sp-card-sub">Künstler</div>
    </button>
  );
}

export function GenreTile({ name, color }: { name: string; color: string }) {
  return (
    <div className="sp-genre-tile" style={{ background: color }}>
      <h3>{name}</h3>
    </div>
  );
}