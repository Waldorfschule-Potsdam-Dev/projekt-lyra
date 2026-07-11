import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socialTheme, socialGlobalCss } from './SocialTheme';
import { AnimatedTime, digitFlipCss } from './AnimatedDigits';

type Cond = { desc: string; icon: string; tempBias: number };

const WEATHER_CONDITIONS: readonly Cond[] = [
  { desc: 'Sonnig', icon: '☀️', tempBias: 4 },
  { desc: 'Heiter', icon: '🌤️', tempBias: 2 },
  { desc: 'Bewölkt', icon: '⛅', tempBias: 0 },
  { desc: 'Regen', icon: '🌧️', tempBias: -3 },
  { desc: 'Niesel', icon: '🌦️', tempBias: -2 },
  { desc: 'Gewitter', icon: '⛈️', tempBias: -1 },
  { desc: 'Nebel', icon: '🌫️', tempBias: -1 },
  { desc: 'Windig', icon: '💨', tempBias: -1 },
] as const;

const UPDATE_INTERVAL_MS = 5 * 60_000;
const WORLD_CITIES_INTERVAL_MS = 30_000;
const FORECAST_DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const WORLD_CITIES = [
  'New York', 'Los Angeles', 'Tokyo', 'Neu-Delhi', 'Paris',
  'London', 'Kapstadt', 'Sydney', 'Rio', 'Moskau', 'Berlin', 'Toronto',
];

function pickCondition(): Cond {
  const weights = [0.22, 0.22, 0.18, 0.12, 0.08, 0.06, 0.06, 0.06];
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < WEATHER_CONDITIONS.length; i++) {
    acc += weights[i];
    if (r < acc) return WEATHER_CONDITIONS[i];
  }
  return WEATHER_CONDITIONS[0];
}

function clampTemp(t: number) {
  return Math.max(6, Math.min(36, t));
}

function buildForecast(baseTemp: number, baseCond: Cond) {
  const days = ['Heute', 'Morgen', ...FORECAST_DAYS.slice(0, 3)];
  return days.map((day, i) => {
    const swing = Math.round((Math.random() - 0.5) * 6);
    const dayTemp = clampTemp(baseTemp + swing + baseCond.tempBias * 0.3 - i);
    const cond = i === 0 ? baseCond : pickCondition();
    return { day, temp: `${dayTemp}°`, desc: cond.desc, icon: cond.icon };
  });
}

function buildWorldCities(baseTemp: number) {
  const count = 4 + Math.floor(Math.random() * 4);
  const shuffled = [...WORLD_CITIES].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((city) => {
    const swing = Math.round((Math.random() - 0.5) * 24);
    const t = clampTemp(baseTemp + swing);
    const cond = pickCondition();
    const hh = String(Math.floor(Math.random() * 24)).padStart(2, '0');
    const mm = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    return { city, temp: `${t}°`, desc: cond.desc, icon: cond.icon, time: `${hh}:${mm}` };
  });
}

function RainOverlay() {
  const drops = Array.from({ length: 50 });
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      {drops.map((_, i) => {
        const left = Math.random() * 100;
        const duration = 0.6 + Math.random() * 0.5;
        const delay = Math.random() * 1.5;
        const length = 10 + Math.random() * 14;
        return (
          <motion.div
            key={i}
            initial={{ y: -40, x: 0, opacity: 0 }}
            animate={{ y: '110vh', opacity: [0, 0.6, 0.6, 0] }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              left: left + '%',
              top: 0,
              width: 1.5,
              height: length,
              background: 'linear-gradient(to bottom, transparent, #7ec8ff 80%, #a8dcff)',
              borderRadius: 1,
              transform: 'rotate(12deg)',
            }}
          />
        );
      })}
    </div>
  );
}



