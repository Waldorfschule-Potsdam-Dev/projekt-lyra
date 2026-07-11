import { useEffect, useRef, useState } from 'react';
import { Sun, CloudSun, Cloud, CloudRain } from 'lucide-react';
import { useClock } from '../../store/clock';

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

const PAGE_SIZE = 5;
const ROW_HEIGHT = 45;
const ROTATION_MS = 4000;

const CITIES = [
  { name: 'Los Angeles', tz: 'America/Los_Angeles' },
  { name: 'New York', tz: 'America/New_York' },
  { name: 'São Paulo', tz: 'America/Sao_Paulo' },
  { name: 'London', tz: 'Europe/London' },
  { name: 'Paris', tz: 'Europe/Paris' },
  { name: 'Dubai', tz: 'Asia/Dubai' },
  { name: 'Singapur', tz: 'Asia/Singapore' },
  { name: 'Hong Kong', tz: 'Asia/Hong_Kong' },
  { name: 'Tokio', tz: 'Asia/Tokyo' },
  { name: 'Sydney', tz: 'Australia/Sydney' },
];

function getCityTimeInfo(cityTz: string, now: Date) {
  const fmtTime = (tz: string) =>
    now.toLocaleTimeString('de-DE', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
    });

  const fmtOffset = (tz: string) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    }).formatToParts(now);
    return parts.find((p) => p.type === 'timeZoneName')?.value || '';
  };

  const fmtDate = (tz: string) =>
    new Intl.DateTimeFormat('de-DE', {
      timeZone: tz,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(now);

  return {
    time: fmtTime(cityTz),
    offset: fmtOffset(cityTz),
    date: fmtDate(cityTz),
  };
}

function SectionPill({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #4F378B 0%, #2A2240 100%)',
        border: '1px solid #6E4FBE',
        borderRadius: 10,
        padding: '5px 12px',
        fontSize: 10,
        fontWeight: 700,
        color: '#EADDFF',
        letterSpacing: 1.5,
        marginBottom: 10,
        boxShadow: '0 2px 10px rgba(79, 55, 139, 0.4)',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      }}
    >
      {children}
    </div>
  );
}

