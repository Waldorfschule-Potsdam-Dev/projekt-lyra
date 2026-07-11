import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Inbox as InboxIcon, Send, AlertOctagon, PenSquare, ChevronDown, Briefcase, User2, type LucideIcon } from 'lucide-react';
import { ym } from './styles';
import { useEmails, inFolder, sortedByDate } from './store';
import { useProfile, useMailbox, setMailbox, getActiveMailbox, MAILBOXES } from './profile';
import { findAccount } from './seed';
import type { Email, Folder } from './types';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const pad = (n: number) => String(n).padStart(2, '0');

const formatStamp = (ts: number) => {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const diff = now.getTime() - ts;
  if (diff < 7 * DAY) {
    return d.toLocaleDateString('de-DE', { weekday: 'short' });
  }
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
};

const TABS: { id: Folder; label: string; icon: LucideIcon }[] = [
  { id: 'inbox', label: 'Posteingang', icon: InboxIcon },
  { id: 'sent', label: 'Gesendet', icon: Send },
  { id: 'spam', label: 'Spam', icon: AlertOctagon },
];

const Avatar = ({ name, color, size = 40 }: { name: string; color: string; size?: number }) => (
  <div
    style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, fontWeight: 600, flexShrink: 0,
    }}
  >
    {name.charAt(0).toUpperCase()}
  </div>
);

const preview = (s: string) => s.replace(/\s+/g, ' ').slice(0, 90);