export function WetterPage() {
  const [temp, setTemp] = useState<number>(22);
  const [condition, setCondition] = useState<Cond>(WEATHER_CONDITIONS[1]);
  const [forecast, setForecast] = useState(() => buildForecast(22, WEATHER_CONDITIONS[1]));
  const [cities, setCities] = useState(() => buildWorldCities(22));
  const [localPulseKey, setLocalPulseKey] = useState(0);
  const [citiesPulseKey, setCitiesPulseKey] = useState(0);
  const [nextUpdate, setNextUpdate] = useState<number>(Date.now() + UPDATE_INTERVAL_MS);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const tick = () => {
      setTemp(prev => {
        const drift = Math.round((Math.random() - 0.5) * 4);
        return clampTemp(prev + drift);
      });
      setCondition(prev => {
        if (Math.random() < 0.55) return pickCondition();
        return prev;
      });
      setNextUpdate(Date.now() + UPDATE_INTERVAL_MS);
      setLocalPulseKey(k => k + 1);
    };
    const interval = window.setInterval(tick, UPDATE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const tick = () => {
      setCities(buildWorldCities(temp));
      setCitiesPulseKey(k => k + 1);
    };
    const interval = window.setInterval(tick, WORLD_CITIES_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [temp]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setForecast(buildForecast(temp, condition));
  }, [temp, condition]);

  const secondsLeft = Math.max(0, Math.ceil((nextUpdate - now) / 1000));
  const countdownNumber = secondsLeft >= 60
    ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
    : `${secondsLeft}s`;
  const isRaining = condition.desc === 'Regen' || condition.desc === 'Niesel' || condition.desc === 'Gewitter';

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#000', color: '#e7e9ea', position: 'relative', overflow: 'hidden',
    }}>
      <style>{socialGlobalCss}{digitFlipCss}</style>
      {/* Header */}
      <div style={{
        background: socialTheme.bg.glass, backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${socialTheme.border.subtle}`,
        padding: '12px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.25, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 8, height: 8, borderRadius: 4,
              background: socialTheme.accent.green,
              boxShadow: `0 0 8px ${socialTheme.accent.green}`,
            }}
          />
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: socialTheme.font.system }}>
            WETTER 360
          </div>
          <div style={{ fontSize: 10, color: socialTheme.text.tertiary, fontFamily: socialTheme.font.mono, marginLeft: 'auto' }}>
            Update in <AnimatedTime value={countdownNumber} style={{ color: socialTheme.text.tertiary }} />
          </div>
        </div>
        <div style={{ fontSize: 11, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system, marginTop: 2 }}>
          wetter.allianz-intern.net · live
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }} className="hide-scrollbar">
        {/* Current weather */}
        <div style={{
          textAlign: 'center', padding: '32px 0',
          borderBottom: `1px solid ${socialTheme.border.subtle}`,
          position: 'relative',
        }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`pulse-${localPulseKey}`}
              initial={{ opacity: 0.6, scale: 0.96 }}
              animate={{ opacity: [0.6, 0], scale: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{
                position: 'absolute', inset: 0,
                border: `1px solid ${socialTheme.accent.green}`,
                borderRadius: 16,
                pointerEvents: 'none',
              }}
            />
          </AnimatePresence>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={temp}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                style={{ fontSize: 72, fontWeight: 200, color: socialTheme.text.primary, fontFamily: socialTheme.font.system, lineHeight: 1 }}
              >
                {temp}°
              </motion.div>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={condition.desc}
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ fontSize: 16, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system, marginTop: 8 }}
            >
              <span style={{ fontSize: 20, marginRight: 6 }}>{condition.icon}</span>
              {condition.desc}
            </motion.div>
          </AnimatePresence>
          <div style={{ fontSize: 13, color: socialTheme.text.tertiary, fontFamily: socialTheme.font.system, marginTop: 4 }}>
            Sektor A0 · Zentrale
          </div>
        </div>
        {/* Forecast */}
        <div style={{ padding: '16px 0' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: socialTheme.text.primary, fontFamily: socialTheme.font.system, marginBottom: 12 }}>
            5-Tage-Prognose
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            {forecast.map((d, i) => (
              <motion.div
                key={`${d.day}-${i}-${d.temp}-${d.desc}`}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0',
                  borderBottom: `1px solid ${socialTheme.border.subtle}`,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: socialTheme.text.primary, fontFamily: socialTheme.font.system, width: 56 }}>
                  {d.day}
                </span>
                <span style={{ fontSize: 20 }}>{d.icon}</span>
                <span style={{ fontSize: 14, color: socialTheme.text.primary, fontFamily: socialTheme.font.system, flex: 1 }}>
                  {d.desc}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: socialTheme.text.primary, fontFamily: socialTheme.font.system }}>
                  {d.temp}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {/* UV Index */}
        <div style={{
          padding: 16, background: socialTheme.bg.secondary,
          borderRadius: 12, border: `1px solid ${socialTheme.border.subtle}`,
          marginTop: 16,
        }}>
          <div style={{ fontSize: 12, color: socialTheme.text.tertiary, fontFamily: socialTheme.font.system, marginBottom: 8 }}>
            UV-INDEX
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <motion.div
              key={`uv-${localPulseKey}`}
              initial={{ width: '45%' }}
              animate={{ width: `${30 + (temp * 1.4) % 60}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ flex: 1, height: 4, background: socialTheme.bg.primary, borderRadius: 2, overflow: 'hidden' }}
            >
              <div style={{ width: '100%', height: '100%', background: '#ffd400', borderRadius: 2 }} />
            </motion.div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#ffd400', fontFamily: socialTheme.font.system }}>
              {(3 + (temp % 5)).toFixed(1)}
            </span>
          </div>
        </div>

        {/* Weltweite Städte */}
        <div style={{ marginTop: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
          }}>
            <div style={{ width: 16, height: 1, background: socialTheme.accent.green }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: socialTheme.text.primary, fontFamily: socialTheme.font.system, textTransform: 'uppercase', letterSpacing: 1 }}>
              Weltweite Städte
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 10, background: socialTheme.bg.secondary, border: `1px solid ${socialTheme.border.subtle}` }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={`cp-${citiesPulseKey}`}
                  initial={{ opacity: 0.3, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.3, scale: 0.6 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{
                    width: 6, height: 6, borderRadius: 3,
                    background: socialTheme.accent.green,
                    boxShadow: `0 0 6px ${socialTheme.accent.green}`,
                  }}
                />
              </AnimatePresence>
              <span style={{ fontSize: 10, color: socialTheme.text.tertiary, fontFamily: socialTheme.font.mono, letterSpacing: 0.5 }}>
                30s
              </span>
            </div>
            <div style={{ flex: 1, height: 1, background: socialTheme.accent.green }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <AnimatePresence mode="popLayout" initial={false}>
              {cities.map((c) => (
                <motion.div
                  key={c.city}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{
                    padding: 12,
                    background: socialTheme.bg.secondary,
                    borderRadius: 12,
                    border: `1px solid ${socialTheme.border.subtle}`,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <span style={{ fontSize: 22 }}>{c.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: socialTheme.text.primary, fontFamily: socialTheme.font.system, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.city}
                    </div>
                    <div style={{ fontSize: 11, color: socialTheme.text.tertiary, fontFamily: socialTheme.font.system }}>
                      {c.desc} · {c.time}
                    </div>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: socialTheme.text.primary, fontFamily: socialTheme.font.system }}>
                    {c.temp}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {isRaining && <RainOverlay />}
    </div>
  );
}

