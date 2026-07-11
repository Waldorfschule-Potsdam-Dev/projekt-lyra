import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Dumbbell,
  Droplet,
  Flame,
  Gauge,
  Pause,
  Play,
  Ruler,
  Square,
  Timer,
  type LucideIcon,
} from 'lucide-react';
import { ICONS, MAX_ROUTES, WORKOUTS } from '../data';
import { loadRoutes, saveRoutes } from '../utils';
import type { SavedRoute, SessionResult, Workout } from '../types';

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const { workoutId } = useParams<{ workoutId: string }>();
  const workout: Workout | undefined = WORKOUTS.find((w) => w.id === workoutId);

  const startedAt = useRef<number>(Date.now());
  const currentExercise = useRef<number>(0);
  const basePausedMsRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);

  const [elapsedMs, setElapsedMs] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!isPaused) {
        const now = Date.now();
        const elapsed = now - startedAt.current - basePausedMsRef.current;
        setElapsedMs(Math.max(0, elapsed));
      }
    }, 250);
    return () => clearInterval(id);
  }, [isPaused]);

  if (!workout) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
        Workout nicht gefunden.
      </div>
    );
  }

  const WorkoutIcon = (ICONS[workout.iconKey] || Dumbbell) as LucideIcon;
  const speedKmh = workout.speedKmh;
  const kcalPerMin = workout.kcalPerMin;
  const waterMlPerHour = workout.waterMlPerHour;
  const isOutdoor = workout.profile === 'outdoor' || workout.profile === 'water';
  const showPace = workout.pace === true;

  const distanceM = speedKmh > 0 ? (speedKmh / 3600) * (elapsedMs / 1000) * 1000 : 0;
  const calories = kcalPerMin * (elapsedMs / 60000);
  const waterMl = waterMlPerHour * (elapsedMs / 3600000);

  const finish = (result: SessionResult) => {
    if (result.distanceM > 0) {
      const newRoute: SavedRoute = {
        id: `route_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        workoutId: result.workout.id,
        workoutTitle: result.workout.title,
        iconKey: result.workout.iconKey,
        grad: result.workout.grad,
        distanceKm: result.distanceM / 1000,
        durationMs: result.elapsedMs,
        finishedAt: Date.now(),
      };
      const existing = loadRoutes();
      const next = [newRoute, ...existing].slice(0, MAX_ROUTES);
      saveRoutes(next);
    }
  };

  const stop = () => {
    const finalMs = elapsedMs;
    const finalDistanceM = speedKmh > 0 ? (speedKmh / 3600) * (finalMs / 1000) * 1000 : 0;
    finish({ workout, elapsedMs: finalMs, distanceM: finalDistanceM });
    navigate(`/fitness/trainings`, { replace: true });
  };

  const togglePause = () => {
    if (isPaused) {
      basePausedMsRef.current += Date.now() - (pauseStartRef.current ?? Date.now());
      pauseStartRef.current = null;
    } else {
      pauseStartRef.current = Date.now();
    }
    setIsPaused(!isPaused);
  };

  const statTiles = isOutdoor
    ? [
        {
          label: 'STRECKE',
          value: distanceM >= 1000 ? `${(distanceM / 1000).toFixed(2)} km` : `${Math.round(distanceM)} m`,
          icon: <Ruler size={24} />,
          color: workout.grad[0],
        },
        {
          label: showPace ? 'PACE' : 'SPEED',
          value: showPace
            ? speedKmh > 0
              ? `${(60 / speedKmh).toFixed(1)} min/km`
              : '—'
            : `${speedKmh.toFixed(1)} km/h`,
          icon: <Gauge size={24} />,
          color: workout.grad[0],
        },
        {
          label: 'KALORIEN',
          value: `${Math.round(calories)} kcal`,
          icon: <Flame size={24} fill={workout.grad[0]} color={workout.grad[0]} />,
          color: workout.grad[0],
        },
        {
          label: 'WASSER',
          value: `${Math.round(waterMl)} ml`,
          icon: <Droplet size={24} />,
          color: workout.grad[0],
        },
      ]
    : [
        { label: 'ZEIT', value: formatTime(elapsedMs), icon: <Timer size={24} />, color: workout.grad[0] },
        {
          label: 'ÜBUNG',
          value: `${currentExercise.current + 1} / ${workout.exercises.length}`,
          icon: <Dumbbell size={24} />,
          color: workout.grad[0],
        },
        {
          label: 'KALORIEN',
          value: `${Math.round(calories)} kcal`,
          icon: <Flame size={24} fill={workout.grad[0]} color={workout.grad[0]} />,
          color: workout.grad[0],
        },
        {
          label: 'WASSER',
          value: `${Math.round(waterMl)} ml`,
          icon: <Droplet size={24} />,
          color: workout.grad[0],
        },
      ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${workout.grad[0]} 0%, ${workout.grad[1]} 100%)`,
      }}
    >
      <div
        style={{
          padding: '16px 20px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <motion.button
          onClick={stop}
          whileTap={{ scale: 0.9 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            border: 'none',
            background: 'rgba(255,255,255,0.18)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Square size={18} strokeWidth={2} />
        </motion.button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '13px', opacity: 0.8, fontWeight: 500, letterSpacing: '0.4px' }}>LIVE</div>
          <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{workout.title}</div>
        </div>
        <WorkoutIcon size={24} color="white" style={{ opacity: 0.9 }} />
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 20px',
        }}
      >
        <motion.div
          key={formatTime(elapsedMs)}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          style={{
            fontSize: '64px',
            fontWeight: 900,
            color: 'white',
            textAlign: 'center',
            letterSpacing: '-2px',
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 4px 24px rgba(0,0,0,0.2)',
          }}
        >
          {formatTime(elapsedMs)}
        </motion.div>

        <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {statTiles.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(16px)',
                borderRadius: '24px',
                padding: '24px 16px',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                }}
              >
                <span
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${s.color} 0%, ${s.color}CC 100%)`,
                  }}
                >
                  {s.icon}
                </span>
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: 'white',
                  letterSpacing: '-0.5px',
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.7)',
                  marginTop: '4px',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}
              >
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', gap: '16px' }}>
        <motion.button
          onClick={togglePause}
          whileTap={{ scale: 0.97 }}
          style={{
            flex: 1,
            padding: '16px',
            borderRadius: '18px',
            border: 'none',
            background: isPaused
              ? 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'
              : 'rgba(255,255,255,0.18)',
            color: 'white',
            fontWeight: 700,
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          {isPaused ? <Play size={20} fill="white" /> : <Pause size={20} />}
          <span>{isPaused ? 'Fortsetzen' : 'Pause'}</span>
        </motion.button>
        <motion.button
          onClick={stop}
          whileTap={{ scale: 0.97 }}
          style={{
            flex: 1,
            padding: '16px',
            borderRadius: '18px',
            border: 'none',
            background: 'rgba(255,255,255,0.18)',
            color: 'white',
            fontWeight: 700,
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          <Square size={20} strokeWidth={2.5} />
          <span>Beenden</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
