import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Camera,
  Search,
  MessageCirclePlus,
  BellOff,
  Bell,
  CheckCheck,
  Pin,
  Trash2,
  Settings as SettingsIcon,
} from 'lucide-react';
import type { Chat } from './types';
import { waColors } from './styles';
import { formatMessageTime } from './index';
import {
  isChatMuted,
  isChatRead,
  markChatRead,
  toggleMute,
  useStatuses,
  useMutedChats,
  useReadChats,
  useUnlockedHiddenChats,
  ME_ID,
  ME_COLOR,
} from './store';
import { initialChats } from './data';

const formatTime = (date: Date) => formatMessageTime(date);

const Avatar = ({ name, color, size = 49, src }: { name: string; color: string; size?: number; src?: string }) => {
  const initial = name.trim().charAt(0).toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
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

const TypingDots = () => (
  <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center', marginRight: 6, verticalAlign: 'middle' }}>
    <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: waColors.textSecondary, animation: 'wa-bounce 1.2s infinite', animationDelay: '0s' }} />
    <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: waColors.textSecondary, animation: 'wa-bounce 1.2s infinite', animationDelay: '0.2s' }} />
    <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: waColors.textSecondary, animation: 'wa-bounce 1.2s infinite', animationDelay: '0.4s' }} />
  </span>
);

interface ChatRowProps {
  chat: Chat;
  query: string;
  onLongPress: (chat: Chat, x: number, y: number) => void;
}

const ChatRow = ({ chat, query, onLongPress }: ChatRowProps) => {
  const isTyping = !!chat.isTyping;
  const lastMsg = chat.messages[chat.messages.length - 1];
  const hasMessages = !!lastMsg;
  const previewText = isTyping
    ? 'schreibt...'
    : hasMessages
    ? lastMsg.text
    : 'Neuer Chat – schreibe die erste Nachricht';
  let displayText = previewText;
  if (chat.isGroup && !isTyping && hasMessages && lastMsg.fromMe === false) {
    const colonIdx = lastMsg.text.indexOf(':');
    if (colonIdx > 0 && colonIdx < 20) {
      displayText = `${lastMsg.text.slice(0, colonIdx + 1)} ${lastMsg.text.slice(colonIdx + 1)}`;
    }
  }

  const timeStr = hasMessages ? formatTime(lastMsg.timestamp) : '';
  const hasUnread = hasMessages && (chat.unreadCount ?? 0) > 0 && !isChatRead(chat.id);
  const muted = isChatMuted(chat.id);

  const highlightedName = query ? highlight(chat.name, query) : chat.name;
  const highlightedText = query ? highlight(displayText, query) : displayText;

  const longPressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);

  const startLongPress = (e: React.TouchEvent | React.MouseEvent) => {
    longPressFired.current = false;
    const t = e as React.TouchEvent;
    const x = 'touches' in t ? t.touches[0].clientX : (e as React.MouseEvent).clientX;
    const y = 'touches' in t ? t.touches[0].clientY : (e as React.MouseEvent).clientY;
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      onLongPress(chat, x, y);
    }, 500);
  };
  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };
  const handleClick = (e: React.MouseEvent) => {
    if (longPressFired.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '13px',
        padding: '10px 16px',
        backgroundColor: '#fff',
        borderBottom: `1px solid ${waColors.divider}`,
        WebkitTapHighlightColor: 'transparent',
        position: 'relative',
      }}
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      onMouseDown={startLongPress}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
      onContextMenu={(e) => {
        e.preventDefault();
        onLongPress(chat, e.clientX, e.clientY);
      }}
    >
      <Link
        to={`/wazaaah/chat/${chat.id}`}
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '13px',
          textDecoration: 'none',
          color: 'inherit',
          flex: 1,
          minWidth: 0,
        }}
      >
        <Avatar name={chat.name} color={chat.avatarColor} src={chat.avatarUrl} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <span
              style={{
                fontSize: '16px',
                fontWeight: hasUnread ? 600 : 500,
                color: waColors.textPrimary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0,
                paddingRight: 8,
              }}
            >
              {highlightedName}
            </span>
            <span
              style={{
                fontSize: '12px',
                color: hasUnread ? waColors.primaryGreen : waColors.textSecondary,
                fontWeight: hasUnread ? 500 : 400,
                flexShrink: 0,
              }}
            >
              {timeStr}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '13px',
                color: waColors.textSecondary,
                minWidth: 0,
                flex: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {muted && <BellOff size={14} color={waColors.textSecondary} style={{ flexShrink: 0 }} />}
              {hasMessages && lastMsg.fromMe && !isTyping && (
                <CheckCheck size={14} color={lastMsg.status === 'read' ? waColors.readTick : waColors.textSecondary} style={{ flexShrink: 0 }} />
              )}
              {isTyping && <TypingDots />}
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontWeight: isTyping ? 500 : 400,
                  color: isTyping ? waColors.primaryGreen : waColors.textSecondary,
                  fontStyle: isTyping ? 'italic' : 'normal',
                }}
              >
                {highlightedText}
              </span>
            </div>
            {hasUnread && (
              <div
                style={{
                  minWidth: 22,
                  height: 22,
                  borderRadius: '11px',
                  backgroundColor: waColors.unreadBadge,
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 6px',
                  flexShrink: 0,
                }}
              >
                {chat.unreadCount}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

const highlight = (text: string, query: string): React.ReactNode => {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: waColors.textPrimary, fontWeight: 600, backgroundColor: '#FFF3A3' }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
};

const StatusRow = ({ onClick }: { onClick: () => void }) => {
  const statuses = useStatuses();
  const myLatest = statuses.find((s) => s.authorId === ME_ID);
  const otherHasNew = statuses.some((s) => s.authorId !== ME_ID && !s.seen);
  const hasAny = statuses.length > 0;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 16px',
        borderBottom: `1px solid ${waColors.divider}`,
        backgroundColor: '#fff',
        flexShrink: 0,
        width: '100%',
        border: 'none',
        borderBottomColor: waColors.divider,
        borderBottomStyle: 'solid',
        borderBottomWidth: 1,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: '50%',
          padding: 2,
          background: hasAny
            ? `linear-gradient(135deg, ${waColors.primaryGreen}, #34D399)`
            : '#C7C7C7',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: ME_COLOR,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 500,
            fontSize: 18,
            overflow: 'hidden',
          }}
        >
          {myLatest ? (
            <img src={myLatest.imageUrl} alt="Mein Status" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            '+'
          )}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: waColors.textPrimary }}>Mein Status</div>
        <div style={{ fontSize: '13px', color: waColors.textSecondary, marginTop: 2 }}>
          {hasAny ? `${statuses.length} ${statuses.length === 1 ? 'Update' : 'Updates'}` : 'Tippen, um Status zu aktualisieren'}
        </div>
      </div>
      {otherHasNew && (
        <span
          style={{
            minWidth: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: waColors.primaryGreen,
            flexShrink: 0,
          }}
        />
      )}
    </button>
  );
};

