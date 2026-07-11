import { motion, AnimatePresence } from 'framer-motion';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Phone } from 'lucide-react';
import type { CallEntry, CallType } from './types';

interface CallLogProps {
  entries: CallEntry[];
  onSelectEntry: (number: string) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

const DAY_MS = 24 * 60 * 60 * 1000;

const formatTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const getDayGroup = (date: Date, now: Date = new Date()): string => {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((startOfDay(now).getTime() - startOfDay(date).getTime()) / DAY_MS);
  if (diffDays <= 0) return 'Heute';
  if (diffDays === 1) return 'Gestern';
  if (diffDays < 7) return 'Diese Woche';
  return 'Älter';
};

const formatRowDateTime = (date: Date, now: Date = new Date()): string => {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((startOfDay(now).getTime() - startOfDay(date).getTime()) / DAY_MS);
  if (diffDays <= 0 || diffDays === 1) return formatTime(date);
  if (diffDays < 7) {
    const weekday = date.toLocaleDateString('de-DE', { weekday: 'short' });
    return `${weekday} ${formatTime(date)}`;
  }
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  return `${dd}.${mm}. ${formatTime(date)}`;
};

const GROUP_ORDER = ['Heute', 'Gestern', 'Diese Woche', 'Älter'] as const;

const TYPE_META: Record<
  CallType,
  { label: string; color: string; Icon: typeof PhoneIncoming }
> = {
  incoming: { label: 'Eingehend', color: '#1A73E8', Icon: PhoneIncoming },
  outgoing: { label: 'Ausgehend', color: '#34A853', Icon: PhoneOutgoing },
  missed: { label: 'Verpasst', color: '#E53935', Icon: PhoneMissed },
};

export default function CallLog({ entries, onSelectEntry }: CallLogProps) {
  const now = new Date();
  const sorted = [...entries].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const grouped: Record<string, CallEntry[]> = {};
  for (const entry of sorted) {
    const group = getDayGroup(entry.timestamp, now);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(entry);
  }

  if (entries.length === 0) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
          padding: 32,
          textAlign: 'center',
          backgroundColor: '#fafafa',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: '#f1f3f4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <Phone size={32} color="#9aa0a6" strokeWidth={1.5} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#3c4043' }}>Keine Anrufe</div>
        <div style={{ fontSize: 13, color: '#9aa0a6', marginTop: 6 }}>
          Hier erscheinen bald eingehende, ausgehende und verpasste Anrufe.
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', backgroundColor: '#fafafa' }}>
      {GROUP_ORDER.map((group) => {
        const items = grouped[group];
        if (!items || items.length === 0) return null;
        return (
          <div key={group}>
            <div
              style={{
                padding: '16px 20px 6px',
                fontSize: 12,
                fontWeight: 600,
                color: '#5f6368',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                backgroundColor: '#fafafa',
              }}
            >
              {group}
            </div>
            <div style={{ backgroundColor: '#fff' }}>
              <AnimatePresence initial={false}>
                {items.map((entry) => {
                  const meta = TYPE_META[entry.type];
                  const isMissed = entry.type === 'missed';
                  return (
                    <motion.button
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => onSelectEntry(entry.number)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        padding: '12px 20px',
                        border: 'none',
                        background: 'transparent',
                        borderBottom: '1px solid #f1f3f4',
                        cursor: 'pointer',
                        textAlign: 'left',
                        gap: 14,
                        WebkitTapHighlightColor: 'transparent',
                        fontFamily: 'inherit',
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: `${meta.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <meta.Icon size={20} color={meta.color} strokeWidth={2} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: isMissed ? 600 : 500,
                            color: isMissed ? meta.color : '#1a1a1a',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginBottom: 2,
                          }}
                        >
                          {entry.name || entry.number}
                        </div>
                        <div style={{ fontSize: 12, color: '#5f6368' }}>{meta.label}</div>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#9aa0a6',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {formatRowDateTime(entry.timestamp, now)}
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
      <div style={{ height: 24 }} />
    </div>
  );
}
