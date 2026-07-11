import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socialTheme, socialGlobalCss } from './SocialTheme';
import { AnimatedTime, digitFlipCss } from './AnimatedDigits';

type PassState = {
  target: number;
  visibleMs: number;
  meta: string;
};

function randomPass(minMinutes: number, maxMinutes: number, visibleSeconds: number, meta: string): PassState {
  const offset = (minMinutes + Math.random() * (maxMinutes - minMinutes)) * 60 * 1000;
  return { target: Date.now() + offset, visibleMs: visibleSeconds * 1000, meta };
}

function formatCountdown(ms: number) {
  if (ms <= 0) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function PassCard({
  title,
  subtitle,
  pass,
  onRegenerate,
}: {
  title: string;
  subtitle: string;
  pass: PassState;
  onRegenerate: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const stateRef = useRef(pass);
  stateRef.current = pass;

  useEffect(() => {
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= stateRef.current.target + stateRef.current.visibleMs) {
        onRegenerate();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [onRegenerate]);

  const visible = now >= pass.target && now < pass.target + pass.visibleMs;
  const msUntil = pass.target - now;
  const msLeftVisible = visible ? pass.target + pass.visibleMs - now : 0;

  return (
    <div style={{
      marginTop: 16, padding: 16,
      background: socialTheme.bg.secondary,
      borderRadius: 12,
      border: `1px solid ${socialTheme.border.subtle}`,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: socialTheme.text.primary, fontFamily: socialTheme.font.system }}>
          {title}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {visible ? (
            <motion.div
              key="live"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: 8, height: 8, borderRadius: 4,
                  background: socialTheme.accent.green,
                  boxShadow: `0 0 8px ${socialTheme.accent.green}`,
                }}
              />
              <span style={{
                fontSize: 10, fontWeight: 700, color: socialTheme.accent.green,
                fontFamily: socialTheme.font.mono, letterSpacing: 0.5,
              }}>
                JETZT SICHTBAR
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="wait"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span style={{
                fontSize: 10, color: socialTheme.text.tertiary,
                fontFamily: socialTheme.font.mono, letterSpacing: 0.5,
              }}>
                NÄCHSTER DURCHGANG
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div style={{ fontSize: 12, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system, marginBottom: 8 }}>
        {subtitle}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={visible ? 'visible' : `t-${Math.floor(msUntil / 1000)}`}
            initial={{ y: 4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -4, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              fontSize: 28, fontWeight: 700,
              fontFamily: socialTheme.font.mono,
              letterSpacing: 1,
            }}
          >
            <AnimatedTime
              value={visible ? formatCountdown(msLeftVisible) : formatCountdown(msUntil)}
              style={{ color: visible ? socialTheme.accent.green : socialTheme.accent.blue }}
            />
          </motion.div>
        </AnimatePresence>
        <span style={{ fontSize: 11, color: socialTheme.text.tertiary, fontFamily: socialTheme.font.system }}>
          {visible ? 'noch sichtbar' : 'bis zum Überflug'}
        </span>
      </div>
      <div style={{
        marginTop: 8, paddingTop: 8,
        borderTop: `1px solid ${socialTheme.border.subtle}`,
        fontSize: 11, color: socialTheme.text.tertiary, fontFamily: socialTheme.font.system,
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>{pass.meta}</span>
      </div>
    </div>
  );
}

export function SternenweltPage() {
  const [iss, setIss] = useState<PassState>(() =>
    randomPass(134, 158, 4 * 60, 'Höhe 420 km · Geschw. 28.000 km/h · Max. Elevation 64°')
  );
  const [starlink, setStarlink] = useState<PassState>(() =>
    randomPass(8, 24, 6 * 60, '23 Satelliten · Helligkeit -2.4 mag · Höhe 550 km')
  );

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
        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: socialTheme.font.system }}>
          STERNENWELT
        </div>
        <div style={{ fontSize: 11, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system }}>
          himmel.allianz-intern.net
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }} className="hide-scrollbar">
        {/* Star map placeholder */}
        <div style={{
          height: 200,
          background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)',
          borderRadius: 12,
          border: `1px solid ${socialTheme.border.subtle}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 16,
        }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              background: 'white',
              borderRadius: '50%',
              opacity: Math.random() * 0.8 + 0.2,
            }} />
          ))}
          <div style={{
            fontSize: 13, color: socialTheme.text.tertiary,
            fontFamily: socialTheme.font.system,
            textAlign: 'center',
            position: 'relative', zIndex: 1,
          }}>
            Sternenhimmel · Sektor A0<br />
            <span style={{ fontSize: 11 }}>22:14 Uhr</span>
          </div>
        </div>
        {/* Visible planets */}
        <div style={{ fontSize: 14, fontWeight: 700, color: socialTheme.text.primary, fontFamily: socialTheme.font.system, marginBottom: 12 }}>
          Sichtbare Planeten heute
        </div>
        {[
          { name: 'Mars', constellation: 'in Skorpion', visibility: 'Gut', icon: '🔴' },
          { name: 'Jupiter', constellation: 'in Stier', visibility: 'Sehr gut', icon: '🟤' },
          { name: 'Saturn', constellation: 'in Wassermann', visibility: 'Mäßig', icon: '🟡' },
        ].map((p, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px',
            background: socialTheme.bg.secondary,
            borderRadius: 12,
            border: `1px solid ${socialTheme.border.subtle}`,
            marginBottom: 8,
          }}>
            <span style={{ fontSize: 24 }}>{p.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: socialTheme.text.primary, fontFamily: socialTheme.font.system }}>
                {p.name}
              </div>
              <div style={{ fontSize: 12, color: socialTheme.text.secondary, fontFamily: socialTheme.font.system }}>
                {p.constellation}
              </div>
            </div>
            <span style={{
              fontSize: 11, color: socialTheme.accent.green,
              background: `rgba(0, 186, 124, 0.15)`,
              padding: '2px 8px', borderRadius: 4,
              fontWeight: 600, fontFamily: socialTheme.font.system,
            }}>
              {p.visibility}
            </span>
          </div>
        ))}
        <PassCard
          title="Internationale Raumstation"
          subtitle="Nächster Überflug über Sektor A0"
          pass={iss}
          onRegenerate={() => setIss(randomPass(85, 100, 4 * 60, 'Höhe 420 km · Geschw. 28.000 km/h · Max. Elevation 64°'))}
        />
        <PassCard
          title="SpaceX Starlink Konstellation"
          subtitle="Nächster sichtbarer Vorbeiflug über Sektor A0"
          pass={starlink}
          onRegenerate={() => setStarlink(randomPass(20, 45, 6 * 60, '23 Satelliten · Helligkeit -2.4 mag · Höhe 550 km'))}
        />
      </div>
    </div>
  );
}
