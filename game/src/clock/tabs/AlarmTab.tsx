import { useState } from 'react';
import { Plus, Minus, Trash2, X } from 'lucide-react';

type Alarm = {
  id: string;
  hour: number;
  minute: number;
  label: string;
  enabled: boolean;
  days: boolean[];
};

const DAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const DEFAULT_ALARMS: Alarm[] = [
  {
    id: '1',
    hour: 7,
    minute: 0,
    label: 'Aufstehen',
    enabled: true,
    days: [true, true, true, true, true, false, false],
  },
  {
    id: '2',
    hour: 9,
    minute: 30,
    label: 'Videocall',
    enabled: false,
    days: [true, true, true, true, true, false, false],
  },
  {
    id: '3',
    hour: 19,
    minute: 0,
    label: 'Geheime Mails checken',
    enabled: true,
    days: [true, true, true, true, true, true, true],
  }
];

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function formatDays(days: boolean[]): string {
  const weekdays = days.slice(0, 5);
  const weekend = days.slice(5);
  if (days.every((d) => d)) return 'Täglich';
  if (weekdays.every((d) => d) && weekend.every((d) => !d)) return 'Mo – Fr';
  if (weekdays.every((d) => !d) && weekend.every((d) => d)) return 'Wochenende';
  return days
    .map((d, i) => (d ? DAYS_SHORT[i] : ''))
    .filter(Boolean)
    .join(', ');
}

function TimeStepper({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  const wrap = (delta: number) => {
    if (delta > 0) onChange(value === max ? 0 : value + 1);
    else onChange(value === 0 ? max : value - 1);
  };
  const btnStyle: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: '50%',
    backgroundColor: '#1F1B2E',
    border: '1px solid #4F378B',
    color: '#EADDFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(79, 55, 139, 0.3)',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <button onClick={() => wrap(1)} style={btnStyle} aria-label="erhöhen">
        <Plus size={18} />
      </button>
      <div
        style={{
          fontSize: 48,
          fontWeight: 300,
          fontVariantNumeric: 'tabular-nums',
          minWidth: 64,
          textAlign: 'center',
          color: '#fff',
          textShadow: '0 2px 12px rgba(208, 188, 255, 0.3)',
        }}
      >
        {pad(value)}
      </div>
      <button onClick={() => wrap(-1)} style={btnStyle} aria-label="verringern">
        <Minus size={18} />
      </button>
    </div>
  );
}

