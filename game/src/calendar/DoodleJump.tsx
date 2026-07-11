import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw } from "lucide-react";
import { CollectClueButton } from "../components/CollectClueButton";

type Props = { active: boolean; onClose: () => void };

const GRAVITY = 0.32;
const JUMP_VELOCITY = -10.4;

const DOODLE_W = 50;
const DOODLE_H = 50;

const MOVE_ACCEL = 0.55;
const MOVE_MAX = 8.2;
const MOVE_FRICTION = 0.82;

const PLATFORM_W = 70;
const PLATFORM_H = 14;
const PLATFORM_GAP_Y = 62;

const SPRING_W = 18;
const SPRING_H = 14;
const SPRING_BOUNCE_VELOCITY = -14;

type PlatformKind = "green" | "blue" | "brown";

type Platform = {
  x: number;
  y: number;
  kind: PlatformKind;
  moveDir: number;
  hasSpring: boolean;
  springCompress: number;
  broken: boolean;
  breaking: number;
};

type GameState = "ready" | "playing" | "dead";

const BEST_KEY = "escape.doodle.best";
const CAMERA_BOTTOM_MARGIN = 60;

export default function DoodleJump({ active, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);

  const doodleRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    facing: 1,
    squash: 0,
    onSpring: false,
  });

  const platformsRef = useRef<Platform[]>([]);
  const cameraRef = useRef(0);
  const maxHeightRef = useRef(0);
  const stateRef = useRef<GameState>("ready");
  const sizeRef = useRef({ w: 0, h: 0 });
  const inputRef = useRef({ left: false, right: false });
  const touchActiveRef = useRef(false);
  const flashRef = useRef(0);
  const shakeRef = useRef(0);
  const lastPlatformYRef = useRef(0);

  const [uiState, setUiState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const spawnPlatforms = useCallback((count: number, baseY: number) => {
    const { w, h } = sizeRef.current;
    if (w === 0 || h === 0) return;
    const list: Platform[] = [];
    let y = baseY - PLATFORM_GAP_Y;
    for (let i = 0; i < count; i++) {
      const r = Math.random();
      const kind: PlatformKind =
        r < 0.5 ? "green" : r < 0.82 ? "blue" : "brown";
      const x = Math.random() * (w - PLATFORM_W);
      const moveDir = kind === "blue" ? (Math.random() < 0.5 ? -1 : 1) : 0;
      const hasSpring =
        kind === "green" && Math.random() < 0.08;
      list.push({
        x,
        y,
        kind,
        moveDir,
        hasSpring,
        springCompress: 0,
        broken: false,
        breaking: 0,
      });
      y -= PLATFORM_GAP_Y;
    }
    lastPlatformYRef.current = y;
    platformsRef.current = [...platformsRef.current, ...list];
  }, []);

  const reset = useCallback(() => {
    const { w, h } = sizeRef.current;
    if (w === 0 || h === 0) return;
    doodleRef.current = {
      x: w / 2 - DOODLE_W / 2,
      y: h * 0.55,
      vx: 0,
      vy: 0,
      facing: 1,
      squash: 0,
      onSpring: false,
    };
    platformsRef.current = [];
    cameraRef.current = 0;
    maxHeightRef.current = 0;
    flashRef.current = 0;
    shakeRef.current = 0;
    lastPlatformYRef.current = h * 0.55;
    spawnPlatforms(8, h * 0.55);
    stateRef.current = "ready";
    setUiState("ready");
    setScore(0);
  }, [spawnPlatforms]);

  useEffect(() => {
    if (!active) return;
    reset();
    const stored = Number(localStorage.getItem(BEST_KEY) ?? 0);
    if (Number.isFinite(stored)) setBest(stored);
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
      const oldW = sizeRef.current.w;
      sizeRef.current = { w: rect.width, h: rect.height };
      if (first) {
        doodleRef.current.x = rect.width / 2 - DOODLE_W / 2;
        doodleRef.current.y = rect.height * 0.55;
        lastPlatformYRef.current = rect.height * 0.55;
        spawnPlatforms(8, rect.height * 0.55);
      } else if (oldW !== rect.width) {
        const dw = rect.width - oldW;
        for (const p of platformsRef.current) {
          if (p.kind === "blue") continue;
          p.x = Math.max(0, Math.min(rect.width - PLATFORM_W, p.x + dw * 0.5));
        }
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [active, spawnPlatforms]);

  const startOrRestart = useCallback(() => {
    if (stateRef.current === "ready") {
      stateRef.current = "playing";
      setUiState("playing");
      doodleRef.current.vy = JUMP_VELOCITY;
    } else if (stateRef.current === "dead") {
      reset();
    }
  }, [reset]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.code === "ArrowLeft" ||
        e.code === "KeyA" ||
        e.code === "ArrowRight" ||
        e.code === "KeyD"
      ) {
        e.preventDefault();
        if (e.code === "ArrowLeft" || e.code === "KeyA") inputRef.current.left = true;
        if (e.code === "ArrowRight" || e.code === "KeyD") inputRef.current.right = true;
        if (stateRef.current === "ready") startOrRestart();
      } else if (e.code === "Space") {
        e.preventDefault();
        startOrRestart();
      } else if (e.code === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA")
        inputRef.current.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD")
        inputRef.current.right = false;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [active, startOrRestart, onClose]);

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

  const die = useCallback(() => {
    if (stateRef.current === "dead") return;
    stateRef.current = "dead";
    setUiState("dead");
    flashRef.current = 1;
    shakeRef.current = 14;
    if (score > best) {
      setBest(score);
      localStorage.setItem(BEST_KEY, String(score));
    }
  }, [score, best]);

  const update = (dt: number, w: number, h: number) => {
    const scale = dt / 16;
    const doodle = doodleRef.current;
    const playing = stateRef.current === "playing";

    if (playing) {
      const inL = inputRef.current.left;
      const inR = inputRef.current.right;
      if (inL && !inR) {
        doodle.vx -= MOVE_ACCEL * scale;
        doodle.facing = -1;
      } else if (inR && !inL) {
        doodle.vx += MOVE_ACCEL * scale;
        doodle.facing = 1;
      } else {
        doodle.vx *= Math.pow(MOVE_FRICTION, scale);
        if (Math.abs(doodle.vx) < 0.05) doodle.vx = 0;
      }
      if (doodle.vx > MOVE_MAX) doodle.vx = MOVE_MAX;
      if (doodle.vx < -MOVE_MAX) doodle.vx = -MOVE_MAX;

      doodle.x += doodle.vx * scale;
      doodle.vy += GRAVITY * scale;
      doodle.y += doodle.vy * scale;

      if (doodle.x + DOODLE_W < 0) doodle.x = w;
      else if (doodle.x > w) doodle.x = -DOODLE_W;

      doodle.squash = Math.max(0, doodle.squash - 0.08 * scale);

      const cameraTarget = doodle.y - h * 0.4;
      if (cameraTarget < cameraRef.current) {
        cameraRef.current = cameraTarget;
      }

      for (const p of platformsRef.current) {
        if (p.kind === "blue" && !p.broken) {
          p.x += p.moveDir * 1.4 * scale;
          if (p.x <= 0) {
            p.x = 0;
            p.moveDir = 1;
          } else if (p.x + PLATFORM_W >= w) {
            p.x = w - PLATFORM_W;
            p.moveDir = -1;
          }
        }
        if (p.broken) {
          p.breaking += dt * 0.004;
          p.x += (Math.random() - 0.5) * 1.2 * scale;
        }
        if (p.hasSpring && p.springCompress > 0) {
          p.springCompress = Math.max(0, p.springCompress - 0.18 * scale);
        }
      }

      if (doodle.vy > 0) {
        const footX = doodle.x + DOODLE_W / 2;
        const footY = doodle.y + DOODLE_H;
        for (const p of platformsRef.current) {
          if (p.broken) continue;
          if (
            footX > p.x + 4 &&
            footX < p.x + PLATFORM_W - 4 &&
            footY > p.y &&
            footY < p.y + PLATFORM_H + Math.max(6, doodle.vy * scale + 6) &&
            doodle.y + DOODLE_H - doodle.vy * scale <= p.y + 2
          ) {
            if (p.hasSpring) {
              doodle.vy = SPRING_BOUNCE_VELOCITY;
              p.springCompress = 1;
              doodle.onSpring = true;
            } else {
              doodle.vy = JUMP_VELOCITY;
            }
            if (p.kind === "brown") {
              p.broken = true;
            } else {
              doodle.squash = 1;
            }
            break;
          }
        }
      } else {
        doodle.onSpring = false;
      }

      const reachedY = doodle.y - cameraRef.current;
      const heightScore = Math.max(0, Math.floor((h * 0.55 - reachedY) / 10));
      if (heightScore > maxHeightRef.current) {
        maxHeightRef.current = heightScore;
        setScore(heightScore);
      }

      const offBottom = doodle.y - cameraRef.current > h + CAMERA_BOTTOM_MARGIN;
      if (offBottom) {
        die();
      }

      platformsRef.current = platformsRef.current.filter(
        (p) => p.y - cameraRef.current < h + 80,
      );
      while (lastPlatformYRef.current > cameraRef.current - 80) {
        const x = Math.random() * (w - PLATFORM_W);
        const r = Math.random();
        const kind: PlatformKind =
          r < 0.5 ? "green" : r < 0.82 ? "blue" : "brown";
        const moveDir = kind === "blue" ? (Math.random() < 0.5 ? -1 : 1) : 0;
        const hasSpring = kind === "green" && Math.random() < 0.09;
        const y = lastPlatformYRef.current - PLATFORM_GAP_Y;
        platformsRef.current.push({
          x,
          y,
          kind,
          moveDir,
          hasSpring,
          springCompress: 0,
          broken: false,
          breaking: 0,
        });
        lastPlatformYRef.current = y;
      }
    } else if (stateRef.current === "ready") {
      const t = performance.now() / 320;
      doodle.y = h * 0.55 + Math.sin(t) * 10;
      doodle.vx = 0;
      doodle.vy = 0;
    } else {
      doodle.vy += GRAVITY * scale;
      doodle.y += doodle.vy * scale;
      doodle.vx *= Math.pow(MOVE_FRICTION, scale);
      doodle.x += doodle.vx * scale;
      if (doodle.x + DOODLE_W < 0) doodle.x = w;
      else if (doodle.x > w) doodle.x = -DOODLE_W;
    }

    if (shakeRef.current > 0) shakeRef.current = Math.max(0, shakeRef.current - dt);
    if (flashRef.current > 0)
      flashRef.current = Math.max(0, flashRef.current - dt * 0.005);
  };

  const draw = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
  ) => {
    const shakeX = shakeRef.current > 0 ? (Math.random() - 0.5) * shakeRef.current : 0;
    const shakeY = shakeRef.current > 0 ? (Math.random() - 0.5) * shakeRef.current : 0;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    drawBackground(ctx, w, h);
    drawNotebookLines(ctx, w, h);

    for (const p of platformsRef.current) {
      const py = p.y - cameraRef.current;
      if (py < -40 || py > h + 40) continue;
      drawPlatform(ctx, p, py);
    }

    const dx = doodleRef.current.x;
    const dy = doodleRef.current.y - cameraRef.current;
    drawDoodle(ctx, dx, dy, doodleRef.current);

    if (flashRef.current > 0) {
      ctx.fillStyle = `rgba(255,255,255,${flashRef.current})`;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  };

  const handlePointerDown = (side: "left" | "right") => {
    touchActiveRef.current = true;
    inputRef.current[side] = true;
    if (stateRef.current === "ready") startOrRestart();
  };
  const handlePointerUp = () => {
    touchActiveRef.current = false;
    inputRef.current.left = false;
    inputRef.current.right = false;
  };

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="doodle-overlay"
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
            backgroundColor: "#ffffff",
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            fontFamily:
              "'Trebuchet MS', 'Verdana', system-ui, sans-serif",
          }}
        >
          {/* Top bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 12,
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#1a73e8",
                backgroundColor: "rgba(255,255,255,0.75)",
                padding: "4px 10px",
                borderRadius: 999,
                pointerEvents: "auto",
              }}
            >
              Best: {best}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ pointerEvents: 'auto' }}>
                <CollectClueButton clueId="games:doodle" size={16} />
              </div>
              <button
                onClick={onClose}
                aria-label="Schließen"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,0.35)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(6px)",
                  pointerEvents: "auto",
                }}
              >
                <X size={22} color="#fff" />
              </button>
            </div>
          </div>

          {/* Live score */}
          {uiState === "playing" && (
            <div
              style={{
                position: "absolute",
                top: 60,
                left: 0,
                right: 0,
                textAlign: "center",
                zIndex: 2,
                pointerEvents: "none",
                fontWeight: 800,
                fontSize: 56,
                color: "#1a73e8",
                WebkitTextStroke: "2px #ffffff",
                paintOrder: "stroke fill",
                textShadow: "0 2px 0 rgba(0,0,0,0.08)",
                letterSpacing: 1,
              }}
            >
              {score}
            </div>
          )}

          {/* Game surface */}
          <div
            ref={containerRef}
            onPointerDown={(e) => {
              e.preventDefault();
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = e.clientX - rect.left;
              handlePointerDown(x < rect.width / 2 ? "left" : "right");
            }}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{
              flex: 1,
              position: "relative",
              minHeight: 0,
              cursor: "pointer",
            }}
          >
            <canvas ref={canvasRef} style={{ display: "block" }} />
          </div>

          {/* Ready overlay */}
          {uiState === "ready" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 18,
                zIndex: 3,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 44,
                  color: "#1a73e8",
                  WebkitTextStroke: "2px #ffffff",
                  paintOrder: "stroke fill",
                  textShadow: "0 4px 0 rgba(0,0,0,0.08)",
                  letterSpacing: 1,
                  textAlign: "center",
                  lineHeight: 1.1,
                }}
              >
                Doodle
                <br />
                Jump
              </div>
              <div
                style={{
                  padding: "10px 18px",
                  backgroundColor: "rgba(26,115,232,0.92)",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 999,
                  animation: "doodlePulse 1s ease-in-out infinite",
                }}
              >
                ←  →  oder tippen zum Starten
              </div>
              <style>{`
                @keyframes doodlePulse {
                  0%, 100% { opacity: 0.7; transform: scale(1); }
                  50%      { opacity: 1;   transform: scale(1.04); }
                }
              `}</style>
            </div>
          )}

          {/* Game over panel */}
          {uiState === "dead" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 3,
                backgroundColor: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(2px)",
              }}
            >
              <div
                style={{
                  width: "82%",
                  maxWidth: 320,
                  backgroundColor: "#fff",
                  borderRadius: 20,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                }}
              >
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#d93025",
                    letterSpacing: 0.5,
                  }}
                >
                  Game Over
                </div>
                <div
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <ScoreBox label="Score" value={score} />
                  <ScoreBox label="Best" value={best} accent />
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    width: "100%",
                    marginTop: 4,
                  }}
                >
                  <button
                    onClick={reset}
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 24,
                      border: "none",
                      backgroundColor: "#1a73e8",
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <RotateCcw size={18} color="#fff" />
                    Nochmal
                  </button>
                  <button
                    onClick={onClose}
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 24,
                      border: "1px solid #dadce0",
                      backgroundColor: "#fff",
                      color: "#3c4043",
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Schließen
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ScoreBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 14,
        backgroundColor: accent ? "#fef7e0" : "#f1f3f4",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#5f6368",
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: accent ? "#b06000" : "#202124",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#e8f4ff");
  grad.addColorStop(1, "#f7fbff");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawNotebookLines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  ctx.save();
  ctx.strokeStyle = "rgba(110, 168, 215, 0.55)";
  ctx.lineWidth = 1;
  const step = 22;
  for (let y = step; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(220, 90, 110, 0.45)";
  ctx.fillRect(38, 0, 2, h);
  ctx.fillStyle = "rgba(220, 90, 110, 0.18)";
  ctx.fillRect(38, 0, 14, h);
  ctx.restore();
}

