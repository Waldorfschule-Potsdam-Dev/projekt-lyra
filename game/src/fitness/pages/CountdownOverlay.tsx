import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { WORKOUTS } from '../data';
import type { Workout } from '../types';

export default function CountdownOverlay() {
  const navigate = useNavigate();
  const { workoutId } = useParams<{ workoutId: string }>();
  const workout: Workout | undefined = WORKOUTS.find((w) => w.id === workoutId);
  const [n, setN] = useState<number>(3);

  useEffect(() => {
    if (!workout) return;
    const id1 = setTimeout(() => setN(2), 1000);
    const id2 = setTimeout(() => setN(1), 2000);
    const id3 = setTimeout(() => setN(0), 3000);
    const id4 = setTimeout(() => {
      navigate(`/fitness/active/${workout.id}`, { replace: true });
    }, 3500);
    return () => {
      clearTimeout(id1);
      clearTimeout(id2);
      clearTimeout(id3);
      clearTimeout(id4);
    };
  }, [workout, navigate]);

  if (!workout) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
        Workout nicht gefunden.
      </div>
    );
  }

  const label = n === 0 ? 'GO!' : String(n);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
        background: `linear-gradient(135deg, ${workout.grad[0]} 0%, ${workout.grad[1]} 100%)`,
        color: 'white',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 'clamp(120px, 32vw, 200px)' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={n}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              fontSize: 'clamp(80px, 28vw, 160px)',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              textShadow: '0 8px 32px rgba(0,0,0,0.3)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          marginTop: '20px',
          fontSize: '15px',
          fontWeight: 500,
          opacity: 0.9,
          textAlign: 'center',
          maxWidth: '90%',
        }}
      >
        {workout.title} startet
      </motion.div>
    </div>
  );
}
