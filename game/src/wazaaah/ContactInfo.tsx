import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Video,
  Phone,
  MessageCircle,
  BellOff,
  Bell,
  Trash2,
  Ban,
  Share2,
  Star,
} from 'lucide-react';
import { initialChats } from './data';
import { waColors } from './styles';
import { isChatMuted, toggleMute } from './store';
import type { Chat } from './types';

const Avatar = ({ name, color, size = 200, src }: { name: string; color: string; size?: number; src?: string }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    );
  }
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 500,
      }}
    >
      {initial}
    </div>
  );
};

const ActionTile = ({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick?: () => void; danger?: boolean }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      padding: '14px 4px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: danger ? '#E53935' : waColors.textPrimary,
      minWidth: 72,
    }}
  >
    <span
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        backgroundColor: danger ? 'rgba(229,57,53,0.1)' : waColors.searchBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </span>
    <span style={{ fontSize: 12, color: danger ? '#E53935' : waColors.textPrimary, fontWeight: 500 }}>{label}</span>
  </button>
);

const InfoRow = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${waColors.divider}` }}>
      <div style={{ fontSize: 12, color: waColors.textSecondary, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 15, color: waColors.textPrimary, wordBreak: 'break-word' }}>{value}</div>
    </div>
  );
};

export default function ContactInfo() {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  const chat = initialChats.find((c) => c.id === chatId) as Chat | undefined;
  const muted = chat ? isChatMuted(chat.id) : false;

  if (!chat) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', flexDirection: 'column', gap: 12, color: waColors.textSecondary }}>
        <span>Kontakt nicht gefunden.</span>
        <button onClick={() => navigate('/wazaaah')} style={{ padding: '8px 16px', background: waColors.primaryGreen, color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer' }}>
          Zurück
        </button>
      </div>
    );
  }

  const handleToggleMute = () => {
    toggleMute(chat.id);
  };

  const handleClearChat = () => {
    if (confirm(`Chat mit ${chat.name} leeren?`)) {
      chat.messages.splice(0, chat.messages.length);
      navigate('/wazaaah');
    }
  };

  const handleDeleteChat = () => {
    if (confirm(`Chat mit ${chat.name} löschen?`)) {
      navigate('/wazaaah');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: waColors.listBg }}>
      <header
        style={{
          backgroundColor: waColors.headerBg,
          color: waColors.textOnDark,
          display: 'flex',
          alignItems: 'center',
          padding: '8px 6px',
          height: 60,
          flexShrink: 0,
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
      >
        <ArrowLeft size={24} color={waColors.textOnDark} onClick={() => navigate(`/wazaaah/chat/${chat.id}`)} style={{ cursor: 'pointer', padding: 4, marginRight: 4 }} />
        <span style={{ fontSize: 20, fontWeight: 500 }}>Kontaktinfo</span>
      </header>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0 16px' }}>
          <Avatar name={chat.name} color={chat.avatarColor} src={chat.avatarUrl} />
        </div>
        <div style={{ textAlign: 'center', padding: '0 16px 8px' }}>
          <div style={{ fontSize: 24, fontWeight: 500, color: waColors.textPrimary }}>{chat.name}</div>
          {chat.phone && (
            <div style={{ fontSize: 14, color: waColors.textSecondary, marginTop: 4 }}>{chat.phone}</div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '16px 8px', borderBottom: `1px solid ${waColors.divider}` }}>
          <ActionTile
            icon={<MessageCircle size={20} color={waColors.textPrimary} />}
            label="Nachricht"
            onClick={() => navigate(`/wazaaah/chat/${chat.id}`)}
          />
          <ActionTile
            icon={<Phone size={20} color={waColors.textPrimary} />}
            label="Anrufen"
            onClick={() => alert(`Anruf bei ${chat.name} wird getätigt…`)}
          />
          <ActionTile
            icon={<Video size={20} color={waColors.textPrimary} />}
            label="Video"
            onClick={() => alert(`Videoanruf mit ${chat.name} wird gestartet…`)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8, backgroundColor: '#fff' }}>
          <InfoRow label="Info" value={chat.about} />
          <InfoRow label="Telefon" value={chat.phone} />
          <InfoRow
            label="Zuletzt online"
            value={chat.isTyping ? 'online' : chat.lastSeen || 'unbekannt'}
          />
        </div>

        <div style={{ marginTop: 8, backgroundColor: '#fff' }}>
          <button
            onClick={handleToggleMute}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              width: '100%',
              padding: '14px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${waColors.divider}`,
              cursor: 'pointer',
              textAlign: 'left',
              color: waColors.textPrimary,
              fontSize: 15,
            }}
          >
            {muted ? <Bell size={20} color={waColors.textPrimary} /> : <BellOff size={20} color={waColors.textPrimary} />}
            <span>{muted ? 'Benachrichtigungen einschalten' : 'Benachrichtigungen stumm schalten'}</span>
          </button>
          <button
            onClick={() => alert(`${chat.name} wurde zu Favoriten hinzugefügt`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              width: '100%',
              padding: '14px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${waColors.divider}`,
              cursor: 'pointer',
              textAlign: 'left',
              color: waColors.textPrimary,
              fontSize: 15,
            }}
          >
            <Star size={20} color={waColors.textPrimary} />
            <span>Zu Favoriten hinzufügen</span>
          </button>
          <button
            onClick={() => alert(`Kontakt ${chat.name} teilen…`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              width: '100%',
              padding: '14px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${waColors.divider}`,
              cursor: 'pointer',
              textAlign: 'left',
              color: waColors.textPrimary,
              fontSize: 15,
            }}
          >
            <Share2 size={20} color={waColors.textPrimary} />
            <span>Kontakt teilen</span>
          </button>
        </div>

        <div style={{ marginTop: 8, backgroundColor: '#fff' }}>
          <button
            onClick={handleClearChat}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              width: '100%',
              padding: '14px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${waColors.divider}`,
              cursor: 'pointer',
              textAlign: 'left',
              color: '#E53935',
              fontSize: 15,
            }}
          >
            <Trash2 size={20} color="#E53935" />
            <span>Chat leeren</span>
          </button>
          <button
            onClick={handleDeleteChat}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              width: '100%',
              padding: '14px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${waColors.divider}`,
              cursor: 'pointer',
              textAlign: 'left',
              color: '#E53935',
              fontSize: 15,
            }}
          >
            <Trash2 size={20} color="#E53935" />
            <span>Chat löschen</span>
          </button>
          <button
            onClick={() => alert(`${chat.name} blockiert`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              width: '100%',
              padding: '14px 16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              color: '#E53935',
              fontSize: 15,
            }}
          >
            <Ban size={20} color="#E53935" />
            <span>{chat.name} blockieren</span>
          </button>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
