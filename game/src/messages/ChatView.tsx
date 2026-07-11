import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Phone, Video, MoreVertical } from 'lucide-react';
import { SENDER_META, type SmsCategory } from './data';
import { useMessagesStore } from './store';

export default function ChatView() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const category = categoryId as SmsCategory;
  const meta = SENDER_META[category];

  const { smsList, markAsRead, sendMessage } = useMessagesStore();

  // Filter messages for this category and sort chronologically
  const messages = React.useMemo(() => {
    return smsList
      .filter(m => m.category === category)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [smsList, category]);

  // Mark all messages in this category as read when entering the chat
  useEffect(() => {
    if (category) {
      markAsRead(category);
    }
  }, [category, markAsRead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!meta) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#5F6368' }}>
        Chat nicht gefunden.
        <button
          onClick={() => navigate('/messages')}
          style={{
            display: 'block', margin: '20px auto', padding: '8px 16px',
            backgroundColor: '#1A73E8', color: '#fff', border: 'none',
            borderRadius: 8, cursor: 'pointer'
          }}
        >
          Zurück
        </button>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(category, text.trim());
    setText('');
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <header
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 16px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #E8EAED',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          zIndex: 10
        }}
      >
        <button
          onClick={() => navigate('/messages')}
          style={{
            background: 'none', border: 'none', padding: 4, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#1A73E8', borderRadius: '50%'
          }}
          aria-label="Zurück"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Avatar */}
        <div
          style={{
            width: 38, height: 38, borderRadius: '50%',
            backgroundColor: meta.color, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 600, flexShrink: 0
          }}
        >
          {meta.initial}
        </div>

        {/* Contact Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#202124', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {meta.name}
          </div>
          <div style={{ fontSize: 11, color: '#80868B' }}>Online</div>
        </div>

        {/* Deko Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#5F6368' }}>
          <button style={{ background: 'none', border: 'none', padding: 4, color: 'inherit', cursor: 'pointer' }}>
            <Phone size={20} />
          </button>
          <button style={{ background: 'none', border: 'none', padding: 4, color: 'inherit', cursor: 'pointer' }}>
            <Video size={20} />
          </button>
          <button style={{ background: 'none', border: 'none', padding: 4, color: 'inherit', cursor: 'pointer' }}>
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Message Feed */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        {messages.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#80868B', fontSize: 14 }}>
            Keine Nachrichten in diesem Chat.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === 'me';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  {/* Bubble */}
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                      backgroundColor: isMe ? '#1A73E8' : '#fff',
                      color: isMe ? '#fff' : '#202124',
                      fontSize: 14,
                      lineHeight: '1.4',
                      boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                      wordBreak: 'break-word'
                    }}
                  >
                    {msg.body}
                  </div>
                  {/* Timestamp */}
                  <span style={{ fontSize: 10, color: '#80868B', marginTop: 4, paddingHorizontal: 4 }}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '12px 16px',
          backgroundColor: '#fff',
          borderTop: '1px solid #E8EAED',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="SMS-Nachricht"
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 24,
            border: '1px solid #DADCE0',
            backgroundColor: '#F8F9FA',
            fontSize: 14,
            color: '#202124',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: text.trim() ? '#1A73E8' : '#F1F3F4',
            color: text.trim() ? '#fff' : '#9AA0A6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: text.trim() ? 'pointer' : 'default',
            transition: 'background-color 0.2s',
            flexShrink: 0
          }}
        >
          <Send size={16} style={{ marginLeft: text.trim() ? 2 : 0 }} />
        </button>
      </form>
    </div>
  );
}