export default function Inbox() {
  const navigate = useNavigate();
  const all = useEmails();
  const profile = useProfile();
  const mailboxId = useMailbox();
  const activeMailbox = getActiveMailbox();
  const [tab, setTab] = useState<Folder>('inbox');
  const [query, setQuery] = useState('');
  const [mailboxOpen, setMailboxOpen] = useState(false);

  const list = useMemo(() => {
    let l = all.filter(e => e.mailboxId === activeMailbox.id);
    l = inFolder(l, tab);
    if (query.trim()) {
      const q = query.toLowerCase();
      l = l.filter(e => {
        const acc = findAccount(tab === 'sent' ? e.toId : e.fromId);
        return e.subject.toLowerCase().includes(q)
          || e.body.toLowerCase().includes(q)
          || acc.name.toLowerCase().includes(q)
          || acc.email.toLowerCase().includes(q);
      });
    }
    return sortedByDate(l);
  }, [all, tab, query, activeMailbox.id]);

  const counts = useMemo(() => {
    const inMailbox = all.filter(e => e.mailboxId === activeMailbox.id);
    return {
      inbox: inFolder(inMailbox, 'inbox').filter(e => !e.read).length,
      sent: inFolder(inMailbox, 'sent').length,
      spam: inFolder(inMailbox, 'spam').filter(e => !e.read).length,
    };
  }, [all, activeMailbox.id]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: ym.bg }}>
      <header
        style={{
          background: ym.red, color: '#fff',
          paddingTop: 12, paddingBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: ym.white }}>YMail</h1>
            <button
              onClick={() => setMailboxOpen(v => !v)}
              style={{
                background: 'transparent', border: 'none', padding: 0, marginTop: 2,
                display: 'inline-flex', alignItems: 'center', gap: 4,
                color: ym.white, fontSize: 12, cursor: 'pointer', opacity: 0.92,
                maxWidth: '100%',
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeMailbox.label} · {activeMailbox.email}
              </span>
              <ChevronDown size={12} color={ym.white} style={{ flexShrink: 0 }} />
            </button>
          </div>
          <Link to="/mail/compose" style={{ color: ym.white, textDecoration: 'none' }} aria-label="Neue E-Mail">
            <Search size={20} color={ym.white} />
          </Link>
          <div style={{ width: 8 }} />
          <Link
            to="/mail/profile"
            aria-label="Profil öffnen"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: ym.surface, color: ym.text,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 700,
              textDecoration: 'none',
              border: `2px solid ${profile.color}`,
            }}
          >
            {profile.name.trim().charAt(0).toUpperCase() || '?'}
          </Link>
        </div>

        {mailboxOpen && (
          <div
            onClick={() => setMailboxOpen(false)}
            style={{ position: 'absolute', inset: 0, zIndex: 40 }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', top: 64, left: 12, right: 12,
                background: ym.surfaceElevated,
                border: `1px solid ${ym.border}`,
                borderRadius: 12, padding: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: ym.textMuted, padding: '6px 10px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Postfach wechseln
              </div>
              {MAILBOXES.map(mb => {
                const active = mb.id === mailboxId;
                return (
                  <button
                    key={mb.id}
                    onClick={() => { setMailbox(mb.id); setMailboxOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '10px 12px',
                      background: active ? ym.surface : 'transparent',
                      border: 'none', borderRadius: 8,
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: mb.color, color: ym.white,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {mb.id === 'work' ? <Briefcase size={16} color={ym.white} /> : <User2 size={16} color={ym.white} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: ym.text }}>{mb.label}</div>
                      <div style={{
                        fontSize: 12, color: ym.textMuted,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{mb.email}</div>
                    </div>
                    {active && (
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: mb.color, color: ym.white,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: 11, fontWeight: 700,
                      }}>✓</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ padding: '0 12px' }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.18)', borderRadius: 8,
              padding: '6px 10px',
            }}
          >
            <Search size={16} color="#fff" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="In Mails suchen…"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', fontSize: 14,
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', marginTop: 8 }}>
          {TABS.map(t => {
            const active = tab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  color: '#fff', padding: '10px 4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  cursor: 'pointer', position: 'relative',
                  opacity: active ? 1 : 0.75,
                }}
              >
                <Icon size={14} />
                <span>{t.label}</span>
                {t.id === 'inbox' && counts.inbox > 0 && (
                  <span style={{ background: '#fff', color: ym.red, borderRadius: 10, padding: '0 6px', fontSize: 11, fontWeight: 700 }}>{counts.inbox}</span>
                )}
                {t.id === 'spam' && counts.spam > 0 && (
                  <span style={{ background: '#fff', color: ym.red, borderRadius: 10, padding: '0 6px', fontSize: 11, fontWeight: 700 }}>{counts.spam}</span>
                )}
                {active && (
                  <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 3, background: '#fff', borderRadius: 2 }} />
                )}
              </button>
            );
          })}
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {list.length === 0 ? (
          <Empty folder={tab} mailboxId={activeMailbox.id} />
        ) : (
          list.map(e => <EmailRow key={e.id} email={e} tab={tab} navigate={navigate} />)
        )}
      </div>

      <Link
        to="/mail/compose"
        style={{
          position: 'absolute', right: 20, bottom: 20,
          background: ym.red, color: '#fff',
          width: 56, height: 56, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
        aria-label="Neue E-Mail"
      >
        <PenSquare size={24} />
      </Link>
    </div>
  );
}

const EmailRow = ({ email, tab, navigate }: { email: Email; tab: Folder; navigate: ReturnType<typeof useNavigate> }) => {
  const counterpartId = tab === 'sent' ? email.toId : email.fromId;
  const isAd = !!email.isAd;
  const realAcc = isAd ? null : findAccount(counterpartId);
  const fallbackAcc = { name: email.fromId, color: '#9AA0A6' };
  const isSent = tab === 'sent';
  const acc = isSent && realAcc ? realAcc : (realAcc ?? fallbackAcc);
  const headerLine = isSent ? `An: ${realAcc!.email}` : acc.name;
  const subLine = isSent ? acc.name : null;
  const senderColor = isSent ? ym.textMuted : acc.color;

  return (
    <div
      onClick={() => navigate(`/mail/${email.id}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        background: ym.surface,
        borderBottom: `1px solid ${ym.border}`,
        cursor: 'pointer',
      }}
    >
      <div style={{ position: 'relative' }}>
        <Avatar name={acc.name} color={senderColor} />
        {!email.read && (
          <div style={{ position: 'absolute', left: -8, top: 18, width: 8, height: 8, borderRadius: '50%', background: ym.unreadDot }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            flex: 1, fontSize: 15,
            fontWeight: email.read ? 400 : 700,
            color: ym.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {headerLine}
          </div>
          <div style={{ fontSize: 12, color: ym.textMuted, flexShrink: 0 }}>
            {formatStamp(email.timestamp)}
          </div>
        </div>
        {subLine && (
          <div style={{
            fontSize: 12, color: ym.textMuted,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginTop: -2, marginBottom: 2,
          }}>
            {subLine}
          </div>
        )}
        <div style={{
          fontSize: 14,
          fontWeight: email.read ? 400 : 600,
          color: ym.text,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {email.subject}
        </div>
        <div style={{
          fontSize: 13, color: ym.textMuted,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {preview(email.body)}
        </div>
      </div>
    </div>
  );
};

const Empty = ({ folder, mailboxId }: { folder: Folder; mailboxId: string }) => {
  const isWork = mailboxId === 'work';
  const labels: Record<Folder, { title: string; sub: string }> = {
    inbox: {
      title: 'Keine neuen Mails',
      sub: isWork ? 'Im Berufspostfach ist gerade nichts eingegangen.' : 'Du bist auf dem Laufenden.',
    },
    sent: { title: 'Noch nichts gesendet', sub: 'Schreibe deine erste Mail mit dem Stift unten rechts.' },
    spam: {
      title: 'Kein Spam',
      sub: isWork
        ? 'Im Berufspostfach wird keine Werbung eingesammelt.'
        : 'Werbung kommt hier automatisch alle 10 Minuten.',
    },
  };
  const l = labels[folder];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: ym.textMuted, textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: ym.text, marginBottom: 8 }}>{l.title}</div>
      <div style={{ fontSize: 14 }}>{l.sub}</div>
    </div>
  );
};
