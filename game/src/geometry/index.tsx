import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Settings as SettingsIcon, BarChart3, Trophy, ShoppingBag, User, ChevronLeft, RotateCcw, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { BRAND, type Level, LEVELS, getProgress, saveProgress, getBest, setBest, getAttempts, bumpAttempts } from './data';
import { CollectClueButton } from '../components/CollectClueButton';

export default function GeometryApp() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0a0a14', overflow: 'hidden' }}>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="levels" element={<LevelSelect />} />
        <Route path="stats" element={<StatsScreen />} />
        <Route path="game/:id" element={<GameScreen />} />
      </Routes>
    </div>
  );
}

function NeonGridBg({ color = '#8E44AD' }: { color?: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 30%, ${color}33 0%, transparent 60%), linear-gradient(180deg, #0a0a14 0%, #1a0a2e 100%)`
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(${color}22 1px, transparent 1px),
          linear-gradient(90deg, ${color}22 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        transform: 'perspective(400px) rotateX(60deg) translateY(40%)',
        transformOrigin: 'center top',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)'
      }} />
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.4, 0.8] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 20}%`,
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
          }}
        />
      ))}
    </div>
  );
}

function GDLogo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.div
          animate={{ rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #00E1FF, #8E44AD)',
            borderRadius: 6,
            boxShadow: '0 0 24px rgba(142,68,173,0.7), inset 0 0 12px rgba(255,255,255,0.3)',
          }}
        />
        <div style={{
          fontFamily: 'Impact, "Arial Black", sans-serif',
          fontSize: 32,
          fontWeight: 900,
          letterSpacing: 1,
          background: 'linear-gradient(180deg, #fff 0%, #8E44AD 60%, #5B2C6F 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1,
        }}>
          SQUARE
        </div>
        <motion.div
          animate={{ rotate: [0, -90, -180, -270, -360] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 30, height: 30,
            background: 'linear-gradient(135deg, #FF6B6B, #FFD60A)',
            clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
            boxShadow: '0 0 24px rgba(255,214,10,0.6)',
          }}
        />
      </div>
      <div style={{
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: 48,
        fontWeight: 900,
        letterSpacing: 6,
        background: 'linear-gradient(180deg, #FFD60A 0%, #FF6B00 50%, #FF006E 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        lineHeight: 1,
        marginTop: -2,
      }}>
        JUMP
      </div>
    </div>
  );
}

function MainMenu() {
  const nav = useNavigate();
  const [best, setBestState] = useState(getBest());
  const [attempts, setAttemptsState] = useState(getAttempts());
  const [, force] = useState(0);

  return (
    <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <NeonGridBg color={BRAND} />

      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '40px 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#aaa', fontSize: 12, fontWeight: 600 }}>
            <User size={14} /> Spieler
          </div>
          <div style={{ color: '#FFD60A', fontSize: 12, fontWeight: 700, textShadow: '0 0 8px rgba(255,214,10,0.6)' }}>
            ⭐ {best}%
          </div>
        </div>

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ marginTop: 8 }}
        >
          <GDLogo />
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setBestState(getBest()); setAttemptsState(getAttempts()); nav('/geometry/levels'); force(x => x + 1); }}
            style={{
              width: '85%', maxWidth: 280, padding: '16px 0',
              background: 'linear-gradient(180deg, #00E1FF 0%, #0077B6 100%)',
              border: '3px solid #fff',
              borderRadius: 12,
              color: 'white', fontSize: 22, fontWeight: 900,
              letterSpacing: 3,
              cursor: 'pointer',
              boxShadow: '0 0 30px rgba(0,225,255,0.6), inset 0 -4px 0 rgba(0,0,0,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <Play size={24} fill="white" /> PLAY
          </motion.button>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, width: '85%', maxWidth: 280, marginTop: 6 }}>
            <IconBtn onClick={() => nav('/geometry/stats')}><BarChart3 size={20} color="white" /></IconBtn>
            <IconBtn onClick={() => alert('Errungenschaften — bald verfügbar')}><Trophy size={20} color="white" /></IconBtn>
            <IconBtn onClick={() => alert('Shop — bald verfügbar')}><ShoppingBag size={20} color="white" /></IconBtn>
            <IconBtn onClick={() => alert('Einstellungen — bald verfügbar')}><SettingsIcon size={20} color="white" /></IconBtn>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 12 }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: 2 }}>SPIELE: {attempts}</div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, letterSpacing: 1 }}>v 1.0 · SQUARE JUMP</div>
          <div style={{ marginTop: 16 }}>
            <CollectClueButton clueId="games:geometry" />
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{
        aspectRatio: '1', border: '2px solid rgba(255,255,255,0.2)',
        borderRadius: 10, background: 'rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', backdropFilter: 'blur(4px)',
      }}
    >
      {children}
    </motion.button>
  );
}

function LevelSelect() {
  const nav = useNavigate();
  return (
    <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <NeonGridBg color={BRAND} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={() => nav('/geometry')} style={backBtnStyle}>
          <ChevronLeft size={20} color="white" />
        </button>
        <div style={{ flex: 1, textAlign: 'center', color: 'white', fontWeight: 800, fontSize: 18, letterSpacing: 2, paddingRight: 36 }}>
          LEVELS
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 24px', position: 'relative' }}>
        {LEVELS.map((lv, idx) => {
          const prog = getProgress(lv.id);
          return (
            <motion.button
              key={lv.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => nav(`/geometry/game/${lv.id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', marginBottom: 10, padding: 10,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${lv.color1} 0%, ${lv.color2} 100%)`,
                border: '2px solid rgba(255,255,255,0.15)',
                boxShadow: `0 4px 16px ${lv.color2}66`,
                cursor: 'pointer', textAlign: 'left', color: 'white',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'rgba(0,0,0,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 900, fontFamily: 'Impact, sans-serif',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                flexShrink: 0,
              }}>
                {idx + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 0.5, textShadow: '0 1px 2px rgba(0,0,0,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {lv.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <div key={n} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: n <= lv.diff ? '#FFD60A' : 'rgba(255,255,255,0.2)',
                      boxShadow: n <= lv.diff ? '0 0 6px #FFD60A' : 'none',
                    }} />
                  ))}
                  <div style={{ flex: 1, height: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 2, marginLeft: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${prog}%`, height: '100%', background: '#fff', borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, minWidth: 28, textAlign: 'right' }}>{prog}%</div>
                </div>
              </div>
              <Play size={18} fill="white" color="white" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

const backBtnStyle: React.CSSProperties = {
  position: 'absolute', left: 8, top: 8,
  width: 36, height: 36, borderRadius: '50%',
  background: 'rgba(255,255,255,0.1)', border: 'none',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', zIndex: 2,
};

function StatsScreen() {
  const nav = useNavigate();
  const best = getBest();
  const attempts = getAttempts();
  const total = LEVELS.reduce((sum, lv) => sum + getProgress(lv.id), 0);
  const cleared = LEVELS.filter(lv => getProgress(lv.id) >= 100).length;
  return (
    <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <NeonGridBg color={BRAND} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={() => nav('/geometry')} style={backBtnStyle}>
          <ChevronLeft size={20} color="white" />
        </button>
        <div style={{ flex: 1, textAlign: 'center', color: 'white', fontWeight: 800, fontSize: 18, letterSpacing: 2, paddingRight: 36 }}>
          STATISTIK
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
        <StatCard label="Bester Run" value={`${best}%`} accent="#FFD60A" />
        <StatCard label="Versuche" value={String(attempts)} accent="#00E1FF" />
        <StatCard label="Level gemeistert" value={`${cleared} / ${LEVELS.length}`} accent="#06D6A0" />
        <StatCard label="Gesamtfortschritt" value={`${Math.round(total / LEVELS.length)}%`} accent="#FF6B6B" />

        <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, letterSpacing: 1, paddingLeft: 4 }}>
          PRO LEVEL
        </div>
        {LEVELS.map(lv => (
          <div key={lv.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: '8px 12px',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: lv.color1, boxShadow: `0 0 6px ${lv.color1}` }} />
            <div style={{ flex: 1, color: 'white', fontSize: 13, fontWeight: 600 }}>{lv.name}</div>
            <div style={{ color: '#FFD60A', fontSize: 13, fontWeight: 700 }}>{getProgress(lv.id)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: `1px solid ${accent}55`,
      borderLeft: `4px solid ${accent}`,
      borderRadius: 12, padding: '14px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: `0 0 16px ${accent}22`,
    }}>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>{label.toUpperCase()}</div>
      <div style={{ color: accent, fontSize: 24, fontWeight: 900, fontFamily: 'Impact, sans-serif', textShadow: `0 0 12px ${accent}88` }}>
        {value}
      </div>
    </div>
  );
}

type Obstacle = {
  x: number;
  type: 'spike' | 'block' | 'triple' | 'high' | 'combo' | 'gap' | 'ceiling';
  w: number;
  h: number;
};

function buildLevel(seedLen: number, length: number): Obstacle[] {
  const obs: Obstacle[] = [];
  let x = 8;
  let i = 0;
  while (x < length) {
    const r = (Math.sin(seedLen * 9301 + i * 49297) + 1) / 2;
    if (r < 0.32) {
      obs.push({ x, type: 'spike', w: 1, h: 1 });
      x += 4.5 + r * 1.5;
    } else if (r < 0.5) {
      obs.push({ x, type: 'block', w: 1, h: 1 });
      x += 4.2;
    } else if (r < 0.66) {
      obs.push({ x, type: 'triple', w: 3, h: 1 });
      x += 5.5;
    } else if (r < 0.78) {
      obs.push({ x, type: 'combo', w: 2, h: 1 });
      x += 4.8;
    } else if (r < 0.88) {
      obs.push({ x, type: 'high', w: 1, h: 1.6 });
      x += 4.5;
    } else if (r < 0.95) {
      obs.push({ x, type: 'ceiling', w: 1, h: 0.5 });
      x += 4.2;
    } else {
      obs.push({ x, type: 'gap', w: 1.2, h: 1 });
      x += 4.5;
    }
    i++;
  }
  return obs;
}

function GameScreen() {
  const nav = useNavigate();
  const { id } = useParams();
  const level = LEVELS.find(l => l.id === id) || LEVELS[0];
  const obstacles = useMemo(() => buildLevel(level.id.length, level.length), [level]);

  const [practice, setPractice] = useState(false);
  const [cp, setCp] = useState(0);
  const [runId, setRunId] = useState(0);

  const [game, setGame] = useState({
    y: 0, rot: 0, scroll: 0, progress: 0, alive: true,
  });

  const stateRef = useRef({
    y: 0, vy: 0, rot: 0, scroll: 0, alive: true,
    lastTs: 0,
    runId: 0, practice: false, cp: 0, levelLen: 0,
  });

  useEffect(() => { bumpAttempts(); }, []);

  useEffect(() => {
    let raf = 0;
    const GRAVITY = 0.0000125;
    const SCROLL_SPEED = 0.0062;

    const ensureReset = () => {
      const s = stateRef.current;
      const needReset =
        s.runId !== runId ||
        s.practice !== practice ||
        s.cp !== cp ||
        s.levelLen !== level.length;
      if (needReset) {
        const startScroll = practice ? (cp * level.length / 100) : 0;
        s.y = 0; s.vy = 0; s.rot = 0;
        s.scroll = startScroll; s.alive = true; s.lastTs = 0;
        s.runId = runId; s.practice = practice; s.cp = cp; s.levelLen = level.length;
        setGame({
          y: 0, rot: 0, scroll: startScroll,
          progress: startScroll > 0 ? Math.round((startScroll / level.length) * 100) : 0,
          alive: true,
        });
        return true;
      }
      return false;
    };

    const loop = (ts: number) => {
      const s = stateRef.current;
      const justReset = ensureReset();
      if (!justReset && s.lastTs === 0) s.lastTs = ts;
      const dt = Math.min(33, ts - s.lastTs);
      s.lastTs = ts;

      let nextAlive = s.alive;
      if (s.alive) {
        s.vy -= GRAVITY * dt;
        s.y += s.vy * dt;
        s.scroll += SCROLL_SPEED * dt;
        if (s.y <= 0) { s.y = 0; s.vy = 0; }
        if (s.y > 1) s.y = 1;

        // tight collision: matches visual positioning
        const cubeLeft = 0.2; // more forgiveness
        const cubeRight = 0.45;

        for (const o of obstacles) {
          const ox = o.x - s.scroll;
          const obLeft = ox - o.w * 0.333 + 0.1;
          const obRight = ox + o.w * 0.333 - 0.1;
          
          // Only check obstacles whose X overlaps the cube
          if (obRight < cubeLeft || obLeft > cubeRight) continue;
          
          if (o.type === 'gap') {
            if (s.y < 0.02) { s.alive = false; break; }
          } else if (o.type === 'ceiling') {
            if (s.y > 0.08) { s.alive = false; break; }
          } else {
            if (s.y < o.h * 0.2 - 0.06) { s.alive = false; break; }
          }
        }

        if (s.scroll >= level.length) {
          s.alive = false;
          s.scroll = level.length;
        }
        nextAlive = s.alive;
      }

      const pct = Math.max(0, Math.min(100, (s.scroll / level.length) * 100));
      setGame({ y: s.y, rot: s.rot, scroll: s.scroll, progress: pct, alive: nextAlive });

      if (s.alive) {
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [obstacles, level.length, runId, practice, cp]);

  // Save progress on death / completion
  useEffect(() => {
    if (!game.alive) {
      const pct = Math.round(game.progress);
      if (pct > 0) saveProgress(level.id, pct);
      if (pct >= 100) setBest(100);
      else if (pct > getBest()) setBest(pct);
    }
  }, [game.alive, game.progress, level.id]);

  const tryJump = () => {
    const s = stateRef.current;
    if (!s.alive) return;
    if (s.y <= 0.015) {
      s.vy = 0.0039;
      s.rot = (s.rot + 90) % 360;
    }
  };

  const restart = () => {
    setRunId(x => x + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        tryJump();
      } else if (e.code === 'KeyR') {
        restart();
      } else if (e.code === 'Escape') {
        nav('/geometry/levels');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [level.id, nav]);

  const CUBE_SIZE = 40;
  const GROUND_Y = 220;

  return (
    <motion.div
      onClick={tryJump}
      onTouchStart={(e) => { e.preventDefault(); tryJump(); }}
      animate={game.alive ? { x: 0, y: 0 } : {
        x: [0, -8, 8, -6, 6, -4, 4, 0],
        y: [0, 4, -4, 2, -2, 0],
      }}
      transition={game.alive ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
      style={{
        flex: 1, position: 'relative', overflow: 'hidden', cursor: 'pointer',
        background: `linear-gradient(180deg, ${level.color1}55 0%, ${level.color2}99 50%, #0a0a14 100%)`,
        userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'manipulation',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(${level.color1}22 1px, transparent 1px), linear-gradient(90deg, ${level.color1}22 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        transform: `translateX(${-(game.scroll * 60) % 40}px)`,
      }} />

      <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={(e) => { e.stopPropagation(); nav('/geometry/levels'); }} style={{ ...backBtnStyle, position: 'static' }}>
            <ChevronLeft size={18} color="white" />
          </button>
          <div style={{ flex: 1, height: 10, background: 'rgba(0,0,0,0.5)', borderRadius: 5, border: '1px solid rgba(255,255,255,0.2)', overflow: 'hidden' }}>
            <div
              style={{ height: '100%', width: `${game.progress}%`, background: `linear-gradient(90deg, #fff 0%, ${level.color1} 100%)`, boxShadow: `0 0 12px ${level.color1}`, transition: 'width 0.05s linear' }}
            />
          </div>
          <div style={{ color: 'white', fontWeight: 900, fontSize: 14, fontFamily: 'Impact, sans-serif', minWidth: 40, textAlign: 'right', textShadow: '0 0 8px rgba(0,0,0,0.8)' }}>
            {Math.round(game.progress)}%
          </div>
        </div>
        <div style={{ color: 'white', fontSize: 11, fontWeight: 700, marginTop: 4, textShadow: '0 1px 2px rgba(0,0,0,0.8)', letterSpacing: 1 }}>
          {level.name} {practice ? '· PRACTICE' : ''}
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, top: GROUND_Y + CUBE_SIZE, height: 4,
          background: `linear-gradient(90deg, ${level.color1}, ${level.color2})`,
          boxShadow: `0 0 12px ${level.color1}`,
        }} />
        <div style={{
          position: 'absolute', left: 0, right: 0, top: GROUND_Y + CUBE_SIZE + 4, bottom: 0,
          background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a14 100%)',
        }} />

        {obstacles.map((o, i) => {
          const ox = 60 + (o.x - game.scroll) * 60;
          if (ox < -120 || ox > 500) return null;
          const wPx = o.w * 40;
          const baseY = GROUND_Y + CUBE_SIZE - (o.h * 40);
          if (o.type === 'spike') {
            return (
              <div key={i} style={{
                position: 'absolute', left: ox - 20, top: baseY, width: 40, height: 40,
                background: 'linear-gradient(180deg, #ff3060 0%, #b8003c 100%)',
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                boxShadow: '0 0 12px rgba(255,48,96,0.6), inset 0 0 8px rgba(255,255,255,0.3)',
              }} />
            );
          }
          if (o.type === 'block') {
            return (
              <div key={i} style={{
                position: 'absolute', left: ox - 20, top: baseY, width: 40, height: 40,
                background: 'linear-gradient(180deg, #555 0%, #222 100%)',
                border: '2px solid #fff',
                boxShadow: '0 0 8px rgba(255,255,255,0.3), inset 0 0 8px rgba(0,0,0,0.5)',
              }} />
            );
          }
          if (o.type === 'triple') {
            return (
              <div key={i} style={{
                position: 'absolute', left: ox - 60, top: baseY, width: 120, height: 40,
                display: 'flex', gap: 0,
              }}>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{
                    flex: 1, height: 40,
                    background: j === 1
                      ? `linear-gradient(180deg, ${level.color1} 0%, ${level.color2} 100%)`
                      : 'linear-gradient(180deg, #555 0%, #222 100%)',
                    border: '2px solid #fff',
                    boxShadow: j === 1 ? `0 0 12px ${level.color1}` : 'none',
                  }} />
                ))}
              </div>
            );
          }
          if (o.type === 'combo') {
            return (
              <div key={i} style={{
                position: 'absolute', left: ox - wPx / 2, top: baseY, width: wPx, height: 40,
                display: 'flex', gap: 0,
              }}>
                <div style={{
                  width: 20, height: 40, background: 'linear-gradient(180deg, #ff3060 0%, #b8003c 100%)',
                  clipPath: 'polygon(100% 0%, 100% 100%, 0% 100%)',
                  boxShadow: '0 0 8px rgba(255,48,96,0.5)',
                }} />
                <div style={{
                  flex: 1, height: 40, background: 'linear-gradient(180deg, #555 0%, #222 100%)',
                  border: '2px solid #fff', boxShadow: '0 0 6px rgba(255,255,255,0.3)',
                }} />
                <div style={{
                  width: 20, height: 40, background: 'linear-gradient(180deg, #ff3060 0%, #b8003c 100%)',
                  clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)',
                  boxShadow: '0 0 8px rgba(255,48,96,0.5)',
                }} />
              </div>
            );
          }
          if (o.type === 'high') {
            return (
              <div key={i} style={{
                position: 'absolute', left: ox - 20, top: baseY, width: 40, height: 64,
                background: 'linear-gradient(180deg, #555 0%, #222 100%)',
                border: '2px solid #fff',
                boxShadow: '0 0 8px rgba(255,255,255,0.3)',
              }} />
            );
          }
          if (o.type === 'ceiling') {
            return (
              <div key={i} style={{
                position: 'absolute', left: ox - 20, top: GROUND_Y - 20, width: 40, height: 20,
                background: 'linear-gradient(180deg, #ff3060 0%, #b8003c 100%)',
                clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
                boxShadow: '0 0 12px rgba(255,48,96,0.6)',
              }} />
            );
          }
          if (o.type === 'gap') {
            return (
              <div key={i} style={{
                position: 'absolute', left: ox - wPx / 2, top: GROUND_Y + CUBE_SIZE - 4, width: wPx, height: 16,
                background: 'linear-gradient(180deg, #000 0%, #1a0a2e 100%)',
                borderLeft: '2px solid #ff3060',
                borderRight: '2px solid #ff3060',
                boxShadow: '0 0 8px rgba(255,48,96,0.5)',
              }} />
            );
          }
          return null;
        })}

        {!game.alive ? (
          <Explosion x={60} y={GROUND_Y - 20} animKey={runId * 1000 + Math.round(game.progress)} />
        ) : (
          <div
            style={{
              position: 'absolute', left: 60, top: GROUND_Y, width: CUBE_SIZE, height: CUBE_SIZE,
              background: 'linear-gradient(135deg, #00E1FF 0%, #8E44AD 100%)',
              border: '2px solid #fff',
              borderRadius: 4,
              boxShadow: '0 0 20px rgba(0,225,255,0.8), inset 0 0 8px rgba(255,255,255,0.4)',
              transform: `translateY(${-game.y * 200}px) rotate(${game.rot}deg)`,
              transition: 'transform 0.05s linear',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{ width: 12, height: 12, background: '#fff', borderRadius: 2, boxShadow: '0 0 6px #fff' }} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {!game.alive && (
          <motion.div
            key="flash"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(255,48,96,0.5)', pointerEvents: 'none', zIndex: 9 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!game.alive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.75)', zIndex: 10, pointerEvents: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.7, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              style={{
                background: `linear-gradient(180deg, ${level.color1} 0%, ${level.color2} 100%)`,
                borderRadius: 18, padding: '24px 28px', textAlign: 'center',
                border: '3px solid #fff', boxShadow: `0 0 30px ${level.color1}aa`,
                minWidth: 240,
              }}
            >
              <div style={{
                fontSize: 22, fontWeight: 900, color: 'white',
                fontFamily: 'Impact, sans-serif', letterSpacing: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                marginBottom: 4,
              }}>
                {game.progress >= 100 ? 'LEVEL GESCHAFFT!' : 'CRASH!'}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginBottom: 12 }}>
                {game.progress >= 100 ? 'Du hast es geschafft' : 'Versuche es erneut'}
              </div>
              <div style={{
                fontSize: 52, fontWeight: 900, color: '#fff',
                fontFamily: 'Impact, sans-serif', textShadow: '0 0 20px rgba(255,255,255,0.5)',
                lineHeight: 1, marginBottom: 4,
              }}>
                {Math.round(game.progress)}%
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginBottom: 16, letterSpacing: 1 }}>
                {level.name}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={restart} style={bigBtn('#fff', '#111')}>
                  <RotateCcw size={16} /> NEUSTART
                </button>
                {game.progress < 100 && (
                  <button
                    onClick={() => {
                      const p = Math.round(game.progress);
                      if (p > cp) setCp(p);
                      setPractice(true);
                      setRunId(x => x + 1);
                    }}
                    style={bigBtn('rgba(255,255,255,0.2)', '#fff', 'rgba(255,255,255,0.3)')}
                  >
                    <Flag size={16} /> CHECKPOINT
                  </button>
                )}
                <button onClick={() => nav('/geometry/levels')} style={bigBtn('rgba(0,0,0,0.3)', '#fff', 'rgba(255,255,255,0.2)')}>
                  <ChevronLeft size={16} /> LEVELS
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {game.alive && game.scroll < 1 && (
        <div style={{
          position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center',
          color: 'rgba(255,255,255,0.6)', fontSize: 11, letterSpacing: 2, fontWeight: 700,
          textShadow: '0 1px 2px rgba(0,0,0,0.8)', pointerEvents: 'none',
        }}>
          TIPPE / LEERTASTE ZUM SPRINGEN
        </div>
      )}
    </motion.div>
  );
}

