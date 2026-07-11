import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SENDER_META, type SmsCategory } from './data';
import { useMessagesStore, type ExtendedSms } from './store';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const pad = (n: number) => String(n).padStart(2, '0');

const formatStamp = (ts: number) => {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  const diff = now.getTime() - ts;
  if (diff < 7 * DAY) {
    return d.toLocaleDateString('de-DE', { weekday: 'short' });
  }
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
};

const Avatar = ({ initial, color, size = 44 }: { initial: string; color: string; size?: number }) => (
  <div
    style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, fontWeight: 600, flexShrink: 0,
    }}
  >
    {initial}
  </div>
);

interface ThreadSummary {
  category: SmsCategory;
  messages: ExtendedSms[];
  latest: ExtendedSms;
  hasUnread: boolean;
}

export default function SmsList() {
  const [query, setQuery] = useState('');
  const { smsList } = useMessagesStore();

  const list = useMemo(() => {
    // 1. Group by category
    const grouped: Record<string, ExtendedSms[]> = {};
    smsList.forEach(sms => {
      if (!grouped[sms.category]) {
        grouped[sms.category] = [];
      }
      grouped[sms.category].push(sms);
    });

    // 2. Create thread summaries
    const threadSummaries = Object.keys(grouped).map(catKey => {
      const cat = catKey as SmsCategory;
      const msgs = [...grouped[cat]].sort((a, b) => b.timestamp - a.timestamp);
      const latest = msgs[0];
      const hasUnread = msgs.some(m => !m.read);
      return {
        category: cat,
        messages: msgs,
        latest,
        hasUnread
      };
    });

    // 3. Filter by search query
    let filtered = threadSummaries;
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(t => {
        const metaName = SENDER_META[t.category]?.name.toLowerCase() || '';
        const matchesName = metaName.includes(q);
        const matchesBody = t.messages.some(m => m.body.toLowerCase().includes(q));
        return matchesName || matchesBody;
      });
    }

    // 4. Sort by latest message timestamp descending
    return filtered.sort((a, b) => b.latest.timestamp - a.latest.timestamp);
  }, [smsList, query]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
      <header
        style={{
          backgroundColor: '#1A73E8', color: '#fff',
          padding: '12px 16px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Nachrichten</h1>
      </header>

      <div style={{ padding: '8px 12px', backgroundColor: '#fff', borderBottom: '1px solid #E8EAED' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            backgroundColor: '#F1F3F4', borderRadius: 10, padding: '8px 12px',
          }}
        >
          <Search size={16} color="#5F6368" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: 15, color: '#202124',
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {list.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60%', color: '#5F6368', fontSize: 15 }}>
            Keine Nachrichten.
          </div>
        ) : (
          list.map(t => <SmsRow key={t.category} thread={t} />)
        )}
      </div>
    </div>
  );
}

const SmsRow = ({ thread }: { thread: ThreadSummary }) => {
  const meta = SENDER_META[thread.category];
  if (!meta) return null;

  return (
    <Link
      to={`/messages/chat/${thread.category}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #F1F3F4',
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease'
      }}
      className="messages-thread-row"
      // Inline hover effect can be simulated or handled in CSS. Standard css hover can be done with style attributes or a class.
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8F9FA'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; }}
    >
      <div style={{ position: 'relative' }}>
        <Avatar initial={meta.initial} color={meta.color} />
        {thread.hasUnread && (
          <div
            style={{
              position: 'absolute', right: -2, top: -2,
              width: 12, height: 12, borderRadius: '50%',
              backgroundColor: '#1A73E8', border: '2px solid #fff',
            }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              flex: 1, fontSize: 16,
              fontWeight: thread.hasUnread ? 600 : 400,
              color: '#202124',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {meta.name}
          </div>
          <div style={{ fontSize: 13, color: thread.hasUnread ? '#1A73E8' : '#5F6368', fontWeight: thread.hasUnread ? 600 : 400, flexShrink: 0 }}>
            {formatStamp(thread.latest.timestamp)}
          </div>
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: thread.hasUnread ? 500 : 400,
            color: thread.hasUnread ? '#202124' : '#5F6368',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginTop: 2,
          }}
        >
          {thread.latest.body}
        </div>
      </div>
    </Link>
  );
};
