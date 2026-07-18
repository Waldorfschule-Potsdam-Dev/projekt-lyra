import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import {
  type SentShare, type ChatGroup, SHARE_TARGETS, getAllSent, groupChats, formatChatTime, isSameDay
} from '../data';

export function MessageBubble({
  message,
  url,
  time,
}: {
  message: SentShare;
  url?: string;
  time: string;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div
        style={{
          maxWidth: '78%',
          backgroundColor: '#ffffff',
          borderRadius: '12px 12px 4px 12px',
          overflow: 'hidden',
          boxShadow: '0 1px 1px rgba(0,0,0,0.08)',
        }}
      >
        {url && (
          <img
            src={url}
            alt=""
            style={{
              display: 'block',
              maxWidth: '100%',
              maxHeight: 240,
              objectFit: 'cover',
            }}
          />
        )}
        {message.caption && (
          <div
            style={{
              padding: '8px 12px 2px',
              fontSize: 14,
              color: '#202124',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {message.caption}
          </div>
        )}
        <div
          style={{
            padding: '4px 12px 6px',
            fontSize: 11,
            color: '#5f6368',
            textAlign: 'right',
          }}
        >
          {time}
        </div>
      </div>
    </div>
  );
}

export function SentHistory() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const createdUrls: string[] = [];
    (async () => {
      const all = await getAllSent();
      if (cancelled) return;
      const g = groupChats(all);
      if (cancelled) return;
      setGroups(g);
      const next: Record<string, string> = {};
      for (const chat of g) {
        const last = chat.messages.reduce((acc, m) =>
          m.sentAt > acc.sentAt ? m : acc,
        );
        if (last && !next[last.id]) {
          const url = last.photoUrl || (last.photoBlob ? URL.createObjectURL(last.photoBlob) : '');
          next[last.id] = url;
          if (!last.photoUrl && url) createdUrls.push(url);
        }
      }
      if (cancelled) return;
      setThumbs(next);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
      createdUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
          color: '#5f6368',
          fontSize: 14,
        }}
      >
        Lade Verlauf …
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fafafa',
      }}
    >
      <header
        style={{
          padding: '40px 12px 12px 8px',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid #ececec',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Zurück"
          style={{
            width: 40,
            height: 40,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={24} color="#202124" />
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: '#202124' }}>
          Geteilt
        </h1>
        <span style={{ fontSize: 13, color: '#5f6368', marginLeft: 4 }}>
          {groups.length === 0
            ? ''
            : `${groups.length} ${groups.length === 1 ? 'Chat' : 'Chats'}`}
        </span>
      </header>
      {groups.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            color: '#5f6368',
            gap: 12,
            textAlign: 'center',
          }}
        >
          <ImageIcon size={56} strokeWidth={1.2} color="#dadce0" />
          <div style={{ fontSize: 16, fontWeight: 500, color: '#202124' }}>
            Noch nichts geteilt
          </div>
          <div style={{ fontSize: 13, color: '#5f6368' }}>
            Wenn du Bilder teilst, erscheinen sie hier im Chat-Verlauf.
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {groups.map((g) => {
            const target = SHARE_TARGETS.find((t) => t.id === g.app);
            const thumb = thumbs[g.lastMessageId];
            return (
              <button
                key={g.key}
                onClick={() =>
                  navigate(`/photos/history/${encodeURIComponent(g.key)}`)
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#fff',
                  border: 'none',
                  borderBottom: '1px solid #f1f3f4',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      backgroundColor: g.contact?.color ?? '#5f6368',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 600,
                    }}
                  >
                    {g.contact?.initial ?? '?'}
                  </div>
                  {target && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: target.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #fff',
                      }}
                    >
                      <target.icon size={10} color="#fff" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: '#202124',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {g.recipientName}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#5f6368',
                        marginLeft: 8,
                        flexShrink: 0,
                      }}
                    >
                      {formatChatTime(g.lastAt)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginTop: 2,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        color: '#5f6368',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1,
                      }}
                    >
                      {g.lastCaption}
                    </div>
                    {thumb && (
                      <img
                        src={thumb}
                        alt=""
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 6,
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SentChatDetail() {
  const { chatKey } = useParams<{ chatKey: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<ChatGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!chatKey) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const createdUrls: string[] = [];
    (async () => {
      const all = await getAllSent();
      if (cancelled) return;
      const g = groupChats(all);
      const found = g.find(
        (c) => c.key === decodeURIComponent(chatKey),
      );
      if (cancelled) return;
      if (!found) {
        setGroup(null);
        setLoading(false);
        return;
      }
      setGroup(found);
      const next: Record<string, string> = {};
      for (const msg of found.messages) {
        const url = msg.photoUrl || (msg.photoBlob ? URL.createObjectURL(msg.photoBlob) : '');
        next[msg.id] = url;
        if (!msg.photoUrl && url) createdUrls.push(url);
      }
      if (cancelled) return;
      setUrls(next);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
      createdUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [chatKey]);

  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ece5dd',
          color: '#5f6368',
        }}
      >
        Lade …
      </div>
    );
  }

  if (!group) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ece5dd',
        }}
      >
        <header
          style={{
            backgroundColor: '#5f6368',
            padding: '40px 4px 12px',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => navigate('/photos/history')}
            aria-label="Zurück"
            style={{
              width: 40,
              height: 40,
              margin: '0 12px',
              background: 'rgba(255,255,255,0.18)',
              border: 'none',
              borderRadius: '50%',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>Chat</span>
        </header>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5f6368',
          }}
        >
          Chat nicht gefunden.
        </div>
      </div>
    );
  }

  const target = SHARE_TARGETS.find((t) => t.id === group.app);
  const headerColor = target?.color ?? '#5f6368';
  const sortedMessages = [...group.messages].sort((a, b) => a.sentAt - b.sentAt);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ece5dd',
        position: 'relative',
      }}
    >
      <header
        style={{
          backgroundColor: headerColor,
          padding: '40px 4px 12px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          zIndex: 2,
        }}
      >
        <button
          onClick={() => navigate('/photos/history')}
          aria-label="Zurück"
          style={{
            width: 40,
            height: 40,
            margin: '0 12px',
            background: 'rgba(255,255,255,0.18)',
            border: 'none',
            borderRadius: '50%',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={24} />
        </button>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: group.contact?.color ?? '#5f6368',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 600,
            marginRight: 10,
            flexShrink: 0,
          }}
        >
          {group.contact?.initial ?? '?'}
        </div>
        <div style={{ flex: 1, color: '#fff', minWidth: 0 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {group.recipientName}
          </div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>
            {sortedMessages.length}{' '}
            {sortedMessages.length === 1 ? 'Nachricht' : 'Nachrichten'} ·{' '}
            über {target?.name ?? 'Messenger'}
          </div>
        </div>
      </header>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {sortedMessages.map((m, idx) => {
          const prev = sortedMessages[idx - 1];
          const showDateSeparator =
            !prev || !isSameDay(prev.sentAt, m.sentAt);
          return (
            <div key={m.id}>
              {showDateSeparator && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '8px 0',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: '#5f6368',
                      backgroundColor: 'rgba(255,255,255,0.85)',
                      padding: '4px 10px',
                      borderRadius: 10,
                    }}
                  >
                    {new Date(m.sentAt).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
              <MessageBubble
                message={m}
                url={urls[m.id]}
                time={formatChatTime(m.sentAt)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