export default function AlarmTab() {
  const [alarms, setAlarms] = useState<Alarm[]>(DEFAULT_ALARMS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const toggle = (id: string) =>
    setAlarms((a) => a.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)));

  const remove = (id: string) => {
    setAlarms((a) => a.filter((x) => x.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const update = (id: string, patch: Partial<Alarm>) =>
    setAlarms((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const addAlarm = (hour: number, minute: number, label: string) => {
    const newAlarm: Alarm = {
      id: Date.now().toString(),
      hour,
      minute,
      label: label.trim() || 'Wecker',
      enabled: true,
      days: [false, true, true, true, true, true, false],
    };
    setAlarms((a) =>
      [...a, newAlarm].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute))
    );
    setShowAdd(false);
    setEditingId(newAlarm.id);
  };

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <div style={{ overflowY: 'auto', height: '100%', paddingBottom: 96 }}>
        {alarms.length === 0 && !showAdd && (
          <div style={{ padding: 48, textAlign: 'center', color: '#9E94B0', fontSize: 14 }}>
            Keine Wecker. Tippe auf +, um einen hinzuzufügen.
          </div>
        )}

        {alarms.map((alarm) => {
          const isEditing = editingId === alarm.id;
          return (
            <div
              key={alarm.id}
              style={{
                borderBottom: '1px solid rgba(79, 55, 139, 0.3)',
                background: isEditing
                  ? 'linear-gradient(180deg, #2A2240 0%, #1F1B2E 100%)'
                  : 'transparent',
              }}
            >
              <div
                onClick={() => setEditingId(isEditing ? null : alarm.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 16px',
                  cursor: 'pointer',
                  opacity: alarm.enabled ? 1 : 0.45,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 300,
                      fontVariantNumeric: 'tabular-nums',
                      color: '#fff',
                      textShadow: alarm.enabled ? '0 2px 12px rgba(208, 188, 255, 0.25)' : 'none',
                    }}
                  >
                    {pad(alarm.hour)}:{pad(alarm.minute)}
                  </div>
                  <div style={{ fontSize: 13, color: '#EADDFF', marginTop: 4 }}>
                    {alarm.label} · {formatDays(alarm.days)}
                  </div>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(alarm.id);
                  }}
                  style={{
                    width: 52,
                    height: 32,
                    borderRadius: 16,
                    background: alarm.enabled
                      ? 'linear-gradient(135deg, #EADDFF, #D0BCFF)'
                      : '#36343B',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                    boxShadow: alarm.enabled
                      ? '0 0 16px rgba(208, 188, 255, 0.4)'
                      : 'none',
                  }}
                  role="switch"
                  aria-checked={alarm.enabled}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: alarm.enabled ? 24 : 4,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: alarm.enabled ? '#21005D' : '#938F99',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    }}
                  />
                </div>
              </div>

              {isEditing && (
                <div style={{ padding: '12px 16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ flex: 1, position: 'relative', marginRight: 8 }}>
                      <input
                        type="text"
                        value={alarm.label}
                        onChange={(e) => update(alarm.id, { label: e.target.value })}
                        placeholder="Wecker-Name"
                        style={{
                          width: '100%',
                          padding: '10px 36px 10px 14px',
                          backgroundColor: '#0F0B16',
                          border: '1px solid #4F378B',
                          borderRadius: 12,
                          color: '#fff',
                          fontSize: 14,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                      {alarm.label && (
                        <button
                          onClick={() => update(alarm.id, { label: '' })}
                          style={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(79, 55, 139, 0.4)',
                            border: 'none',
                            color: '#EADDFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          aria-label="Leeren"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => remove(alarm.id)}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        backgroundColor: '#1F1B2E',
                        border: '1px solid #4F378B',
                        color: '#ff6b81',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      aria-label="Löschen"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 16,
                      marginBottom: 24,
                    }}
                  >
                    <TimeStepper
                      value={alarm.hour}
                      onChange={(v) => update(alarm.id, { hour: v })}
                      max={23}
                    />
                    <span style={{ fontSize: 36, color: '#9E94B0', fontWeight: 200 }}>:</span>
                    <TimeStepper
                      value={alarm.minute}
                      onChange={(v) => update(alarm.id, { minute: v })}
                      max={59}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                    {DAYS_SHORT.map((d, i) => {
                      const active = alarm.days[i];
                      return (
                        <button
                          key={d}
                          onClick={() => {
                            const nd = [...alarm.days];
                            nd[i] = !nd[i];
                            update(alarm.id, { days: nd });
                          }}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: active
                              ? 'linear-gradient(135deg, #EADDFF, #D0BCFF)'
                              : '#1F1B2E',
                            color: active ? '#21005D' : '#fff',
                            border: active ? '1px solid rgba(234, 221, 255, 0.4)' : '1px solid #4F378B',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: active ? '0 4px 12px rgba(208, 188, 255, 0.4)' : 'none',
                          }}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {showAdd && (
          <div
            style={{
              padding: '12px 16px 20px',
              background: 'linear-gradient(180deg, #2A2240 0%, #1F1B2E 100%)',
              borderBottom: '1px solid rgba(79, 55, 139, 0.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500, color: '#EADDFF' }}>Neuer Wecker</span>
              <button
                onClick={() => setShowAdd(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#9E94B0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Abbrechen"
              >
                <X size={20} />
              </button>
            </div>
            <NewAlarmForm onAdd={addAlarm} />
          </div>
        )}
      </div>

      {!showAdd && (
        <button
          onClick={() => {
            setShowAdd(true);
            setEditingId(null);
          }}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #EADDFF 0%, #D0BCFF 50%, #B69DF8 100%)',
            border: '1px solid rgba(234, 221, 255, 0.4)',
            color: '#21005D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(208, 188, 255, 0.5), 0 0 60px rgba(208, 188, 255, 0.3)',
          }}
          aria-label="Neuer Wecker"
        >
          <Plus size={28} />
        </button>
      )}
    </div>
  );
}

function NewAlarmForm({ onAdd }: { onAdd: (h: number, m: number, label: string) => void }) {
  const [h, setH] = useState(7);
  const [m, setM] = useState(0);
  const [label, setLabel] = useState('');
  return (
    <>
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Name (optional)"
          style={{
            width: '100%',
            padding: '10px 36px 10px 14px',
            backgroundColor: '#0F0B16',
            border: '1px solid #4F378B',
            borderRadius: 12,
            color: '#fff',
            fontSize: 14,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {label && (
          <button
            onClick={() => setLabel('')}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: 'rgba(79, 55, 139, 0.4)',
              border: 'none',
              color: '#EADDFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Leeren"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <TimeStepper value={h} onChange={setH} max={23} />
        <span style={{ fontSize: 36, color: '#9E94B0', fontWeight: 200 }}>:</span>
        <TimeStepper value={m} onChange={setM} max={59} />
      </div>
      <button
        onClick={() => onAdd(h, m, label)}
        style={{
          width: '100%',
          padding: '12px',
          background: 'linear-gradient(135deg, #EADDFF 0%, #D0BCFF 100%)',
          color: '#21005D',
          border: 'none',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(208, 188, 255, 0.4)',
        }}
      >
        Hinzufügen
      </button>
    </>
  );
}