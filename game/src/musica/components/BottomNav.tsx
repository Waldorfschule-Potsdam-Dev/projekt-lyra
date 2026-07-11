import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Library, Settings as Cog, Plus } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { useState } from 'react';

export default function BottomNav() {
  const { createPlaylist } = useLibrary();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');

  const onCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const pl = createPlaylist(trimmed);
    setName('');
    setShowModal(false);
    navigate(`/musica/playlist/${pl.id}`);
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `sp-nav-item${isActive ? ' active' : ''}`;

  return (
    <>
      <nav className="sp-bottomnav">
        <NavLink to="/musica" end className={linkClass}>
          <Home size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/musica/search" className={linkClass}>
          <Search size={20} />
          <span>Suche</span>
        </NavLink>
        <NavLink to="/musica/library" className={linkClass}>
          <Library size={20} />
          <span>Bibliothek</span>
        </NavLink>
        <button onClick={() => setShowModal(true)} className="sp-nav-item">
          <Plus size={20} />
          <span>Erstellen</span>
        </button>
        <NavLink to="/musica/settings" className={linkClass}>
          <Cog size={20} />
          <span>Profil</span>
        </NavLink>
      </nav>

      {showModal && (
        <div className="sp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Neue Playlist</h3>
            <input
              autoFocus
              placeholder="Name eingeben"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onCreate()}
            />
            <div className="sp-modal-actions">
              <button className="sp-btn-ghost" onClick={() => setShowModal(false)}>
                Abbrechen
              </button>
              <button className="sp-btn-green" onClick={onCreate}>
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}