export default function ChatList() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [actionMenu, setActionMenu] = useState<{ chat: Chat; x: number; y: number } | null>(null);
  useMutedChats();
  useReadChats();
  const unlockedHidden = useUnlockedHiddenChats();

  const visibleChats = initialChats.filter((c) => !c.isHidden || unlockedHidden.has(c.id));

  const filtered = query.trim()
    ? visibleChats.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.messages.some((m) => m.text.toLowerCase().includes(query.toLowerCase())),
      )
    : visibleChats;

  const openActionMenu = (chat: Chat, x?: number, y?: number) => {
    setActionMenu({ chat, x: x ?? 9999, y: y ?? 9999 });
  };

  const closeActionMenu = () => setActionMenu(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: waColors.listBg, position: 'relative' }}>
      <style>{`
        @keyframes wa-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>

      <header
        style={{
          backgroundColor: waColors.headerBg,
          color: waColors.textOnDark,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          height: '60px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '20px', fontWeight: 600 }}>Wazaaah</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Camera
            size={22}
            color={waColors.textOnDark}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/wazaaah/status/new')}
          />
          <Search
            size={22}
            color={waColors.textOnDark}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSearchOpen((s) => !s);
              if (searchOpen) setQuery('');
            }}
          />
          <SettingsIcon
            size={22}
            color={waColors.textOnDark}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/wazaaah/settings')}
            aria-label="Einstellungen"
          />
        </div>
      </header>

      {searchOpen && (
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
            placeholder="Chats durchsuchen..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '15px',
              color: waColors.textPrimary,
            }}
          />
          {query && (
            <span onClick={() => setQuery('')} style={{ color: waColors.textSecondary, fontSize: 13, cursor: 'pointer', padding: 4 }}>
              ✕
            </span>
          )}
        </div>
      )}

      <StatusRow onClick={() => navigate('/wazaaah/status')} />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: waColors.textSecondary, fontSize: 14 }}>
            Keine Chats gefunden.
          </div>
        )}
        {filtered.map((chat) => (
          <ChatRow
            key={chat.id}
            chat={chat}
            query={query.trim()}
            onLongPress={openActionMenu}
          />
        ))}
      </div>

      <div
        onClick={() => navigate('/wazaaah/new-chat')}
        style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          width: 56,
          height: 56,
          borderRadius: '18px',
          backgroundColor: waColors.fabBg,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 14px rgba(0,0,0,0.25)',
          cursor: 'pointer',
          zIndex: 10,
        }}
        title="Neuer Chat"
        aria-label="Neuer Chat"
      >
        <MessageCirclePlus size={24} color="#fff" />
      </div>

      {actionMenu && (
        <div onClick={closeActionMenu} style={{ position: 'absolute', inset: 0, zIndex: 30 }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: Math.min(actionMenu.y, window.innerHeight - 240),
              left: actionMenu.x > 200 ? actionMenu.x - 220 : actionMenu.x,
              backgroundColor: '#fff',
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              minWidth: 220,
              overflow: 'hidden',
            }}
          >
            <MenuItem
              icon={isChatMuted(actionMenu.chat.id) ? <Bell size={18} /> : <BellOff size={18} />}
              label={isChatMuted(actionMenu.chat.id) ? 'Benachrichtigungen einschalten' : 'Stumm schalten'}
              onClick={() => {
                toggleMute(actionMenu.chat.id);
                closeActionMenu();
              }}
            />
            <MenuItem
              icon={<CheckCheck size={18} />}
              label="Als gelesen markieren"
              onClick={() => {
                markChatRead(actionMenu.chat.id);
                closeActionMenu();
              }}
            />
            <MenuItem
              icon={<Pin size={18} />}
              label="Chat anpinnen"
              onClick={() => {
                alert(`${actionMenu.chat.name} wurde angepinnt`);
                closeActionMenu();
              }}
            />
            <MenuItem
              icon={<Trash2 size={18} />}
              label="Chat löschen"
              danger
              onClick={() => {
                if (confirm(`Chat mit ${actionMenu.chat.name} löschen?`)) {
                  closeActionMenu();
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const MenuItem = ({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      width: '100%',
      padding: '12px 16px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      color: danger ? '#E53935' : waColors.textPrimary,
      fontSize: 15,
    }}
  >
    {icon}
    <span>{label}</span>
  </button>
);
