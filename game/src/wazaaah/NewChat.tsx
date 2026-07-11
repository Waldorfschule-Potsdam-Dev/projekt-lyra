import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Users, MessageCirclePlus, UserPlus } from 'lucide-react';
import { initialChats } from './data';
import { waColors } from './styles';
import { isChatMuted } from './store';

const Avatar = ({ name, color, size = 44, src }: { name: string; color: string; size?: number; src?: string }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
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
        fontSize: size * 0.42,
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
};

export default function NewChat() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const contacts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = initialChats.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.avatarColor,
      avatarUrl: c.avatarUrl,
      phone: c.phone,
      about: c.about,
      isGroup: !!c.isGroup,
      isMuted: isChatMuted(c.id),
    }));
    return q
      ? list.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.phone ?? '').toLowerCase().includes(q) ||
            (c.about ?? '').toLowerCase().includes(q),
        )
      : list;
  }, [query]);

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
        <ArrowLeft
          size={24}
          color={waColors.textOnDark}
          onClick={() => navigate('/wazaaah')}
          style={{ cursor: 'pointer', padding: 4, marginRight: 8 }}
        />
        <span style={{ fontSize: 20, fontWeight: 500 }}>Neuer Chat</span>
      </header>

      <div
        style={{
          backgroundColor: waColors.searchBg,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: `1px solid ${waColors.border}`,
          flexShrink: 0,
        }}
      >
        <Search size={18} color={waColors.textSecondary} />
        <input
          autoFocus
          type="text"
          placeholder="Kontakte suchen…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            fontSize: 15,
            color: waColors.textPrimary,
          }}
        />
      </div>

      <div style={{ backgroundColor: '#fff', borderBottom: `1px solid ${waColors.divider}` }}>
        <button
          onClick={() => {
            const name = prompt('Name der neuen Gruppe:');
            if (name && name.trim()) {
              alert(`Gruppe "${name.trim()}" wurde erstellt. Mitglieder können unten ausgewählt werden.`);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            width: '100%',
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: `1px solid ${waColors.divider}`,
            cursor: 'pointer',
            textAlign: 'left',
            color: waColors.textPrimary,
            fontSize: 15,
          }}
        >
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: waColors.primaryGreen,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Users size={20} color="#fff" />
          </span>
          <span>Neue Gruppe</span>
        </button>
        <button
          onClick={() => {
            const name = prompt('Name des neuen Kontakts:');
            if (name && name.trim()) {
              alert(`Kontakt "${name.trim()}" wurde hinzugefügt.`);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            width: '100%',
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            color: waColors.textPrimary,
            fontSize: 15,
          }}
        >
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: waColors.primaryGreen,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <UserPlus size={20} color="#fff" />
          </span>
          <span>Neuer Kontakt</span>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '12px 16px 4px', fontSize: 12, color: waColors.textSecondary, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Kontakte
        </div>
        {contacts.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: waColors.textSecondary, fontSize: 14 }}>
            Keine Kontakte gefunden.
          </div>
        )}
        {contacts.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/wazaaah/chat/${c.id}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '10px 16px',
              backgroundColor: '#fff',
              border: 'none',
              borderBottom: `1px solid ${waColors.divider}`,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <Avatar name={c.name} color={c.color} src={c.avatarUrl} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: waColors.textPrimary, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                {c.isMuted && <span style={{ fontSize: 11, color: waColors.textSecondary }}>🔕</span>}
              </div>
              {c.about && (
                <div style={{ fontSize: 13, color: waColors.textSecondary, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.about}
                </div>
              )}
            </div>
            <MessageCirclePlus size={20} color={waColors.primaryGreen} />
          </button>
        ))}
      </div>
    </div>
  );
}
