import { ChevronLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PROFILE_AVATAR, useLibrary } from '../context/LibraryContext';

interface Props {
  title?: string;
  showBack?: boolean;
  showAvatar?: boolean;
}

export default function TopBar({ title, showBack = true, showAvatar = true }: Props) {
  const navigate = useNavigate();
  const { profile } = useLibrary();
  const canGoBack = window.history.length > 1;

  return (
    <header className="sp-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {showBack && canGoBack ? (
          <button className="sp-iconbtn" onClick={() => navigate(-1)} aria-label="Zurück">
            <ChevronLeft size={18} />
          </button>
        ) : (
          <div style={{ width: 32 }} />
        )}
        {title && <h1>{title}</h1>}
      </div>
      {showAvatar && (
        <div className="sp-topbar-right">
          <button className="sp-iconbtn" aria-label="Benachrichtigungen">
            <Bell size={16} />
          </button>
          <img
            src={PROFILE_AVATAR}
            alt={profile.name}
            className="sp-avatar"
            onClick={() => navigate('/musica/settings')}
          />
        </div>
      )}
    </header>
  );
}