function WorldClocks() {
  const nowMs = useClock((s) => s.now);
  const now = new Date(nowMs);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const userScrollingRef = useRef(false);
  const userScrollTimerRef = useRef<number | null>(null);
  const programmaticScrollRef = useRef(false);
  const pageCount = Math.ceil(CITIES.length / PAGE_SIZE);

  useEffect(() => {
    const id = setInterval(() => {
      if (userScrollingRef.current) return;
      setActivePage((prev) => (prev + 1) % pageCount);
    }, ROTATION_MS);
    return () => clearInterval(id);
  }, [pageCount]);

  useEffect(() => {
    if (!scrollRef.current || userScrollingRef.current) return;
    programmaticScrollRef.current = true;
    scrollRef.current.scrollTo({
      top: activePage * PAGE_SIZE * ROW_HEIGHT,
      behavior: 'smooth',
    });
    window.setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 700);
  }, [activePage]);

  const handleScroll = () => {
    if (programmaticScrollRef.current || !scrollRef.current) return;
    userScrollingRef.current = true;
    if (userScrollTimerRef.current) clearTimeout(userScrollTimerRef.current);
    userScrollTimerRef.current = window.setTimeout(() => {
      userScrollingRef.current = false;
    }, 2000);
    const { scrollTop } = scrollRef.current;
    const firstVisibleRow = Math.floor(scrollTop / ROW_HEIGHT);
    const page = Math.floor(firstVisibleRow / PAGE_SIZE);
    setActivePage(Math.max(0, Math.min(page, pageCount - 1)));
  };

  return (
    <div style={{ width: '100%', maxWidth: 360 }}>
      <SectionPill>WELTZEIT</SectionPill>
      <div
        style={{
          background: 'linear-gradient(180deg, #2A2240 0%, #1F1B2E 100%)',
          border: '1px solid #4F378B',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(79, 55, 139, 0.3)',
        }}
      >
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            maxHeight: ROW_HEIGHT * PAGE_SIZE + 4,
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollSnapType: 'y mandatory',
          }}
        >
          {CITIES.map((city, i) => {
            const info = getCityTimeInfo(city.tz, now);
            return (
              <div
                key={city.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 16px',
                  height: ROW_HEIGHT,
                  boxSizing: 'border-box',
                  borderBottom: i < CITIES.length - 1 ? '1px solid rgba(79, 55, 139, 0.3)' : 'none',
                  scrollSnapAlign: 'start',
                }}
              >
                <div>
                  <div style={{ color: '#EADDFF', fontSize: 13, fontWeight: 500 }}>{city.name}</div>
                  <div style={{ color: '#9E94B0', fontSize: 10, marginTop: 1 }}>
                    {info.date}
                    {info.offset ? ` · ${info.offset}` : ''}
                  </div>
                </div>
                <div
                  style={{
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 400,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {info.time}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 6,
          marginTop: 12,
        }}
      >
        {Array.from({ length: pageCount }).map((_, idx) => (
          <div
            key={idx}
            style={{
              width: activePage === idx ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: activePage === idx
                ? 'linear-gradient(90deg, #EADDFF, #D0BCFF)'
                : '#4F378B',
              boxShadow: activePage === idx ? '0 0 8px rgba(208, 188, 255, 0.6)' : 'none',
              transition: 'width 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function getWeather(now: Date) {
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  const seasonalBase = 18 + Math.sin((dayOfYear / 365) * 2 * Math.PI - Math.PI / 2) * 10;
  const hourTemp =
    Math.sin(((now.getHours() + now.getMinutes() / 60 - 6) / 24) * 2 * Math.PI) * 5;
  const temp = Math.round(seasonalBase + hourTemp);
  const hi = temp + 3;
  const lo = temp - 5;
  const conditions = [
    { label: 'Sonnig', Icon: Sun },
    { label: 'Heiter', Icon: CloudSun },
    { label: 'Wolkig', Icon: Cloud },
    { label: 'Leicht bewölkt', Icon: CloudSun },
    { label: 'Regen', Icon: CloudRain },
  ];
  return { temp, hi, lo, ...conditions[dayOfYear % conditions.length] };
}

function Weather({ style }: { style?: React.CSSProperties }) {
  const nowMs = useClock((s) => s.now);
  const now = new Date(nowMs);

  const w = getWeather(now);
  const Icon = w.Icon;

  return (
    <div style={{ width: '100%', maxWidth: 360, ...style }}>
      <SectionPill>WETTER</SectionPill>
      <div
        style={{
          background: 'linear-gradient(135deg, #4F378B 0%, #2A2240 60%, #1F1B2E 100%)',
          border: '1px solid #6E4FBE',
          borderRadius: 24,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 8px 28px rgba(79, 55, 139, 0.4), inset 0 1px 0 rgba(234, 221, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-30%',
            width: '70%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(208, 188, 255, 0.15) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative' }}>
          <Icon size={40} strokeWidth={1.5} color="#EADDFF" />
        </div>
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <div style={{ fontSize: 13, color: '#EADDFF', fontWeight: 500 }}>Berlin</div>
          <div style={{ fontSize: 11, color: '#9E94B0', marginTop: 2 }}>
            {w.label} · H {w.hi}° / T {w.lo}°
          </div>
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 300,
            color: '#fff',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            textShadow: '0 2px 12px rgba(208, 188, 255, 0.4)',
            position: 'relative',
          }}
        >
          {w.temp}°
        </div>
      </div>
    </div>
  );
}

export default function ClockTab() {
  const nowMs = useClock((s) => s.now);
  const now = new Date(nowMs);

  const seconds = pad(now.getSeconds());
  const minutes = pad(now.getMinutes());
  const hours = pad(now.getHours());
  const date = now.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 16px 16px',
        gap: 16,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 220,
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          position: 'relative',
          background:
            'radial-gradient(circle at 30% 25%, #8B6FD8 0%, #6E4FBE 30%, #4F378B 60%, #1F1B2E 100%)',
          boxShadow:
            '0 20px 60px rgba(208, 188, 255, 0.35), 0 0 100px rgba(208, 188, 255, 0.18), inset 0 0 0 2px rgba(208, 188, 255, 0.3), inset 0 -20px 40px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '20%',
            width: '40%',
            height: '25%',
            background: 'radial-gradient(ellipse, rgba(234, 221, 255, 0.35) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            fontSize: 32,
            fontWeight: 200,
            letterSpacing: 1.5,
            fontVariantNumeric: 'tabular-nums',
            color: '#EADDFF',
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          {seconds}
        </div>

        <div
          style={{
            height: 1,
            width: 36,
            background: 'rgba(234, 221, 255, 0.4)',
            margin: '4px 0',
          }}
        />

        <div
          style={{
            fontSize: 42,
            fontWeight: 300,
            letterSpacing: 3,
            fontVariantNumeric: 'tabular-nums',
            color: '#fff',
            textShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}
        >
          {hours}
          <span style={{ opacity: 0.5, margin: '0 3px' }}>:</span>
          {minutes}
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: '#EADDFF',
            opacity: 0.85,
            textTransform: 'capitalize',
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}
        >
          {date}
        </div>
      </div>

      <WorldClocks />
      <Weather style={{ marginTop: 'auto' }} />
    </div>
  );
}