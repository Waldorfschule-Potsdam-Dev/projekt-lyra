import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Film,
  MessageCircle,
  Search as SearchIcon,
  Heart,
  MoreHorizontal,
  Plus,
  Camera,
  Send,
  ChevronLeft,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import {
  COLORS,
  REELS,
  CHATS,
  SUGGESTED_TAGS,
  SUGGESTED_PEOPLE,
  PROFILE_POSTS,
  PROFILE_REELS,
  PROFILE,
  SAMPLE_INCOMING,
  type Chat,
  type Msg,
} from './data';
import { Avatar } from './Avatar';
import HomeScreen from './HomeScreen';
import PostDetail from './PostDetail';
import UserProfileScreen from './UserProfileScreen';
import { StoryViewer } from './Story';
import { CollectClueButton } from '../components/CollectClueButton';

function ReelsScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#000' }}>
      <div
        style={{
          padding: '12px 16px',
          color: '#fff',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: 18,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        Reels
        <Camera color="#fff" size={22} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {REELS.map((r) => (
          <div
            key={r.id}
            style={{
              height: 480,
              backgroundColor: '#000',
              backgroundImage: `${r.bg ? `${r.bg}, ` : ''}url("${r.img}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 4,
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)' }} />
            <div style={{ position: 'absolute', top: 20, left: 16, right: 70 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{r.avatar}</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{r.user}</span>
                <span
                  style={{
                    border: '1px solid #fff',
                    padding: '2px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    color: '#fff',
                  }}
                >
                  Folgen
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#fff' }}>{r.caption}</div>
            </div>
            <div
              style={{
                position: 'absolute',
                right: 12,
                bottom: 30,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 18,
                color: '#fff',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Heart size={28} />
                <div style={{ fontSize: 11, marginTop: 2 }}>{r.likes.toLocaleString('de-DE')}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <MessageCircle size={28} />
                <div style={{ fontSize: 11, marginTop: 2 }}>{r.comments}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Send size={28} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <MoreHorizontal size={28} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesScreen({ chats }: { chats: Chat[] }) {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: COLORS.bg }}>
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: 20 }}>{PROFILE.username}</span>
        <Plus color={COLORS.text} size={24} style={{ cursor: 'pointer' }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {chats.map((c) => {
          const last = c.messages[c.messages.length - 1];
          return (
            <div
              key={c.id}
              onClick={() => navigate(`/lumigram/messages/${c.id}`)}
              style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            >
              <div style={{ position: 'relative' }}>
                <Avatar emoji={c.avatar} img={c.img} size={52} />
                {c.online && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: '#4caf50',
                      border: '2px solid #fff',
                    }}
                  />
                )}
              </div>
              <div style={{ flex: 1, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{c.user}</span>
                  <span style={{ color: COLORS.muted, fontSize: 12 }}>{last?.time ?? ''}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span
                    style={{
                      color: COLORS.muted,
                      fontSize: 13,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '75%',
                    }}
                  >
                    {last ? (last.fromMe ? `Du: ${last.text}` : last.text) : ''}
                  </span>
                  {c.unread > 0 && (
                    <div
                      style={{
                        backgroundColor: COLORS.accent,
                        color: '#fff',
                        borderRadius: '50%',
                        minWidth: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 'bold',
                        padding: '0 6px',
                      }}
                    >
                      {c.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChatDetail({ chat, onBack, onSend }: { chat: Chat; onBack: () => void; onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages.length]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: COLORS.bg }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          borderBottom: `1px solid ${COLORS.border}`,
          gap: 8,
          flexShrink: 0,
        }}
      >
        <ChevronLeft size={28} color={COLORS.text} onClick={onBack} style={{ cursor: 'pointer' }} />
        <Avatar emoji={chat.avatar} img={chat.img} size={36} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{chat.user}</div>
          <div style={{ fontSize: 11, color: chat.online ? '#4caf50' : COLORS.muted }}>
            {chat.online ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          backgroundColor: '#fafafa',
        }}
      >
        {chat.messages.map((m) => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.fromMe ? 'flex-end' : 'flex-start' }}>
            <div
              style={{
                maxWidth: '75%',
                padding: '8px 12px',
                borderRadius: 18,
                background: m.fromMe ? '#3797f0' : '#efefef',
                color: m.fromMe ? '#fff' : COLORS.text,
                fontSize: 14,
                lineHeight: 1.3,
                borderBottomRightRadius: m.fromMe ? 4 : 18,
                borderBottomLeftRadius: m.fromMe ? 18 : 4,
              }}
            >
              {m.text}
              <div
                style={{
                  fontSize: 10,
                  marginTop: 2,
                  opacity: 0.7,
                  textAlign: m.fromMe ? 'right' : 'left',
                }}
              >
                {m.time}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: 10,
          borderTop: `1px solid ${COLORS.border}`,
          gap: 8,
          backgroundColor: COLORS.bg,
          flexShrink: 0,
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="Nachricht..."
          style={{
            flex: 1,
            border: 'none',
            borderRadius: 20,
            backgroundColor: '#efefef',
            padding: '8px 14px',
            fontSize: 14,
            outline: 'none',
            color: COLORS.text,
          }}
        />
        <button
          onClick={submit}
          disabled={!text.trim()}
          style={{
            background: 'none',
            border: 'none',
            cursor: text.trim() ? 'pointer' : 'default',
            opacity: text.trim() ? 1 : 0.4,
            padding: 0,
            display: 'flex',
          }}
        >
          <Send size={24} color="#3797f0" />
        </button>
      </div>
    </div>
  );
}

function SearchScreen() {
  const [query, setQuery] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: COLORS.bg }}>
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        <div
          style={{
            backgroundColor: '#efefef',
            borderRadius: 10,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <SearchIcon size={18} color={COLORS.muted} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen"
            style={{
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              flex: 1,
              fontSize: 14,
              color: COLORS.text,
            }}
          />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '12px 16px', fontWeight: 600, fontSize: 14 }}>Vorschläge für dich</div>
        <div
          style={{
            padding: '0 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 8,
            marginBottom: 16,
          }}
        >
          {SUGGESTED_TAGS.map((tag) => (
            <div
              key={tag}
              style={{
                aspectRatio: '1/1',
                background: COLORS.igGradient,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 600,
                fontSize: 16,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} />
              <span style={{ position: 'relative' }}>{tag}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 16px', fontWeight: 600, fontSize: 14 }}>Personen, die du vielleicht kennen möchtest</div>
        {SUGGESTED_PEOPLE.map((p) => (
          <div key={p.name} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar emoji={p.avatar} img={p.img} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
              <div style={{ color: COLORS.muted, fontSize: 12 }}>{p.followers} Follower</div>
            </div>
            <button
              style={{
                backgroundColor: '#0095f6',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Folgen
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileScreen() {
  const [tab, setTab] = useState<'posts' | 'reels'>('posts');
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: COLORS.bg }}>
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${COLORS.border}`,
          fontWeight: 'bold',
          fontSize: 18,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {PROFILE.username}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Avatar emoji="🐱" img={PROFILE.avatarImg} size={80} />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{PROFILE.posts}</div>
              <div style={{ fontSize: 12 }}>Beiträge</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{PROFILE.followers.toLocaleString('de-DE')}</div>
              <div style={{ fontSize: 12 }}>Follower</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{PROFILE.following}</div>
              <div style={{ fontSize: 12 }}>Gefolgt</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{PROFILE.displayName}</div>
            <div style={{ fontSize: 13, color: COLORS.text, marginTop: 2, whiteSpace: 'pre-line' }}>
              {PROFILE.bio}
            </div>
            <a
              href={`https://${PROFILE.website}`}
              onClick={(e) => e.preventDefault()}
              style={{ fontSize: 13, color: '#00376b', fontWeight: 600, marginTop: 4, display: 'inline-block' }}
            >
              {PROFILE.website}
            </a>
          </div>
          <CollectClueButton clueId="lumigram:cats" />
        </div>
        <div style={{ padding: '0 16px', display: 'flex', gap: 8 }}>
          <button
            style={{
              flex: 1,
              backgroundColor: '#efefef',
              border: 'none',
              borderRadius: 8,
              padding: 8,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Profil teilen
          </button>
          <button
            style={{
              flex: 1,
              backgroundColor: '#efefef',
              border: 'none',
              borderRadius: 8,
              padding: 8,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Profil bearbeiten
          </button>
        </div>
        <div style={{ display: 'flex', borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, marginTop: 16 }}>
          <div
            onClick={() => setTab('posts')}
            style={{
              flex: 1,
              padding: 12,
              textAlign: 'center',
              cursor: 'pointer',
              borderTop: tab === 'posts' ? '2px solid #262626' : '2px solid transparent',
            }}
          >
            <span style={{ fontSize: 18 }}>📷</span>
          </div>
          <div
            onClick={() => setTab('reels')}
            style={{
              flex: 1,
              padding: 12,
              textAlign: 'center',
              cursor: 'pointer',
              borderTop: tab === 'reels' ? '2px solid #262626' : '2px solid transparent',
              color: COLORS.text,
            }}
          >
            <Film size={20} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {(tab === 'posts' ? PROFILE_POSTS : PROFILE_REELS).map((item) => (
            <div
              key={item.id}
              onClick={() => tab === 'posts' && navigate(`/lumigram/post/${item.id}`)}
              style={{
                aspectRatio: '1/1',
                background: item.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 28,
                position: 'relative',
                overflow: 'hidden',
                cursor: tab === 'posts' ? 'pointer' : 'default',
              }}
            >
              {tab === 'posts' && (item as typeof PROFILE_POSTS[number]).img ? (
                <img
                  src={(item as typeof PROFILE_POSTS[number]).img}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : tab === 'posts' ? (
                (item as typeof PROFILE_POSTS[number]).icon
              ) : (
                <span style={{ fontSize: 24 }}>▶</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BottomNav() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTop: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.bg,
        padding: '10px 0',
        flexShrink: 0,
      }}
    >
      <NavLink to="/lumigram" end style={({ isActive }) => ({ color: isActive ? COLORS.text : COLORS.muted, display: 'flex' })}>
        {({ isActive }) => <Home size={26} strokeWidth={isActive ? 2.2 : 1.6} />}
      </NavLink>
      <NavLink to="/lumigram/reals" style={({ isActive }) => ({ color: isActive ? COLORS.text : COLORS.muted, display: 'flex' })}>
        {({ isActive }) => <Film size={26} strokeWidth={isActive ? 2.2 : 1.6} />}
      </NavLink>
      <NavLink to="/lumigram/messages" style={({ isActive }) => ({ color: isActive ? COLORS.text : COLORS.muted, display: 'flex' })}>
        {({ isActive }) => <MessageCircle size={26} strokeWidth={isActive ? 2.2 : 1.6} />}
      </NavLink>
      <NavLink to="/lumigram/search" style={({ isActive }) => ({ color: isActive ? COLORS.text : COLORS.muted, display: 'flex' })}>
        {({ isActive }) => <SearchIcon size={26} strokeWidth={isActive ? 2.2 : 1.6} />}
      </NavLink>
      <NavLink to="/lumigram/profile" style={{ display: 'flex' }}>
        {({ isActive }) => (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: COLORS.igGradient,
              padding: 2,
              boxSizing: 'border-box',
              border: isActive ? '2px solid #262626' : '2px solid transparent',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                overflow: 'hidden',
              }}
            >
              {PROFILE.avatarImg ? (
                <img
                  src={PROFILE.avatarImg}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                '🐱'
              )}
            </div>
          </div>
        )}
      </NavLink>
    </div>
  );
}

function ChatRoute({ chats, onSend }: { chats: Chat[]; onSend: (chatId: number, text: string) => void }) {
  const navigate = useNavigate();
  const match = useLocation().pathname.match(/^\/lumigram\/messages\/(\d+)$/);
  const id = match ? Number(match[1]) : null;
  const chat = id !== null ? chats.find((c) => c.id === id) : undefined;
  if (!chat) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <span style={{ color: COLORS.muted }}>Chat nicht gefunden</span>
      </div>
    );
  }
  return (
    <ChatDetail
      chat={chat}
      onBack={() => navigate('/lumigram/messages')}
      onSend={(text) => onSend(chat.id, text)}
    />
  );
}

const CHATS_STORAGE_KEY = 'lumigram-chats-v2';

function loadChats(): Chat[] {
  try {
    const stored = localStorage.getItem(CHATS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const storedIds = new Set(parsed.map((c: Chat) => c.id));
        const newChats = CHATS.filter((c) => !storedIds.has(c.id));
        return [...parsed, ...newChats];
      }
    }
  } catch {
    // ignore parse / storage errors
  }
  return CHATS;
}

function saveChats(chats: Chat[]) {
  try {
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
  } catch {
    // ignore quota / private mode errors
  }
}

export default function LumigramApp() {
  const [chats, setChats] = useState<Chat[]>(() => loadChats());
  const location = useLocation();
  const match = location.pathname.match(/^\/lumigram\/messages\/(\d+)$/);

  useEffect(() => {
    saveChats(chats);
  }, [chats]);
  const openChatId = match ? Number(match[1]) : null;

  useEffect(() => {
    if (openChatId === null) return;
    setChats((prev) => prev.map((c) => (c.id === openChatId ? { ...c, unread: 0 } : c)));
  }, [openChatId]);

  const handleSend = (chatId: number, text: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [...c.messages, { id: Date.now(), fromMe: true, text, time: 'jetzt' }],
            }
          : c,
      ),
    );
  };

  const isStoryRoute = location.pathname.startsWith('/lumigram/story/');
  const isPostDetailRoute = /^\/lumigram\/post\/\d+$/.test(location.pathname);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/reals" element={<ReelsScreen />} />
          <Route path="/messages" element={<MessagesScreen chats={chats} />} />
          <Route path="/messages/:id" element={<ChatRoute chats={chats} onSend={handleSend} />} />
          <Route path="/search" element={<SearchScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/user/:userName" element={<UserProfileScreen />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route path="/story/:storyId" element={<StoryViewer key={location.pathname} />} />
        </Routes>
      </div>
      {!isStoryRoute && !isPostDetailRoute && <BottomNav />}
    </div>
  );
}