function bigBtn(bg: string, color: string, border = 'transparent'): React.CSSProperties {
  return {
    padding: '10px 16px', background: bg, color, border: `2px solid ${border}`,
    borderRadius: 10, fontWeight: 800, fontSize: 13, letterSpacing: 1, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  };
}

function Explosion({ x, y, animKey }: { x: number; y: number; animKey: number }) {
  const particles = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const dist = 50 + (i % 4) * 20;
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      size: 5 + (i % 3) * 3,
      delay: (i % 4) * 0.03,
      color: ['#FFD60A', '#FF006E', '#00E1FF', '#fff'][i % 4],
    };
  });
  return (
    <motion.div
      key={animKey}
      initial={{ scale: 0.5, opacity: 1 }}
      animate={{ scale: 1.4, opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ position: 'absolute', left: x, top: y, width: 40, height: 40, pointerEvents: 'none' }}
    >
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.55, delay: p.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute', left: '50%', top: '50%',
            width: p.size, height: p.size, marginLeft: -p.size / 2, marginTop: -p.size / 2,
            borderRadius: '50%', backgroundColor: p.color,
            boxShadow: `0 0 10px ${p.color}`,
          }}
        />
      ))}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          position: 'absolute', left: '50%', top: '50%', width: 40, height: 40,
          marginLeft: -20, marginTop: -20, borderRadius: '50%',
          background: 'radial-gradient(circle, #fff 0%, #FFD60A 40%, transparent 70%)',
        }}
      />
    </motion.div>
  );
}
