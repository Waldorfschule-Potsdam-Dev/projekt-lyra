import { useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Bell,
  Newspaper,
  Headphones,
  Sparkles,
  Pencil,
  Eye,
  Clock,
  Flame,
  Check,
  X
} from 'lucide-react';
import type { Article, NotificationSettings, Stats } from './data';
import { allTopics, weekDays } from './data';

export default function AccountScreen({
  bookmarks,
  onSelect,
  onRemove,
  enabledTopics,
  onToggleTopic,
  notifications,
  onToggleNotification,
  stats,
  onBack,
}: {
  bookmarks: Article[];
  onSelect: (a: Article) => void;
  onRemove: (id: number) => void;
  enabledTopics: Set<string>;
  onToggleTopic: (id: string) => void;
  notifications: NotificationSettings;
  onToggleNotification: (key: keyof NotificationSettings) => void;
  stats: Stats;
  onBack: () => void;
}) {
  const [name, setName] = useState('Daniel Seidt');
  const [email, setEmail] = useState('danielseidt@wab.de');
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [draftEmail, setDraftEmail] = useState(email);

  const startEdit = () => {
    setDraftName(name);
    setDraftEmail(email);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const saveEdit = () => {
    const trimmedName = draftName.trim();
    const trimmedEmail = draftEmail.trim();
    if (trimmedName) setName(trimmedName);
    if (trimmedEmail) setEmail(trimmedEmail);
    setEditing(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#0F0F10',
    border: '1px solid #2A2A2E',
    borderRadius: 8,
    color: '#fff',
    fontSize: 14,
    padding: '10px 12px',
    font: 'inherit',
    outline: 'none',
  };

  return (
    <div style={{ padding: '8px 16px 24px' }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          padding: '8px 0 14px',
        }}
      >
        <button
          onClick={onBack}
          aria-label="Zurück"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#1A1A1C',
            border: '1px solid #232327',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={20} strokeWidth={2} color="#fff" />
        </button>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 17,
            fontWeight: 700,
            color: '#fff',
            pointerEvents: 'none',
          }}
        >
          Mein Konto
        </div>
      </div>
      <div style={{ marginTop: 4 }}>
        <SectionHeader label="Merkliste" hint={`${bookmarks.length} Artikel`} />
      </div>

      {bookmarks.length === 0 ? (
        <div
          style={{
            marginTop: 12,
            padding: '32px 16px',
            textAlign: 'center',
            color: '#8A8A92',
            fontSize: 13,
            lineHeight: 1.5,
            backgroundColor: '#141416',
            border: '1px dashed #2A2A2E',
            borderRadius: 12,
          }}
        >
          Du hast noch keine Artikel gemerkt.
          <br />
          Tippe im Artikel auf das Lesezeichen, um ihn hier zu speichern.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          {bookmarks.map((a) => {
            const TopicIcon = a.Icon;
            return (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  backgroundColor: '#1A1A1C',
                  border: '1px solid #232327',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => onSelect(a)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'inherit',
                    font: 'inherit',
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 10,
                      background: a.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <TopicIcon size={22} strokeWidth={1.4} color="rgba(255,255,255,0.9)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#E53935',
                        textTransform: 'uppercase',
                        letterSpacing: 0.4,
                      }}
                    >
                      {a.topic}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#fff',
                        marginTop: 2,
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {a.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#8A8A92', marginTop: 4 }}>{a.time}</div>
                  </div>
                </button>
                <button
                  onClick={() => onRemove(a.id)}
                  aria-label="Aus Merkliste entfernen"
                  style={{
                    width: 44,
                    background: 'transparent',
                    border: 'none',
                    borderLeft: '1px solid #232327',
                    color: '#8A8A92',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Bookmark size={18} strokeWidth={2} color="#FF6B35" fill="#FF6B35" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          backgroundColor: '#1A1A1C',
          border: '1px solid #232327',
          borderRadius: 16,
          padding: 20,
          marginTop: 20,  
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF6B35 0%, #E53935 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 0.5,
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(255,107,53,0.25)',
            }}
            aria-hidden
          >
            DS
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <div style={{ fontSize: 11, color: '#8A8A92', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Profil bearbeiten
              </div>
            ) : (
              <>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{name}</div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#8A8A92',
                    marginTop: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {email}
                </div>
              </>
            )}
          </div>
          {!editing && (
            <button
              onClick={startEdit}
              aria-label="Profil bearbeiten"
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'transparent',
                border: '1px solid #2A2A2E',
                color: '#D8D8DE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <Pencil size={16} strokeWidth={1.8} color="#D8D8DE" />
            </button>
          )}
        </div>

        {editing && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: '#8A8A92',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginBottom: 6,
                }}
              >
                Name
              </div>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Dein Name"
                style={inputStyle}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: '#8A8A92',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginBottom: 6,
                }}
              >
                E-Mail
              </div>
              <input
                type="email"
                value={draftEmail}
                onChange={(e) => setDraftEmail(e.target.value)}
                placeholder="name@beispiel.de"
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                onClick={saveEdit}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px 12px',
                  borderRadius: 10,
                  backgroundColor: '#FF6B35',
                  color: '#fff',
                  border: 'none',
                  font: 'inherit',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Check size={16} strokeWidth={2.2} color="#fff" />
                Speichern
              </button>
              <button
                onClick={cancelEdit}
                aria-label="Abbrechen"
                style={{
                  width: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 10,
                  backgroundColor: 'transparent',
                  color: '#D8D8DE',
                  border: '1px solid #2A2A2E',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <X size={18} strokeWidth={2} color="#D8D8DE" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 24,
          backgroundColor: '#1A1A1C',
          border: '1px solid #232327',
          borderRadius: 16,
          padding: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={14} strokeWidth={2} color="#FF6B35" />
          <SectionHeader label="Deine Statistik" />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginTop: 14,
          }}
        >
          {[
            { Icon: Eye, value: stats.articlesRead, label: 'Artikel' },
            { Icon: Clock, value: `${stats.minutesRead}m`, label: 'Lesezeit' },
            { Icon: Flame, value: stats.streak, label: 'Tage-Serie', accent: true },
          ].map((s) => {
            const Icon = s.Icon;
            return (
              <div
                key={s.label}
                style={{
                  backgroundColor: '#0F0F10',
                  border: '1px solid #232327',
                  borderRadius: 12,
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  textAlign: 'center',
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={1.8}
                  color={s.accent ? '#FF6B35' : '#8A8A92'}
                />
                <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 10, color: '#8A8A92', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        <WeeklyChart data={stats.weekly} />
      </div>

      <div style={{ marginTop: 24 }}>
        <SectionHeader label="Deine Themen" hint={`${enabledTopics.size}/${allTopics.length}`} />
      </div>
      <div
        style={{
          marginTop: 12,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {allTopics.map((t) => {
          const on = enabledTopics.has(t.id);
          const TopicIcon = t.Icon;
          return (
            <button
              key={t.id}
              onClick={() => onToggleTopic(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 999,
                backgroundColor: on ? '#FF6B35' : 'transparent',
                color: on ? '#fff' : '#D8D8DE',
                border: on ? '1px solid #FF6B35' : '1px solid #2A2A2E',
                font: 'inherit',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            >
              <TopicIcon
                size={14}
                strokeWidth={2}
                color={on ? '#fff' : '#8A8A92'}
              />
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        <SectionHeader label="Benachrichtigungen" />
      </div>
      <div
        style={{
          marginTop: 12,
          backgroundColor: '#1A1A1C',
          border: '1px solid #232327',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {[
          { key: 'breaking', label: 'Eilmeldungen', hint: 'Wichtige News sofort pushen', Icon: Bell },
          { key: 'daily', label: 'Tägliche Zusammenfassung', hint: 'Morgens um 7 Uhr die Top-Themen', Icon: Newspaper },
          { key: 'audio', label: 'Audio-Empfehlungen', hint: 'Vorgeschlagene Nachrichten zum Hören', Icon: Headphones },
          { key: 'topics', label: 'Themen-Alerts', hint: 'Updates zu meinen Themen', Icon: Sparkles },
        ].map((row, i, arr) => {
          const Icon = row.Icon;
          const on = notifications[row.key as keyof NotificationSettings];
          return (
            <div
              key={row.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderBottom: i < arr.length - 1 ? '1px solid #232327' : 'none',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: '#0F0F10',
                  border: '1px solid #232327',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={16} strokeWidth={1.8} color="#FF6B35" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{row.label}</div>
                <div style={{ fontSize: 11, color: '#8A8A92', marginTop: 2 }}>{row.hint}</div>
              </div>
              <Toggle on={on} onChange={() => onToggleNotification(row.key as keyof NotificationSettings)} />
            </div>
          );
        })}
      </div>

    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onChange}
      style={{
        width: 42,
        height: 24,
        borderRadius: 12,
        backgroundColor: on ? '#FF6B35' : '#2A2A2E',
        border: 'none',
        padding: 2,
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.15s ease',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          display: 'block',
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: '#fff',
          transform: on ? 'translateX(18px)' : 'translateX(0)',
          transition: 'transform 0.15s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}

function SectionHeader({ label, hint }: { label: string; hint?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        paddingBottom: 10,
        borderBottom: '1px solid #232327',
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: '#FF6B35',
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      {hint && <div style={{ fontSize: 12, color: '#8A8A92' }}>{hint}</div>}
    </div>
  );
}

function WeeklyChart({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${data.length}, 1fr)`,
        gap: 6,
        alignItems: 'end',
        height: 64,
        marginTop: 14,
      }}
    >
      {data.map((v, i) => {
        const heightPct = (v / max) * 100;
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: '100%',
                height: `${Math.max(8, heightPct)}%`,
                backgroundColor: i === data.length - 1 ? '#FF6B35' : '#3A3A40',
                borderRadius: 4,
                transition: 'height 0.2s ease',
              }}
            />
            <div style={{ fontSize: 10, color: '#8A8A92', fontWeight: 500 }}>{weekDays[i]}</div>
          </div>
        );
      })}
    </div>
  );
}
