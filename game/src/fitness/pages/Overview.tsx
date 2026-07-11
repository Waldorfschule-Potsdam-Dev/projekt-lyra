import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings as Cog, Zap, Target, Footprints, Flame, Clock, ChevronRight, type LucideIcon } from 'lucide-react';
import { BRAND, BRAND_LIGHT, ICONS, STORAGE_KEY_THEME, WORKOUTS } from '../data';
import { loadRoutes, formatRouteDate, formatRouteDistance, formatRouteDuration, getInitialTheme, getLastWorkout } from '../utils';
import { buildTokens } from '../styles';
import type { Theme, Tokens } from '../types';
import { ActivityRings } from '../components/ActivityRings';
import { CircleIcon } from '../components/CircleIcon';
import { RingLegend } from '../components/RingLegend';
import { Section } from '../components/Section';
import { Sparkline } from '../components/Sparkline';
import { StatCard } from '../components/StatCard';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import { TopBar } from '../components/TopBar';

export default function Overview() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [routes, setRoutes] = useState(() => loadRoutes());
  const t = useMemo(() => buildTokens(theme), [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  const lastWorkout = getLastWorkout();
  const move = 0.72;
  const exercise = 0.58;
  const stand = 0.85;

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <TopBar
        subtitle="Guten Morgen"
        title="Daniel"
        t={t}
        right={
          <>
            <ThemeToggleButton theme={theme} setTheme={setTheme} t={t} />
            <CircleIcon bg={t.iconBg}>
              <Bell size={18} color={t.text} />
            </CircleIcon>
            <CircleIcon bg={t.iconBg}>
              <Cog size={18} color={t.text} />
            </CircleIcon>
          </>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          marginTop: '8px',
          borderRadius: '32px',
          padding: '24px',
          color: 'white',
          background: `linear-gradient(135deg, #1a1a1f 0%, #2a1a14 50%, ${BRAND} 130%)`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: t.shadowHero,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${BRAND_LIGHT}55 0%, transparent 70%)`,
          }}
        />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '13px', opacity: 0.7, fontWeight: 500, letterSpacing: '0.4px' }}>HEUTE</div>
            <div
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.12)',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Zap size={11} fill="#FFD54F" color="#FFD54F" /> +12% vs. letzte Woche
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '6px', letterSpacing: '-0.8px' }}>
            486 <span style={{ fontSize: '16px', fontWeight: 500, opacity: 0.7 }}>kcal</span>
          </div>
          <div style={{ fontSize: '13px', opacity: 0.65, marginTop: '2px' }}>Tagesziel 600 kcal</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
            <ActivityRings move={move} exercise={exercise} stand={stand} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <RingLegend color="#FF3B30" label="Bewegung" value={Math.round(move * 600)} suffix="kcal" pct={move} />
              <RingLegend color="#A8E063" label="Training" value={Math.round(exercise * 60)} suffix="min" pct={exercise} />
              <RingLegend color="#00C7BE" label="Stehen" value={Math.round(stand * 12)} suffix="h" pct={stand} />
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '16px' }}>
        <StatCard t={t} icon={Footprints as LucideIcon} label="Schritte" value="8 174" grad={['#FF5722', '#FF8A65']} delay={0.08} />
        <StatCard t={t} icon={Flame as LucideIcon} label="Kalorien" value="486" grad={['#FF6F00', '#FFA726']} delay={0.12} />
        <StatCard t={t} icon={Clock as LucideIcon} label="Aktiv" value="42m" grad={['#5C6BC0', '#7986CB']} delay={0.16} />
      </div>

      <Section title="Diese Woche" action="Details" t={t}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          style={{
            backgroundColor: t.card,
            borderRadius: '24px',
            padding: '20px',
            boxShadow: t.shadow,
            border: `1px solid ${t.cardBorder}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: t.textSoft }}>Gesamt</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: t.text, letterSpacing: '-0.5px' }}>
                3 480 <span style={{ fontSize: '13px', fontWeight: 500, color: t.textSoft }}>kcal</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: t.textSoft, alignItems: 'center' }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: `linear-gradient(180deg, ${BRAND}, ${BRAND_LIGHT})` }} />
              Täglich
            </div>
          </div>
          <Sparkline t={t} />
        </motion.div>
      </Section>

      <Section title="Heute ansteht" t={t}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          onClick={() => navigate(`/fitness/workout/${lastWorkout.id}`)}
          style={{
            backgroundColor: t.card,
            borderRadius: '24px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: t.shadow,
            border: `1px solid ${t.cardBorder}`,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 20px ${BRAND}55`,
            }}
          >
            <Target size={24} color="white" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: t.text, fontSize: '15px' }}>{lastWorkout.title} in 1 Std.</div>
            <div style={{ fontSize: '12px', color: t.textSoft, marginTop: '2px' }}>
              18:00 · {lastWorkout.dur} · {lastWorkout.desc}
            </div>
          </div>
          <ChevronRight size={18} color={t.chevron} />
        </motion.div>
      </Section>

      <Section
        title="Letzte Routen"
        action={routes.length > 0 ? `${routes.length}` : undefined}
        t={t}
      >
        {routes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            style={{
              backgroundColor: t.card,
              borderRadius: '24px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: t.shadow,
              border: `1px solid ${t.cardBorder}`,
              color: t.textSoft,
              fontSize: 13,
            }}
          >
            <Footprints size={28} color={t.chevron} />
            <div>
              Noch keine Routen — beende ein Outdoor-Workout (Lauf, Rad, Trail …), um deine erste Strecke zu
              speichern.
            </div>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {routes.slice(0, 5).map((r, i) => {
              const Icon = ICONS[r.iconKey] || Footprints;
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.26 + i * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: t.card,
                    borderRadius: '22px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    boxShadow: t.shadow,
                    border: `1px solid ${t.cardBorder}`,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      flexShrink: 0,
                      background: `linear-gradient(135deg, ${r.grad[0]} 0%, ${r.grad[1]} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 6px 14px ${r.grad[0]}44`,
                    }}
                  >
                    <Icon size={22} color="white" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: t.text,
                        fontSize: 15,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {r.workoutTitle}
                    </div>
                    <div style={{ fontSize: 11, color: t.textSoft, marginTop: 2 }}>{formatRouteDate(r.finishedAt)}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        color: t.text,
                        fontSize: 16,
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-0.2px',
                      }}
                    >
                      {formatRouteDistance(r.distanceKm)}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: t.textSoft,
                        marginTop: 2,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatRouteDuration(r.durationMs)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Schnellstart" t={t}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate(`/fitness/countdown/${lastWorkout.id}`)}
          style={{
            backgroundColor: t.card,
            borderRadius: '24px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: t.shadow,
            border: `1px solid ${t.cardBorder}`,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${lastWorkout.grad[0]}, ${lastWorkout.grad[1]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 20px ${lastWorkout.grad[0]}55`,
            }}
          >
            {(() => {
              const Icon = ICONS[lastWorkout.iconKey] || Footprints;
              return <Icon size={26} color="white" />;
            })()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: t.text, fontSize: '15px' }}>{lastWorkout.title} starten</div>
            <div style={{ fontSize: '12px', color: t.textSoft, marginTop: '2px' }}>
              {lastWorkout.exercises.length} Übungen · {lastWorkout.dur}
            </div>
          </div>
          <ChevronRight size={18} color={t.chevron} />
        </motion.div>
      </Section>

      <Section title="Workouts" t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {WORKOUTS.slice(0, 4).map((w, i) => {
            const Icon = ICONS[w.iconKey] || Footprints;
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34 + i * 0.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/fitness/workout/${w.id}`)}
                style={{
                  backgroundColor: t.card,
                  borderRadius: '20px',
                  padding: '14px',
                  boxShadow: t.shadow,
                  border: `1px solid ${t.cardBorder}`,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${w.grad[0]}, ${w.grad[1]})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 6px 14px ${w.grad[0]}44`,
                    marginBottom: '8px',
                  }}
                >
                  <Icon size={18} color="white" />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: t.text }}>{w.title}</div>
                <div style={{ fontSize: '11px', color: t.textSoft, marginTop: '2px' }}>{w.dur}</div>
              </motion.div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
