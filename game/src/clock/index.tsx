import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { Clock, Timer as TimerIcon, AlarmClock, TimerReset, Settings } from 'lucide-react';
import ClockTab from './tabs/ClockTab';
import TimerTab from './tabs/TimerTab';
import AlarmTab from './tabs/AlarmTab';
import StopwatchTab from './tabs/StopwatchTab';

type TabKey = 'uhrzeit' | 'timer' | 'stoppuhr' | 'wecker';

const TABS: { key: TabKey; label: string; Icon: typeof Clock }[] = [
  { key: 'uhrzeit', label: 'Uhrzeit', Icon: Clock },
  { key: 'timer', label: 'Timer', Icon: TimerIcon },
  { key: 'stoppuhr', label: 'Stoppuhr', Icon: TimerReset },
  { key: 'wecker', label: 'Wecker', Icon: AlarmClock },
];

const ACCENT = '#EADDFF';
const INACTIVE = '#9E94B0';

export default function UhrApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = useMemo(() => {
    return TABS.find(t => location.pathname.includes(t.key))?.key || 'uhrzeit';
  }, [location.pathname]);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#000',
        color: '#E6E1E5',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-40%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '160%',
          height: '70%',
          background:
            'radial-gradient(ellipse, rgba(208, 188, 255, 0.22) 0%, rgba(79, 55, 139, 0.12) 35%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Settings link — visible on all tabs */}
      <Link
        to="/settings/datetime"
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 34,
          height: 34,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(78, 55, 139, 0.3)',
          border: '1px solid rgba(110, 79, 190, 0.35)',
          color: '#EADDFF',
          backdropFilter: 'blur(6px)',
          textDecoration: 'none',
          zIndex: 10,
        }}
        title="Datum & Uhrzeit einstellen"
      >
        <Settings size={15} strokeWidth={1.8} />
      </Link>
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '-20%',
          width: '60%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(110, 79, 190, 0.18) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '30%',
          right: '-20%',
          width: '60%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(79, 55, 139, 0.2) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          zIndex: 1,
          paddingTop: 56,
        }}
      >
        <Routes location={location}>
          <Route path="uhrzeit" element={<ClockTab />} />
          <Route path="timer" element={<TimerTab />} />
          <Route path="stoppuhr" element={<StopwatchTab />} />
          <Route path="wecker" element={<AlarmTab />} />
          <Route path="*" element={<Navigate to="uhrzeit" replace />} />
        </Routes>
      </div>

      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '12px 0 16px',
          background: 'linear-gradient(to top, rgba(15, 11, 22, 0.95) 0%, rgba(29, 27, 32, 0.85) 100%)',
          borderTop: '1px solid rgba(79, 55, 139, 0.5)',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {TABS.map(({ key, label, Icon }) => {
          const active = currentTab === key;
          return (
            <button
              key={key}
              onClick={() => navigate('/clock/' + key)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '0 4px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: active ? ACCENT : INACTIVE,
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: 64,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {active && (
                  <motion.div
                    layoutId="tab-indicator"
                    style={{
                      position: 'absolute',
                      width: 64,
                      height: 32,
                      borderRadius: 16,
                      background:
                        'linear-gradient(135deg, rgba(208, 188, 255, 0.35) 0%, rgba(234, 221, 255, 0.2) 100%)',
                      boxShadow: '0 0 20px rgba(208, 188, 255, 0.35)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon
                  size={24}
                  strokeWidth={active ? 2 : 1.5}
                  style={{ position: 'relative', zIndex: 1 }}
                />
              </div>
              <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, letterSpacing: 0.2 }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}