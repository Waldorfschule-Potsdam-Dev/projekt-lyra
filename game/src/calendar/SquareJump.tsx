import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getUsername,
  setUsername,
  loadScores,
  recordScore,
  type JumpScore,
} from "./squarejump/profile";
import UsernameDialog from "./squarejump/UsernameDialog";
import TopBar from "./squarejump/TopBar";
import LiveScore from "./squarejump/LiveScore";
import ReadyOverlay from "./squarejump/ReadyOverlay";
import GameOverPanel from "./squarejump/GameOverPanel";
import {
  drawCloud,
  drawHills,
  drawBush,
  drawPipe,
  drawGround,
  drawBird,
} from "./squarejump/drawing";

type Props = { active: boolean; onClose: () => void };

const PIPE_WIDTH = 60;
const PIPE_GAP = 140;
const PIPE_SPEED = 2.2;
const GRAVITY = 0.5;
const JUMP_VELOCITY = -7.6;
const BIRD_SIZE = 34;
const BIRD_X = 90;
const PIPE_INTERVAL_MS = 1550;
const GROUND_HEIGHT = 84;
const GROUND_TILE = 24;

type GameState = "ready" | "playing" | "dead";

type Pipe = { x: number; gapY: number; scored: boolean };
type Cloud = { x: number; y: number; w: number };
type Bush = { x: number; w: number; h: number };