function drawPlatform(
  ctx: CanvasRenderingContext2D,
  p: Platform,
  py: number,
) {
  ctx.save();
  if (p.broken) {
    ctx.globalAlpha = Math.max(0, 1 - p.breaking);
    ctx.translate(p.x + PLATFORM_W / 2, py + PLATFORM_H / 2);
    ctx.rotate(p.breaking * 0.4);
    ctx.translate(-PLATFORM_W / 2, -PLATFORM_H / 2);
  }
  const x = p.x;
  const y = py;
  if (p.kind === "green") {
    const grad = ctx.createLinearGradient(x, y, x, y + PLATFORM_H);
    grad.addColorStop(0, "#7bd44a");
    grad.addColorStop(1, "#3f9a1a");
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, PLATFORM_W, PLATFORM_H, 7);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    roundRect(ctx, x + 4, y + 2, PLATFORM_W - 8, 3, 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    roundRect(ctx, x + 4, y + PLATFORM_H - 4, PLATFORM_W - 8, 2, 1);
    ctx.fill();
  } else if (p.kind === "blue") {
    const grad = ctx.createLinearGradient(x, y, x, y + PLATFORM_H);
    grad.addColorStop(0, "#56b9ff");
    grad.addColorStop(1, "#1f6dd6");
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, PLATFORM_W, PLATFORM_H, 7);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    roundRect(ctx, x + 4, y + 2, PLATFORM_W - 8, 3, 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    roundRect(ctx, x + 4, y + PLATFORM_H - 4, PLATFORM_W - 8, 2, 1);
    ctx.fill();
  } else {
    const grad = ctx.createLinearGradient(x, y, x, y + PLATFORM_H);
    grad.addColorStop(0, "#c69a64");
    grad.addColorStop(1, "#7a4a1a");
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, PLATFORM_W, PLATFORM_H, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + PLATFORM_H / 2);
    ctx.lineTo(x + PLATFORM_W - 8, y + PLATFORM_H / 2);
    ctx.moveTo(x + PLATFORM_W / 2, y + 2);
    ctx.lineTo(x + PLATFORM_W / 2, y + PLATFORM_H - 2);
    ctx.stroke();
  }

  if (p.hasSpring && !p.broken) {
    const sx = x + PLATFORM_W / 2 - SPRING_W / 2;
    const sy = y - SPRING_H + p.springCompress * 4;
    drawSpring(ctx, sx, sy);
  }

  ctx.restore();
}

