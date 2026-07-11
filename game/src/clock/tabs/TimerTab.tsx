import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Moon } from 'lucide-react';

const PRESETS = [
  { label: '1 Min', seconds: 60 },
  { label: '3 Min', seconds: 180 },
  { label: '5 Min', seconds: 300 },
  { label: '10 Min', seconds: 600 },
  { label: '15 Min', seconds: 900 },
  { label: '30 Min', seconds: 1800 },
];

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

const stepperBtn: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: '#1F1B2E',
  border: '1px solid #4F378B',
  color: '#EADDFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(79, 55, 139, 0.25)',
};

const presetBtn: React.CSSProperties = {
  padding: '14px 8px',
  background: 'linear-gradient(180deg, #2A2240 0%, #1F1B2E 100%)',
  color: '#EADDFF',
  border: '1px solid #4F378B',
  borderRadius: 16,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
};

export default function TimerTab() {
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [justFinished, setJustFinished] = useState(false);
  const [showBedtime, setShowBedtime] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            setJustFinished(true);
            setShowBedtime(true);
            if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
            finishTimerRef.current = window.setTimeout(() => setJustFinished(false), 3000);
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  useEffect(() => {
    return () => {
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, []);

  const start = () => {
    if (remaining > 0) setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setRemaining(0);
    setJustFinished(false);
    setShowBedtime(false);
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
  };

  const setPreset = (seconds: number) => {
    setRunning(false);
    setRemaining(seconds);
  };

  const adjust = (unit: 'h' | 'm' | 's', delta: number) => {
    if (running) return;
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    let nh = h;
    let nm = m;
    let ns = s;
    if (unit === 'h') nh = Math.max(0, Math.min(23, h + delta));
    if (unit === 'm') nm = Math.max(0, Math.min(59, m + delta));
    if (unit === 's') ns = Math.max(0, Math.min(59, s + delta));
    setRemaining(nh * 3600 + nm * 60 + ns);
  };

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const showTime = `${pad(h)}:${pad(m)}:${pad(s)}`;
  const hasTime = remaining > 0;

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px 16px',
        position: 'relative',
      }}
    >
      <div
        style={{
          fontSize: 64,
          fontWeight: 200,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: 4,
          marginTop: 24,
          color: '#fff',
          textShadow: '0 4px 24px rgba(208, 188, 255, 0.3)',
        }}
      >
        {showTime}
      </div>

      <div
        style={{
          marginTop: 8,
          height: 24,
          color: '#EADDFF',
          fontSize: 16,
          fontWeight: 500,
          textShadow: '0 0 12px rgba(208, 188, 255, 0.5)',
        }}
      >
        {justFinished && 'Zeit ist um!'}
      </div>

      {!running && remaining === 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            width: '100%',
            maxWidth: 360,
            marginTop: 24,
          }}
        >
          {PRESETS.map((p) => (
            <button key={p.label} onClick={() => setPreset(p.seconds)} style={presetBtn}>
              {p.label}
            </button>
          ))}
        </div>
      )}

      {!running && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: 24,
            marginTop: 24,
          }}
        >
          {(['h', 'm', 's'] as const).map((unit) => {
            const label = unit === 'h' ? 'Std' : unit === 'm' ? 'Min' : 'Sek';
            return (
              <div key={unit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <button onClick={() => adjust(unit, 1)} style={stepperBtn} aria-label={`${label} erhöhen`}>
                  <Plus size={20} />
                </button>
                <div style={{ fontSize: 11, color: '#9E94B0', letterSpacing: 0.5 }}>{label}</div>
                <button onClick={() => adjust(unit, -1)} style={stepperBtn} aria-label={`${label} verringern`}>
                  <Minus size={20} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          paddingBottom: 16,
        }}
      >
        {hasTime && (
          <button
            onClick={reset}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#1F1B2E',
              border: '1px solid #4F378B',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(79, 55, 139, 0.3)',
            }}
            aria-label="Zurücksetzen"
          >
            <RotateCcw size={22} />
          </button>
        )}
        <button
          onClick={() => (running ? setRunning(false) : start())}
          disabled={!hasTime}
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: hasTime
              ? 'linear-gradient(135deg, #EADDFF 0%, #D0BCFF 50%, #B69DF8 100%)'
              : '#1F1B2E',
            border: hasTime ? '1px solid rgba(234, 221, 255, 0.4)' : '1px solid #4F378B',
            color: hasTime ? '#21005D' : '#49454F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: hasTime ? 'pointer' : 'not-allowed',
            boxShadow: hasTime
              ? '0 8px 24px rgba(208, 188, 255, 0.55), 0 0 60px rgba(208, 188, 255, 0.3)'
              : 'none',
          }}
          aria-label={running ? 'Pausieren' : 'Starten'}
        >
          {running ? <Pause size={36} /> : <Play size={36} style={{ marginLeft: 3 }} />}
        </button>
      </div>

      {showBedtime && (
        <div
          onClick={() => setShowBedtime(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              background: '#FAFAFA',
              padding: '44px 56px',
              borderRadius: 28,
              textAlign: 'center',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              maxWidth: '85%',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <Moon size={48} color="#000" strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#000', letterSpacing: 0.5 }}>
              Schlafenszeit
            </div>
            <div style={{ fontSize: 12, color: '#777', marginTop: 14 }}>
              Tippen zum Schließen
            </div>
          </div>
        </div>
      )}
    </div>
  );
}