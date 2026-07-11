import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Flame, Play, Dumbbell, type LucideIcon } from 'lucide-react';
import { BRAND, BRAND_LIGHT, FILTER_LABELS, ICONS, WORKOUTS } from '../data';
import { getInitialTheme, getLastWorkout } from '../utils';
import { buildTokens } from '../styles';
import type { Theme, WorkoutProfile } from '../types';
import { Section } from '../components/Section';
import { TopBar } from '../components/TopBar';

export default function Trainings() {
  const navigate = useNavigate();
  const [theme] = useState<Theme>(getInitialTheme);
  const t = useMemo(() => buildTokens(theme), [theme]);
  const [filter, setFilter] = useState<(typeof FILTER_LABELS)[number]['label']>('Alle');

  // lastWorkout wird lokal aus localStorage abgeleitet — kein Prop-Drilling mehr.
  const lastWorkout = getLastWorkout();
  const LastIcon = (ICONS[lastWorkout.iconKey] || Dumbbell) as LucideIcon;

  const items = useMemo(() => {
    const entry = FILTER_LABELS.find((f) => f.label === filter);
    if (!entry || entry.profile === 'all') return WORKOUTS;
    return WORKOUTS.filter((w) => w.profile === (entry.profile as WorkoutProfile));
  }, [filter]);

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <TopBar subtitle="Bibliothek" title="Trainings" t={t} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate(`/fitness/workout/${lastWorkout.id}`)}
        style={{
          marginTop: '8px',
          borderRadius: '28px',
          padding: '20px',
          color: 'white',
          cursor: 'pointer',
          background: `linear-gradient(135deg, #1a1a1f 0%, #2a2a30 100%)`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: t.shadowHero,
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -30,
            top: -30,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${lastWorkout.grad[0]}66 0%, transparent 70%)`,
          }}
        />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '18px',
              background: `linear-gradient(135deg, ${lastWorkout.grad[0]}, ${lastWorkout.grad[1]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 20px ${lastWorkout.grad[0]}55`,
            }}
          >
            <LastIcon size={26} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', opacity: 0.7, fontWeight: 500, letterSpacing: '0.4px' }}>SCHNELLSTART</div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>{lastWorkout.title} fortsetzen</div>
            <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '2px' }}>
              {lastWorkout.exercises.length} Übungen · {lastWorkout.dur}
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/fitness/countdown/${lastWorkout.id}`);
            }}
            style={{
              padding: '10px 18px',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: BRAND,
              color: 'white',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: `0 8px 20px ${BRAND}55`,
            }}
          >
            Start
          </motion.button>
        </div>
      </motion.div>

      <Section
        title={`${items.length} Workout${items.length === 1 ? '' : 's'}`}
        action={filter === 'Alle' ? 'Filter' : filter}
        t={t}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            marginBottom: '14px',
            paddingBottom: '4px',
            marginLeft: '-4px',
            marginRight: '-4px',
            paddingLeft: '4px',
            paddingRight: '4px',
          }}
        >
          {FILTER_LABELS.map((f) => {
            const active = filter === f.label;
            return (
              <motion.button
                key={f.label}
                whileTap={{ scale: 0.94 }}
                onClick={() => setFilter(f.label)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '14px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  background: active
                    ? `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)`
                    : t.card,
                  color: active ? 'white' : t.text,
                  boxShadow: active ? `0 6px 16px ${BRAND}55` : t.shadow,
                  borderColor: active ? 'transparent' : t.cardBorder,
                }}
              >
                {f.label}
              </motion.button>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((it, i) => {
            const Icon = (ICONS[it.iconKey] || Dumbbell) as LucideIcon;
            return (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/fitness/workout/${it.id}`)}
                style={{
                  backgroundColor: t.card,
                  borderRadius: '22px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  boxShadow: t.shadow,
                  border: `1px solid ${t.cardBorder}`,
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '18px',
                    flexShrink: 0,
                    background: `linear-gradient(135deg, ${it.grad[0]} 0%, ${it.grad[1]} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 20px ${it.grad[0]}44`,
                  }}
                >
                  <Icon size={26} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontWeight: 700, color: t.text, fontSize: '15px' }}>{it.title}</div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '8px',
                        backgroundColor: `${it.grad[0]}18`,
                        color: it.grad[0],
                      }}
                    >
                      {it.level}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: t.textSoft, marginTop: '2px' }}>{it.desc}</div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '11px', color: t.textSoft }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> {it.dur}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Flame size={11} /> {it.kcal} kcal
                    </span>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/fitness/countdown/${it.id}`);
                  }}
                  aria-label={`${it.title} starten`}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    flexShrink: 0,
                    border: 'none',
                    cursor: 'pointer',
                    background: `linear-gradient(135deg, ${it.grad[0]} 0%, ${it.grad[1]} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 20px ${it.grad[0]}55`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Play size={20} fill="white" color="white" style={{ marginLeft: 2 }} />
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