export default function SquareJump({ active, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);
  const birdRef = useRef({ y: 0, vy: 0, rot: 0, wing: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const groundOffsetRef = useRef(0);
  const stateRef = useRef<GameState>("ready");
  const spawnTimerRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const cloudsRef = useRef<Cloud[]>([]);
  const bushesRef = useRef<Bush[]>([]);
  const flashRef = useRef(0);
  const shakeRef = useRef(0);

  const [uiState, setUiState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [user, setUser] = useState<string | null>(null);
  const [scores, setScores] = useState<JumpScore[]>([]);

  const reset = useCallback(() => {
    const { h } = sizeRef.current;
    if (h === 0) return;
    birdRef.current = { y: h / 2 - BIRD_SIZE / 2, vy: 0, rot: 0, wing: 0 };
    pipesRef.current = [];
    scoreRef.current = 0;
    groundOffsetRef.current = 0;
    spawnTimerRef.current = 0;
    stateRef.current = "ready";
    flashRef.current = 0;
    shakeRef.current = 0;
    setUiState("ready");
    setScore(0);
  }, []);

  useEffect(() => {
    if (!active) return;
    reset();
    setUser(getUsername());
    let cancelled = false;
    loadScores().then((list) => {
      if (!cancelled) setScores(list);
    });
    return () => {
      cancelled = true;
    };
  }, [active, reset]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ro = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const first = sizeRef.current.w === 0 && sizeRef.current.h === 0;
      sizeRef.current = { w: rect.width, h: rect.height };
      if (first) {
        birdRef.current.y = rect.height / 2 - BIRD_SIZE / 2;
        cloudsRef.current = Array.from({ length: 5 }, () => ({
          x: Math.random() * rect.width,
          y: 30 + Math.random() * (rect.height * 0.28),
          w: 50 + Math.random() * 70,
        }));
        bushesRef.current = Array.from({ length: 6 }, () => ({
          x: Math.random() * rect.width,
          w: 40 + Math.random() * 50,
          h: 14 + Math.random() * 10,
        }));
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [active]);

  const handleUserSubmit = useCallback((name: string) => {
    setUsername(name);
    setUser(name);
  }, []);

  const flap = useCallback(() => {
    if (stateRef.current === "ready") {
      stateRef.current = "playing";
      setUiState("playing");
      birdRef.current.vy = JUMP_VELOCITY;
    } else if (stateRef.current === "playing") {
      birdRef.current.vy = JUMP_VELOCITY;
    } else {
      reset();
    }
  }, [reset]);

  useEffect(() => {
    if (!active || !user) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        flap();
      } else if (e.code === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, flap, onClose, user]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tick = (ts: number) => {
      const dt = lastTsRef.current ? Math.min(ts - lastTsRef.current, 32) : 16;
      lastTsRef.current = ts;
      const { w, h } = sizeRef.current;
      if (w > 0 && h > 0) {
        update(dt, w, h);
        draw(ctx, w, h);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  const update = (dt: number, w: number, h: number) => {
    const scale = dt / 16;
    const groundY = h - GROUND_HEIGHT;

    if (stateRef.current === "playing") {
      birdRef.current.vy += GRAVITY * scale;
      birdRef.current.y += birdRef.current.vy * scale;
      birdRef.current.rot = Math.max(-25, Math.min(90, birdRef.current.vy * 4.2));
      birdRef.current.wing = (birdRef.current.wing + scale * 0.45) % (Math.PI * 2);

      spawnTimerRef.current += dt;
      if (spawnTimerRef.current >= PIPE_INTERVAL_MS) {
        spawnTimerRef.current = 0;
        const minGap = 70;
        const maxGap = groundY - PIPE_GAP - 70;
        const gapY = minGap + Math.random() * Math.max(10, maxGap - minGap);
        pipesRef.current.push({ x: w + 20, gapY, scored: false });
      }

      for (const p of pipesRef.current) {
        p.x -= PIPE_SPEED * scale;
        if (!p.scored && p.x + PIPE_WIDTH < BIRD_X - BIRD_SIZE / 2) {
          p.scored = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
        }
      }
      pipesRef.current = pipesRef.current.filter((p) => p.x + PIPE_WIDTH > -10);

      groundOffsetRef.current = (groundOffsetRef.current + PIPE_SPEED * scale) % GROUND_TILE;

      const bx = BIRD_X - BIRD_SIZE / 2 + 4;
      const by = birdRef.current.y + 4;
      const bw = BIRD_SIZE - 8;
      const bh = BIRD_SIZE - 8;

      if (by + bh >= groundY) {
        birdRef.current.y = groundY - BIRD_SIZE;
        die();
      }
      if (by < 0) {
        birdRef.current.y = 0;
        birdRef.current.vy = 0;
      }

      for (const p of pipesRef.current) {
        const inX = bx + bw > p.x + 4 && bx < p.x + PIPE_WIDTH - 4;
        if (!inX) continue;
        if (by < p.gapY - 4 || by + bh > p.gapY + PIPE_GAP + 4) {
          die();
          break;
        }
      }
    } else if (stateRef.current === "ready") {
      birdRef.current.y =
        h / 2 - BIRD_SIZE / 2 + Math.sin(performance.now() / 220) * 9;
      birdRef.current.rot = Math.sin(performance.now() / 220) * 6;
      birdRef.current.wing = (birdRef.current.wing + scale * 0.4) % (Math.PI * 2);
    }

    if (shakeRef.current > 0) shakeRef.current = Math.max(0, shakeRef.current - dt);
    if (flashRef.current > 0)
      flashRef.current = Math.max(0, flashRef.current - dt * 0.005);

    for (const c of cloudsRef.current) {
      c.x -= 0.35 * scale;
      if (c.x + c.w < 0) {
        c.x = w + c.w;
        c.y = 30 + Math.random() * (h * 0.28);
      }
    }
    for (const b of bushesRef.current) {
      b.x -= 0.9 * scale;
      if (b.x + b.w < 0) {
        b.x = w + b.w;
        b.h = 14 + Math.random() * 10;
      }
    }
  };

  const die = () => {
    if (stateRef.current === "dead") return;
    stateRef.current = "dead";
    setUiState("dead");
    flashRef.current = 1;
    shakeRef.current = 12;
    if (user) {
      recordScore(user, scoreRef.current).then((next) => setScores(next));
    }
  };

  const draw = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
  ) => {
    const groundY = h - GROUND_HEIGHT;
    const shakeX = shakeRef.current > 0 ? (Math.random() - 0.5) * shakeRef.current : 0;
    const shakeY = shakeRef.current > 0 ? (Math.random() - 0.5) * shakeRef.current : 0;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, "#4ec0ca");
    sky.addColorStop(0.7, "#9be7ec");
    sky.addColorStop(1, "#ded895");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, groundY);

    for (const c of cloudsRef.current) drawCloud(ctx, c.x, c.y, c.w);
    drawHills(ctx, w, groundY);
    for (const b of bushesRef.current) drawBush(ctx, b.x, groundY - b.h, b.w, b.h);

    for (const p of pipesRef.current) {
      drawPipe(ctx, p.x, 0, PIPE_WIDTH, p.gapY);
      drawPipe(ctx, p.x, p.gapY + PIPE_GAP, PIPE_WIDTH, groundY - (p.gapY + PIPE_GAP));
    }

    drawGround(ctx, w, h, groundOffsetRef.current);
    drawBird(ctx, BIRD_X, birdRef.current.y, BIRD_SIZE, birdRef.current.rot, birdRef.current.wing);

    if (flashRef.current > 0) {
      ctx.fillStyle = `rgba(255,255,255,${flashRef.current})`;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  };

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="squarejump-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 300,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#4ec0ca",
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          {user && (
            <TopBar
              user={user}
              showBadge={uiState !== "playing"}
              onClose={onClose}
            />
          )}

          {uiState === "playing" && <LiveScore score={score} />}

          {/* Game surface */}
          <div
            ref={containerRef}
            onPointerDown={(e) => {
              if (!user) return;
              e.preventDefault();
              flap();
            }}
            style={{
              flex: 1,
              position: "relative",
              minHeight: 0,
              cursor: user ? "pointer" : "default",
            }}
          >
            <canvas ref={canvasRef} style={{ display: "block" }} />
          </div>

          {uiState === "ready" && user && (
            <ReadyOverlay scores={scores} user={user} />
          )}

          {uiState === "dead" && user && (
            <GameOverPanel
              user={user}
              score={score}
              scores={scores}
              onRetry={reset}
              onClose={onClose}
            />
          )}

          <AnimatePresence>
            {active && !user && (
              <UsernameDialog onSubmit={handleUserSubmit} />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
