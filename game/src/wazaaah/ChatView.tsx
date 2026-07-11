import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Video,
  Phone,
  Smile,
  Paperclip,
  Send,
  Mic,
  Pause,
  Play,
  CheckCheck,
  Image as ImageIcon,
  Camera,
  User,
  BellOff,
  Bell,
  Trash2,
  X,
  Search,
} from 'lucide-react';
import { initialChats } from './data';
import { waColors } from './styles';
import type { Message } from './types';
import { formatLastSeen } from './index';
import {
  isChatMuted,
  toggleMute,
  markChatRead,
} from './store';
import { useClueStore } from '../store/clues';
import { CollectClueButton } from '../components/CollectClueButton';

const formatBubbleTime = (date: Date) => {
  const safe = date.getTime() > Date.now() ? new Date() : date;
  return safe.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
};

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const waveformBars = [3, 5, 8, 4, 9, 6, 10, 7, 5, 9, 4, 7, 11, 6, 8, 5, 9, 4, 7, 10, 6, 8, 5, 9, 4, 7, 11, 6, 8, 5, 9, 4, 7, 10, 6, 8, 5, 9, 4, 7];

const VoiceMessagePlayer = ({ src, duration, tint }: { src: string; duration: number; tint: string }) => {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setElapsed(audio.currentTime);
    const onEnd = () => {
      setPlaying(false);
      setElapsed(0);
      audio.currentTime = 0;
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const total = duration || 0;
  const progress = total > 0 ? Math.min(elapsed / total, 1) : 0;
  const displaySeconds = playing ? Math.max(total - elapsed, 0) : total;
  const playedBars = Math.floor(progress * waveformBars.length);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 220 }}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        onClick={toggle}
        aria-label={playing ? 'Pause' : 'Abspielen'}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: tint,
          color: '#fff',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          padding: 0,
        }}
      >
        {playing ? <Pause size={18} color="#fff" fill="#fff" /> : <Play size={18} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />}
      </button>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, height: 24 }}>
        {waveformBars.map((h, i) => {
          const active = i < playedBars;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width: 2,
                height: `${Math.max(2, h)}px`,
                borderRadius: 1,
                backgroundColor: active ? tint : waColors.textSecondary,
                opacity: active ? 1 : 0.55,
                transition: 'background-color 0.15s',
              }}
            />
          );
        })}
      </div>
      <span style={{ fontSize: '12px', color: waColors.textSecondary, minWidth: 32, textAlign: 'right' }}>
        {formatDuration(displaySeconds)}
      </span>
    </div>
  );
};

