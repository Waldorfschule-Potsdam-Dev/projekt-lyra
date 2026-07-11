import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Flag } from 'lucide-react';

function pad(n: number, w = 2) {
  return n.toString().padStart(w, '0');
}

function formatMs(totalMs: number) {
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const centis = Math.floor((totalMs % 1000) / 10);
  return {
    hh: pad(hours),
    mm: pad(minutes),
    ss: pad(seconds),
    cc: pad(centis),
    hasHours: hours > 0,
  };
}

function formatLap(ms: number) {
  const { hh, mm, ss, cc, hasHours } = formatMs(ms);
  return hasHours ? `${hh}:${mm}:${ss}.${cc}` : `${mm}:${ss}.${cc}`;
}

type Lap = { id: number; total: number; split: number };

export default function StopwatchTab() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const nextLapIdRef = useRef(1);

  useEffect(() => {
    if (running) {
      startRef.current = performance.now();
      const tick = () => {
        if (startRef.current === null) return;
        setElapsed(baseRef.current + (performance.now() - startRef.current));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (startRef.current !== null) {
        baseRef.current = baseRef.current + (performance.now() - startRef.current);
        startRef.current = null;
        setElapsed(baseRef.current);
      }
    }
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [running]);

  const start = () => setRunning(true);

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
    baseRef.current = 0;
    startRef.current = null;
  };

  const addLap = () => {
    setLaps((prev) => {
      const lastTotal = prev.length ? prev[0].total : 0;
      const split = elapsed - lastTotal;
      const newLap: Lap = { id: nextLapIdRef.current++, total: elapsed, split };
      return [newLap, ...prev];
    });
  };

  const { hh, mm, ss, cc, hasHours } = formatMs(elapsed);
  const hasTime = elapsed > 0;
  const hasLaps = laps.length > 0;

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px 16px',
      }}
    >
      <div
        style={{
          fontSize: hasHours ? 56 : 72,
          fontWeight: 200,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: 2,
          textAlign: 'center',
          marginTop: 24,
          color: '#fff',
          textShadow: '0 4px 24px rgba(208, 188, 255, 0.3)',
        }}
      >
        {hasHours ? `${hh}:` : ''}
        {mm}
        <span style={{ opacity: 0.5 }}>:</span>
        {ss}
        <span style={{ fontSize: hasHours ? 32 : 40, opacity: 0.6, marginLeft: 4, color: '#EADDFF' }}>
          .{cc}
        </span>
      </div>

      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px 16px',
          gap: 12,
        }}
      >
        <button
          onClick={running ? addLap : reset}
          disabled={!running && !hasTime}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#1F1B2E',
            border: '1px solid #4F378B',
            color: !running && !hasTime ? '#49454F' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: !running && !hasTime ? 'not-allowed' : 'pointer',
            fontSize: 12,
            fontWeight: 500,
            boxShadow: '0 3px 8px rgba(79, 55, 139, 0.3)',
          }}
        >
          {running ? <Flag size={20} /> : 'Reset'}
        </button>

        <button
          onClick={() => (running ? setRunning(false) : start())}
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: running
              ? 'linear-gradient(135deg, #ff6b61 0%, #ff453a 100%)'
              : 'linear-gradient(135deg, #EADDFF 0%, #D0BCFF 50%, #B69DF8 100%)',
            border: running ? '1px solid rgba(255, 100, 90, 0.4)' : '1px solid rgba(234, 221, 255, 0.4)',
            color: running ? '#fff' : '#21005D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: running
              ? '0 8px 24px rgba(255, 69, 58, 0.55), 0 0 60px rgba(255, 69, 58, 0.3)'
              : '0 8px 24px rgba(208, 188, 255, 0.55), 0 0 60px rgba(208, 188, 255, 0.3)',
          }}
          aria-label={running ? 'Stopp' : 'Start'}
        >
          {running ? <Pause size={36} /> : <Play size={36} style={{ marginLeft: 3 }} />}
        </button>

        <button
          onClick={addLap}
          disabled={!running}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#1F1B2E',
            border: '1px solid #4F378B',
            color: running ? '#fff' : '#49454F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: running ? 'pointer' : 'not-allowed',
            boxShadow: '0 3px 8px rgba(79, 55, 139, 0.3)',
          }}
          aria-label="Runde"
        >
          <Flag size={20} />
        </button>
      </div>

      {hasLaps && (
        <div
          style={{
            borderTop: '1px solid rgba(79, 55, 139, 0.4)',
            maxHeight: 220,
            overflowY: 'auto',
            background: 'linear-gradient(180deg, rgba(42, 34, 64, 0.5), transparent)',
          }}
        >
          {laps.map((lap, idx) => (
            <div
              key={lap.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: '1px solid rgba(79, 55, 139, 0.2)',
              }}
            >
              <div style={{ fontSize: 13, color: '#EADDFF', fontWeight: 500 }}>
                Runde {laps.length - idx}
              </div>
              <div style={{ display: 'flex', gap: 24, fontVariantNumeric: 'tabular-nums' }}>
                <span style={{ fontSize: 14, color: '#9E94B0' }}>{formatLap(lap.split)}</span>
                <span style={{ fontSize: 14, color: '#fff', minWidth: 90, textAlign: 'right' }}>
                  {formatLap(lap.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}