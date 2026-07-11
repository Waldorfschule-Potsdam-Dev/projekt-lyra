import { useMemo, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Overview from './pages/Overview';
import Trainings from './pages/Trainings';
import Profile from './pages/Profile';
import WorkoutDetail from './pages/WorkoutDetail';
import CountdownOverlay from './pages/CountdownOverlay';
import ActiveWorkout from './pages/ActiveWorkout';
import { BottomNav } from './components/BottomNav';
import { getInitialTheme } from './utils';
import { buildTokens } from './styles';
import type { Theme } from './types';
import { Lock } from 'lucide-react';

const STORAGE_KEY_PAID = 'fitness-paid';

function FitnessLockScreen() {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 24px',
      backgroundColor: '#111214',
      backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(200,50,50,0.15) 0%, transparent 60%)',
      color: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{
          width: 88,
          height: 88,
          borderRadius: '28px',
          backgroundColor: '#1E1F22',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <Lock size={36} color="#FF453A" style={{ filter: 'drop-shadow(0 0 12px rgba(255,69,58,0.4))' }} />
        </div>

        <h2 style={{ margin: '0 0 16px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Wir vermissen dich!
        </h2>
        
        <p style={{ margin: '0 0 40px', fontSize: 15, lineHeight: 1.6, color: '#A0A0A5', fontWeight: 400 }}>
          Wie schade, dass du gegangen bist! Dein Zugang ist derzeit pausiert. Wir würden uns wahnsinnig freuen, dich bald wieder bei uns im Studio begrüßen zu dürfen.
        </p>

        <div style={{ width: '100%' }}>
          <details style={{
            backgroundColor: '#1A1B1E',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
            overflow: 'hidden',
          }}>
            <summary style={{
              padding: '20px 24px',
              fontSize: 15,
              fontWeight: 600,
              color: '#E0E0E5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              listStyle: 'none',
              outline: 'none',
              gap: 10,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#FF453A', boxShadow: '0 0 8px #FF453A' }} />
              Jetzt Zugang reaktivieren
            </summary>
            
            <div style={{ padding: '0 24px 24px', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <p style={{ fontSize: 13, color: '#8E8E93', marginBottom: 20, lineHeight: 1.5, marginTop: 20 }}>
                Bitte gleiche deinen offenen Saldo einfach über deine Banking-App aus, um sofort wieder vollen Zugriff auf deine Trainingspläne zu erhalten.
              </p>
              
              <div style={{ backgroundColor: '#141517', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#8E8E93' }}>Offener Betrag</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>49,99 €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#8E8E93' }}>Empfängerkonto</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#FFD60A', letterSpacing: '1px', fontFamily: 'monospace' }}>8877 6655 44</span>
                </div>
              </div>
            </div>
          </details>
        </div>
      </motion.div>
    </div>
  );
}

type TabId = 'overview' | 'trainings' | 'profile';

function TabShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme] = useState<Theme>('dark');
  const t = useMemo(() => buildTokens(theme), [theme]);

  const active: TabId =
    location.pathname === '/fitness/trainings'
      ? 'trainings'
      : location.pathname === '/fitness/profile'
        ? 'profile'
        : 'overview';

  const onChange = (id: TabId) => {
    if (id === 'overview') navigate('/fitness');
    else navigate(`/fitness/${id}`);
  };

  return (
    <motion.div
      animate={{ backgroundColor: t.bg }}
      transition={{ duration: 0.25 }}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.div
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: `radial-gradient(circle at 0% 0%, ${t.bgGlow1} 0%, transparent 40%), radial-gradient(circle at 100% 0%, ${t.bgGlow2} 0%, transparent 40%)`,
        }}
      />
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Outlet />
      </div>
      <BottomNav active={active} onChange={onChange} t={t} />
    </motion.div>
  );
}

export default function FitnessApp() {
  const [paid, setPaid] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY_PAID) === 'true'; }
    catch { return false; }
  });

  useEffect(() => {
    const handleStorage = () => {
      try { setPaid(localStorage.getItem(STORAGE_KEY_PAID) === 'true'); }
      catch { /* ignore */ }
    };
    window.addEventListener('storage', handleStorage);
    // Custom event to allow immediate update within the same window
    window.addEventListener('fitness-paid-event', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('fitness-paid-event', handleStorage);
    };
  }, []);

  if (!paid) {
    return <FitnessLockScreen />;
  }

  return (
    <Routes>
      <Route element={<TabShell />}>
        <Route index element={<Overview />} />
        <Route path="trainings" element={<Trainings />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="workout/:workoutId" element={<WorkoutDetail />} />
      <Route path="countdown/:workoutId" element={<CountdownOverlay />} />
      <Route path="active/:workoutId" element={<ActiveWorkout />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