function drawSpring(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.fillStyle = "#9aa0a6";
  roundRect(ctx, x, y + SPRING_H - 3, SPRING_W, 4, 2);
  ctx.fill();
  ctx.fillStyle = "#34a853";
  roundRect(ctx, x + 1, y, SPRING_W - 2, SPRING_H - 4, 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  roundRect(ctx, x + 3, y + 1, 3, SPRING_H - 6, 1);
  ctx.fill();
  ctx.restore();
}

function drawDoodle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  d: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    facing: number;
    squash: number;
    onSpring: boolean;
  },
) {
  const facing = d.facing >= 0 ? 1 : -1;
  const squash = d.squash;
  const cx = x + DOODLE_W / 2;
  const cy = y + DOODLE_H / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(facing, 1);
  ctx.translate(-DOODLE_W / 2, -DOODLE_H / 2);

  const tilt = Math.max(-0.25, Math.min(0.25, d.vx / 40));
  ctx.translate(DOODLE_W / 2, DOODLE_H / 2);
  ctx.rotate(tilt);
  ctx.translate(-DOODLE_W / 2, -DOODLE_H / 2);

  if (squash > 0) {
    ctx.translate(0, DOODLE_H * 0.06 * squash);
    ctx.scale(1 + 0.18 * squash, 1 - 0.18 * squash);
    ctx.translate(0, -DOODLE_H * 0.06 * squash);
  }

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(DOODLE_W / 2 + 2, DOODLE_H * 0.92, DOODLE_W * 0.42, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const bodyGrad = ctx.createLinearGradient(0, 6, 0, DOODLE_H);
  bodyGrad.addColorStop(0, "#9be54a");
  bodyGrad.addColorStop(1, "#3aa014");
  ctx.fillStyle = bodyGrad;
  roundRect(ctx, 4, 8, DOODLE_W - 8, DOODLE_H - 10, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  roundRect(ctx, 10, 22, DOODLE_W - 20, DOODLE_H - 28, 10);
  ctx.fill();

  ctx.strokeStyle = "rgba(20, 80, 20, 0.7)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(DOODLE_W / 2, 2);
  ctx.lineTo(DOODLE_W / 2, 9);
  ctx.stroke();
  ctx.fillStyle = "#d63a3a";
  ctx.beginPath();
  ctx.arc(DOODLE_W / 2, 1, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(DOODLE_W * 0.36, DOODLE_H * 0.42, 6.5, 0, Math.PI * 2);
  ctx.arc(DOODLE_W * 0.66, DOODLE_H * 0.42, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.7)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(DOODLE_W * 0.38, DOODLE_H * 0.44, 2.6, 0, Math.PI * 2);
  ctx.arc(DOODLE_W * 0.68, DOODLE_H * 0.44, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(DOODLE_W * 0.39, DOODLE_H * 0.43, 1.0, 0, Math.PI * 2);
  ctx.arc(DOODLE_W * 0.69, DOODLE_H * 0.43, 1.0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(DOODLE_W * 0.46, DOODLE_H * 0.58, 1.4, 0, Math.PI * 2);
  ctx.arc(DOODLE_W * 0.58, DOODLE_H * 0.58, 1.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(DOODLE_W * 0.5, DOODLE_H * 0.6, 4, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 6, DOODLE_H - 10, 10, 6, 2);
  roundRect(ctx, DOODLE_W - 16, DOODLE_H - 10, 10, 6, 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}
