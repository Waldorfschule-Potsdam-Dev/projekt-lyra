import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Dumbbell, Flame, Play, Repeat, type LucideIcon } from 'lucide-react';
import { ICONS, WORKOUTS } from '../data';
import { getInitialTheme } from '../utils';
import { buildTokens } from '../styles';
import type { Theme, Workout } from '../types';
import { DetailStat } from '../components/DetailStat';

export default function WorkoutDetail() {
  const navigate = useNavigate();
  const { workoutId } = useParams<{ workoutId: string }>();
  const workout: Workout | undefined = WORKOUTS.find((w) => w.id === workoutId);
  const [theme] = useState<Theme>(getInitialTheme);
  const t = useMemo(() => buildTokens(theme), [theme]);

  if (!workout) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
        <div style={{ fontSize: 16, marginBottom: 12 }}>Workout nicht gefunden.</div>
        <button
          onClick={() => navigate('/fitness/trainings')}
          style={{
            padding: '10px 20px',
            borderRadius: 12,
            border: 'none',
            background: '#FF5722',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Zurück
        </button>
      </div>
    );
  }

  const Icon = (ICONS[workout.iconKey] || Dumbbell) as LucideIcon;

  return (
    <motion.div
      key="detail-wrap"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{ paddingBottom: '120px' }}
    >
      <div
        style={{
          margin: '8px 16px 0',
          borderRadius: '32px',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${workout.grad[0]} 0%, ${workout.grad[1]} 100%)`,
          color: 'white',
          position: 'relative',
          boxShadow: `0 16px 40px ${workout.grad[0]}55`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
          }}
        />
        <div style={{ position: 'relative', padding: '14px 20px 24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <motion.button
              onClick={() => navigate(-1)}
              whileTap={{ scale: 0.9 }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                border: 'none',
                backgroundColor: 'rgba(255,255,255,0.18)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
              }}
            >
              <ArrowLeft size={18} />
            </motion.button>
            <div
              style={{
                padding: '4px 10px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                fontSize: '11px',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
              }}
            >
              {workout.level}
            </div>
          </div>

          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '22px',
              marginTop: '8px',
              backgroundColor: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.25)',
            }}
          >
            <Icon size={32} color="white" />
          </div>

          <div
            style={{
              fontSize: '13px',
              opacity: 0.85,
              marginTop: '14px',
              fontWeight: 500,
              letterSpacing: '0.4px',
            }}
          >
            WORKOUT
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '2px', letterSpacing: '-0.8px' }}>
            {workout.title}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.85, marginTop: '4px' }}>{workout.desc}</div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              marginTop: '20px',
            }}
          >
            <DetailStat icon={Clock as LucideIcon} value={workout.dur} label="Dauer" />
            <DetailStat icon={Flame as LucideIcon} value={`${workout.kcal}`} label="kcal" />
            <DetailStat icon={Repeat as LucideIcon} value={`${workout.exercises.length}`} label="Übungen" />
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px', marginTop: '24px' }}>
        <div
          style={{
            fontSize: '17px',
            fontWeight: 700,
            color: t.text,
            marginBottom: '12px',
            letterSpacing: '-0.2px',
          }}
        >
          Übungen
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {workout.exercises.map((ex, i) => (
            <motion.div
              key={ex.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              style={{
                backgroundColor: t.card,
                borderRadius: '18px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: t.shadow,
                border: `1px solid ${t.cardBorder}`,
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  flexShrink: 0,
                  background: `linear-gradient(135deg, ${workout.grad[0]}25, ${workout.grad[1]}15)`,
                  color: workout.grad[0],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: t.text, fontSize: '14px' }}>{ex.name}</div>
                <div style={{ fontSize: '11px', color: t.textSoft, marginTop: '2px' }}>
                  {ex.muscle} · Pause {ex.rest}
                </div>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '6px 10px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${workout.grad[0]}18, ${workout.grad[1]}10)`,
                  color: workout.grad[0],
                  whiteSpace: 'nowrap',
                }}
              >
                {ex.sets}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate(`/fitness/countdown/${workout.id}`)}
        style={{
          position: 'fixed',
          left: 16,
          right: 16,
          bottom: 16,
          zIndex: 100,
          padding: '18px',
          borderRadius: '20px',
          border: 'none',
          background: `linear-gradient(135deg, ${workout.grad[0]} 0%, ${workout.grad[1]} 100%)`,
          color: 'white',
          fontWeight: 700,
          fontSize: '16px',
          cursor: 'pointer',
          boxShadow: `0 12px 30px ${workout.grad[0]}66`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          letterSpacing: '0.2px',
        }}
      >
        <Play size={20} fill="white" />
        Training starten
      </motion.button>
    </motion.div>
  );
}