const Avatar = ({ name, color, size = 40, src }: { name: string; color: string; size?: number; src?: string }) => {
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

interface BubbleProps {
  msg: Message;
  showSender?: boolean;
}

const MessageBubble = ({ msg, showSender }: BubbleProps) => {
  const isMe = msg.fromMe;
  const { discoverClue, hasClue } = useClueStore();
  const bg = isMe ? waColors.bubbleOutgoing : waColors.bubbleIncoming;
  const tint = isMe ? waColors.primaryGreen : waColors.linkBlue;
  const hasAudio = !!msg.audioUrl;
  const bubbleTextColor = isMe ? waColors.textPrimary : waColors.onIncomingDark;
  const timeColor = isMe ? waColors.textSecondary : waColors.onIncomingDarkMuted;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMe ? 'flex-end' : 'flex-start',
        marginBottom: 4,
        padding: '0 10px',
      }}
    >
      {showSender && msg.sender && (
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: waColors.linkBlue,
            marginBottom: 3,
            marginLeft: 6,
            marginRight: 6,
            letterSpacing: 0.1,
          }}
        >
          {msg.sender}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: isMe ? 'row-reverse' : 'row', width: '100%' }}>
      <div
        style={{
          position: 'relative',
          maxWidth: '78%',
          width: 'fit-content',
          flexShrink: 0,
          backgroundColor: bg,
          color: bubbleTextColor,
          padding: hasAudio ? '6px 8px 8px 10px' : '8px 12px',
          borderRadius: '20px',
          fontSize: '15px',
          lineHeight: 1.45,
          boxShadow: '0 1px 1.5px rgba(0,0,0,0.08)',
          wordBreak: 'normal',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      >
        {hasAudio && msg.audioUrl && (
          <VoiceMessagePlayer src={msg.audioUrl} duration={msg.audioDuration ?? 0} tint={tint} />
        )}
        {msg.text && <div style={{ marginTop: hasAudio ? 4 : 0 }}>{msg.text}</div>}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 4,
            marginTop: 2,
            float: 'right',
            marginLeft: 8,
          }}
        >
          <span style={{ fontSize: '11px', color: timeColor }}>{formatBubbleTime(msg.timestamp)}</span>
          {isMe && (
            <CheckCheck
              size={14}
              color={msg.status === 'read' ? waColors.readTick : waColors.textSecondary}
              strokeWidth={2.5}
            />
          )}
        </div>
      </div>
      
      {msg.clueId && (
        <div style={{ marginTop: 'auto', marginBottom: 4, flexShrink: 0 }}>
          <CollectClueButton clueId={msg.clueId as any} size={14} />
        </div>
      )}

      </div>
    </div>
  );
};

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳'] },
  { label: 'Hände', emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏', '💪', '🫶', '🤲'] },
  { label: 'Herzen', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'] },
];

const EmojiPicker = ({ onPick, onClose }: { onPick: (e: string) => void; onClose: () => void }) => (
  <div
    style={{
      position: 'absolute',
      left: 10,
      right: 10,
      bottom: 64,
      maxHeight: 280,
      backgroundColor: '#fff',
      borderRadius: 12,
      boxShadow: '0 -4px 16px rgba(0,0,0,0.18)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 20,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px solid ${waColors.divider}` }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: waColors.textPrimary }}>Emoji</span>
      <button onClick={onClose} aria-label="Schließen" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
        <X size={18} color={waColors.textSecondary} />
      </button>
    </div>
    <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
      {EMOJI_GROUPS.map((g) => (
        <div key={g.label} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: waColors.textSecondary, padding: '4px 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{g.label}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2 }}>
            {g.emojis.map((e, i) => (
              <button
                key={`${e}-${i}`}
                onClick={() => onPick(e)}
                style={{
                  fontSize: 22,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 6,
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AttachmentMenu = ({ onPickPhoto, onClose, onShareToStatus }: { onPickPhoto: () => void; onShareToStatus: () => void; onClose: () => void }) => (
  <div
    onClick={onClose}
    style={{
      position: 'absolute',
      inset: 0,
      zIndex: 20,
      display: 'flex',
      alignItems: 'flex-end',
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        padding: 16,
        paddingBottom: 24,
        boxShadow: '0 -8px 24px rgba(0,0,0,0.18)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: waColors.textPrimary }}>Anhang senden</span>
        <button onClick={onClose} aria-label="Schließen" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={18} color={waColors.textSecondary} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <AttachTile
          color="#7C4DFF"
          icon={<ImageIcon size={20} color="#fff" />}
          label="Foto"
          onClick={onPickPhoto}
        />
        <AttachTile
          color="#00A884"
          icon={<Camera size={20} color="#fff" />}
          label="Kamera"
          onClick={onPickPhoto}
        />
        <AttachTile
          color="#FF6B6B"
          icon={<Play size={20} color="#fff" />}
          label="Mein Status"
          onClick={onShareToStatus}
        />
      </div>
    </div>
  </div>
);

const AttachTile = ({ icon, label, onClick, color }: { icon: React.ReactNode; label: string; onClick: () => void; color: string }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: 8,
    }}
  >
    <span
      style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </span>
    <span style={{ fontSize: 12, color: waColors.textPrimary }}>{label}</span>
  </button>
);

export default function ChatView({ chatId }: { chatId: string }) {
  const navigate = useNavigate();
  const chat = initialChats.find((c) => c.id === chatId);

  const [messages, setMessages] = useState<Message[]>(chat?.messages ?? []);
  const [input, setInput] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [callOverlay, setCallOverlay] = useState<null | 'voice' | 'video'>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const discoverClue = useClueStore(s => s.discoverClue);

  useEffect(() => {
    markChatRead(chatId);
    if (chatId === 'mutter') {
      // Entdeckt das Katzen-Geheimnis, wenn man den Mama-Chat öffnet
      discoverClue('wazaaah:cats');
    }
  }, [chatId, discoverClue]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  if (!chat) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          flexDirection: 'column',
          gap: 12,
          color: waColors.textSecondary,
        }}
      >
        <span>Chat nicht gefunden.</span>
        <button
          onClick={() => navigate('/wazaaah')}
          style={{ padding: '8px 16px', background: waColors.primaryGreen, color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer' }}
        >
          Zurück
        </button>
      </div>
    );
  }

  const muted = isChatMuted(chat.id);
  const isTyping = !!chat.isTyping;

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const newMsg: Message = {
      id: `me-${Date.now()}`,
      text,
      timestamp: new Date(),
      fromMe: true,
      status: 'sent',
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'delivered' } : m)));
    }, 600);
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'read' } : m)));
    }, 1500);

    if (chat?.id === 'mutter' && text.toLowerCase() === 'plumber boss') {
      const triggerMsg: Message = {
        id: `mutter-boss-${Date.now()}`,
        text: '🎮 Boss-Level freigeschaltet! Viel Glück! 🍄',
        timestamp: new Date(),
        fromMe: false,
      };
      setMessages((prev) => [...prev, triggerMsg]);
      setTimeout(() => {
        navigate('/wazaaah/plumber');
      }, 1200);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmojiPick = (e: string) => {
    setInput((v) => v + e);
  };

  const handleClearChat = () => {
    if (confirm(`Chat mit ${chat.name} leeren?`)) {
      chat.messages.splice(0, chat.messages.length);
      setMessages([]);
      setMoreOpen(false);
    }
  };

  const handleToggleMute = () => {
    toggleMute(chat.id);
    setMoreOpen(false);
  };

  const handleShareToStatus = () => {
    setAttachOpen(false);
    navigate('/wazaaah/status/new');
  };

  const items = messages.map((msg, idx) => {
    const prev = messages[idx - 1];
    const showSender = !!chat?.isGroup && !msg.fromMe && !!msg.sender && (!prev || prev.fromMe || prev.sender !== msg.sender);
    return { msg, showSender };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: waColors.chatBg, position: 'relative' }}>
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
          style={{ cursor: 'pointer', padding: 4, marginRight: 4 }}
        />
        <Link
          to={`/wazaaah/contact/${chat.id}`}
          style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}
        >
          <Avatar name={chat.name} color={chat.avatarColor} size={40} src={chat.avatarUrl} />
          <div style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {chat.name}
            </div>
            <div style={{ fontSize: 12, color: waColors.textOnDarkMuted }}>{formatLastSeen(chat, new Date(), isTyping)}</div>
          </div>
        </Link>
      </header>

      <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
        {items.map(({ msg, showSender }) => (
          <MessageBubble key={msg.id} msg={msg} showSender={showSender} />
        ))}
      </div>

      <div
        style={{
          backgroundColor: waColors.composeBg,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            backgroundColor: waColors.inputBg,
            borderRadius: 24,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px 0 12px',
            minHeight: 40,
          }}
        >
          <Smile
            size={22}
            color={waColors.textSecondary}
            onClick={() => {
              setEmojiOpen((o) => !o);
              setAttachOpen(false);
            }}
            style={{ marginRight: 4, cursor: 'pointer' }}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => {
              setEmojiOpen(false);
              setAttachOpen(false);
            }}
            placeholder={chat?.id === 'mutter' ? 'Nachricht (Tipp: „Plumber Boss“)' : 'Nachricht'}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '15px',
              color: waColors.textPrimary,
              padding: '8px 4px',
            }}
          />
          <Paperclip
            size={20}
            color={waColors.textSecondary}
            onClick={() => {
              setAttachOpen((o) => !o);
              setEmojiOpen(false);
            }}
            style={{ margin: '0 4px', cursor: 'pointer', transform: 'rotate(45deg)' }}
          />
        </div>
        <button
          onClick={sendMessage}
          aria-label={input.trim() ? 'Senden' : 'Sprachnachricht'}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: waColors.primaryGreen,
            color: '#fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          }}
        >
          {input.trim() ? <Send size={20} color="#fff" /> : <Mic size={20} color="#fff" />}
        </button>
      </div>

      {emojiOpen && <EmojiPicker onPick={handleEmojiPick} onClose={() => setEmojiOpen(false)} />}
      {attachOpen && (
        <AttachmentMenu
          onPickPhoto={() => {
            setAttachOpen(false);
            navigate('/wazaaah/status/new');
          }}
          onShareToStatus={handleShareToStatus}
          onClose={() => setAttachOpen(false)}
        />
      )}

      {moreOpen && (
        <div onClick={() => setMoreOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 30 }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 64,
              right: 8,
              backgroundColor: '#fff',
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              minWidth: 220,
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => {
                setMoreOpen(false);
                navigate(`/wazaaah/contact/${chat.id}`);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${waColors.divider}`,
                cursor: 'pointer',
                textAlign: 'left',
                color: waColors.textPrimary,
                fontSize: 14,
              }}
            >
              <User size={18} />
              <span>Kontaktinfo</span>
            </button>
            <button
              onClick={handleToggleMute}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${waColors.divider}`,
                cursor: 'pointer',
                textAlign: 'left',
                color: waColors.textPrimary,
                fontSize: 14,
              }}
            >
              {muted ? <Bell size={18} /> : <BellOff size={18} />}
              <span>{muted ? 'Benachrichtigungen einschalten' : 'Stumm schalten'}</span>
            </button>
            <button
              onClick={handleClearChat}
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
                color: '#E53935',
                fontSize: 14,
              }}
            >
              <Trash2 size={18} color="#E53935" />
              <span>Chat leeren</span>
            </button>
          </div>
        </div>
      )}

      {callOverlay && (
        <div
          onClick={() => setCallOverlay(null)}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            gap: 24,
          }}
        >
          <Avatar name={chat.name} color={chat.avatarColor} size={120} src={chat.avatarUrl} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 500 }}>{chat.name}</div>
            <div style={{ fontSize: 14, opacity: 0.8, marginTop: 6 }}>
              {callOverlay === 'video' ? 'Videoanruf wird aufgebaut…' : 'Anruf wird getätigt…'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
            <button
              onClick={() => setCallOverlay(null)}
              aria-label="Beenden"
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: '#E53935',
                color: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {callOverlay === 'video' ? <Video size={28} color="#fff" /> : <Phone size={28} color="#fff" />}
            </button>
          </div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>Tippen außerhalb zum Schließen</div>
        </div>
      )}
    </div>
  );
}
