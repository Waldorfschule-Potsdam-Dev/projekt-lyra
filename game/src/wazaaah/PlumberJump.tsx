import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pause, Play, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { waColors } from './styles';
import { CollectClueButton } from '../components/CollectClueButton';

const TILE = 32;
const GRAVITY = 0.55;
const JUMP_V = -11.5;
const MAX_WALK = 4.5;
const MAX_RUN = 7;
const MAX_FALL = 13;
const FRICTION = 0.82;
const VIEW_W = 512;
const VIEW_H = 480;

const T = {
  EMPTY: 0,
  GROUND: 1,
  BRICK: 2,
  QUESTION: 3,
  QUSED: 4,
  PIPE_TL: 5,
  PIPE_TR: 6,
  PIPE_BL: 7,
  PIPE_BR: 8,
  FLAG_POLE: 9,
  FLAG_TOP: 10,
  CASTLE: 11,
  BUSH_L: 12,
  BUSH_M: 13,
  BUSH_R: 14,
  CLOUD_L: 15,
  CLOUD_M: 16,
  CLOUD_R: 17,
  HARD: 18,
  LAVA: 19,
  CHECKPOINT: 20,
};

interface Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  active: boolean;
  onGround?: boolean;
}

class Goomba implements Entity {
  x = 0; y = 0; vx = -1; vy = 0; w = 28; h = 28; active = true;
  dead = false;
  onGround = false;
  constructor(x: number, y: number) { this.x = x; this.y = y; }
}

class Koopa implements Entity {
  x = 0; y = 0; vx = -1; vy = 0; w = 28; h = 44; active = true;
  inShell = false;
  shellMoving = false;
  onGround = false;
  constructor(x: number, y: number) { this.x = x; this.y = y; }
}

class Bowser implements Entity {
  x = 0; y = 0; vx = -0.8; vy = 0; w = 56; h = 60; active = true;
  hp = 5;
  hitTimer = 0;
  fireTimer = 120;
  facing: 1 | -1 = -1;
  onGround = false;
  constructor(x: number, y: number) { this.x = x; this.y = y; }
}

class Coin implements Entity {
  x = 0; y = 0; vx = 0; vy = 0; w = 24; h = 24; active = true;
  collected = false;
  constructor(x: number, y: number) { this.x = x; this.y = y; }
}

class PowerUp implements Entity {
  x = 0; y = 0; vx = 1.5; vy = 0; w = 28; h = 28; active = true;
  emerging = false;
  emergeY = 0;
  type: 'mushroom' | 'fireflower' | 'star' | 'oneup' = 'mushroom';
  onGround = false;
  constructor(x: number, y: number, type: PowerUp['type'] = 'mushroom') { this.x = x; this.y = y; this.type = type; this.emergeY = y - 32; }
}

class Fireball implements Entity {
  x = 0; y = 0; vx = 0; vy = 0; w = 8; h = 8; active = true;
  bounceCount = 0;
  constructor(x: number, y: number, vx: number) { this.x = x; this.y = y; this.vx = vx; this.vy = -6; }
}

interface PlayerState extends Entity {
  facing: 1 | -1;
  onGround: boolean;
  state: 'small' | 'big' | 'fire';
  invuln: number;
  dead: number;
  jumpHeld: boolean;
  jumpBuffer: number;
}

class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tiles: number[][] = [];
  player!: PlayerState;
  camera = { x: 0, y: 0 };
  enemies: (Goomba | Koopa | Bowser)[] = [];
  coins: Coin[] = [];
  powerups: PowerUp[] = [];
  fireballs: Fireball[] = [];
  score = 0;
  coinCount = 0;
  time = 300;
  lives = 3;
  gameOver = false;
  paused = false;
  startTime = 0;
  lastTick = 0;
  frameCount = 0;
  keys: Record<string, boolean> = {};
  rafId = 0;
  onStateChange: () => void = () => {};
  maxGeneratedCol = 0;
  lastCheckpointCol = 0;
  nextCheckpointCol = 20;
  distance = 0;
  bestDistance = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.initEndless();
  }

  hashCol(n: number) {
    const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  initEndless() {
    this.tiles = [];
    for (let y = 0; y < 14; y++) this.tiles.push([]);
    this.maxGeneratedCol = 0;
    this.lastCheckpointCol = 0;
    this.nextCheckpointCol = 20;
    this.enemies = [];
    this.coins = [];
    this.powerups = [];
    this.fireballs = [];
    this.score = 0;
    this.coinCount = 0;
    this.time = 300;
    this.distance = 0;
    this.generateColumns(0, 250);
    this.spawnQuestionPowerups();
    this.player = this.makePlayer();
    this.player.x = 2 * TILE;
    this.player.y = 10 * TILE;
    this.camera = { x: 0, y: 0 };
  }

  generateColumns(fromCol: number, toCol: number) {
    for (let y = 0; y < 14; y++) {
      while (this.tiles[y].length < toCol) this.tiles[y].push(T.EMPTY);
    }
    for (let x = fromCol; x < toCol; x++) this.generateColumn(x);
    this.maxGeneratedCol = Math.max(this.maxGeneratedCol, toCol);
  }

  generateColumn(col: number) {
    for (let y = 0; y < 14; y++) this.tiles[y][col] = T.EMPTY;
    for (let y = 12; y <= 13; y++) this.tiles[y][col] = T.GROUND;

    if (col < 10) return;

    const r = this.hashCol(col);

    if (col === this.nextCheckpointCol) {
      this.tiles[9][col] = T.CHECKPOINT;
      this.nextCheckpointCol = col + 18 + Math.floor(this.hashCol(col + 7) * 12);
      return;
    }

    if (r < 0.06) {
      this.tiles[12][col] = T.EMPTY;
      this.tiles[13][col] = T.EMPTY;
      return;
    }

    if (r < 0.13) {
      this.tiles[10][col] = T.PIPE_TL;
      this.tiles[11][col] = T.PIPE_BL;
      return;
    }
    if (r < 0.18) {
      this.tiles[9][col] = T.PIPE_TL;
      this.tiles[10][col] = T.PIPE_BL;
      return;
    }

    if (r < 0.24) {
      this.enemies.push(new Goomba(col * TILE, 11 * TILE - 28));
      return;
    }

    if (r < 0.30) {
      this.tiles[9][col] = T.QUESTION;
      return;
    }
    if (r < 0.34) {
      this.tiles[9][col] = T.BRICK;
      return;
    }
    if (r < 0.38) {
      this.tiles[9][col] = T.BRICK;
      if (col + 1 < this.maxGeneratedCol + 100) this.tiles[9][col + 1] = T.BRICK;
      if (col + 2 < this.maxGeneratedCol + 100) this.tiles[9][col + 2] = T.BRICK;
      return;
    }

    if (r < 0.44) {
      this.coins.push(new Coin(col * TILE + 4, 8 * TILE));
      return;
    }
    if (r < 0.48) {
      for (let i = 0; i < 3; i++) {
        this.coins.push(new Coin((col + i) * TILE + 4, 8 * TILE));
      }
      return;
    }

    if (r < 0.52) {
      this.tiles[11][col] = T.BUSH_M;
      return;
    }

    const cr = this.hashCol(col + 9999);
    if (cr < 0.03) this.tiles[1][col] = T.CLOUD_L;
    else if (cr < 0.05) this.tiles[1][col] = T.CLOUD_M;
    else if (cr < 0.07) this.tiles[1][col] = T.CLOUD_R;
  }

  spawnQuestionPowerups() {
    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        if (this.tiles[y][x] === T.QUESTION) {
          if (this.hashCol(x * 31 + y) < 0.3) {
            this.powerups.push(new PowerUp(x * TILE, (y - 1) * TILE, 'mushroom'));
          }
        }
      }
    }
  }

  makePlayer(): PlayerState {
    return {
      x: 2 * TILE, y: 10 * TILE,
      vx: 0, vy: 0,
      w: 24, h: 30,
      facing: 1,
      onGround: false,
      state: 'small',
      invuln: 0,
      dead: 0,
      jumpHeld: false,
      jumpBuffer: 0,
      active: true,
    };
  }

  loadLevel(_idx: number) {
    this.initEndless();
  }

  spawnQuestionCoins() {
    this.spawnQuestionPowerups();
  }

  start() {
    this.lastTick = performance.now();
    this.startTime = this.lastTick;
    this.loop();
  }

  stop() {
    cancelAnimationFrame(this.rafId);
  }

  setKey(k: string, v: boolean) { this.keys[k] = v; }

  loop = () => {
    const now = performance.now();
    const dt = Math.min((now - this.lastTick) / 16.67, 3);
    this.lastTick = now;
    if (!this.paused && !this.gameOver) {
      this.update(dt);
    }
    this.render();
    this.frameCount++;
    if (this.frameCount % 30 === 0) this.onStateChange();
    this.rafId = requestAnimationFrame(this.loop);
  };

  getTile(col: number, row: number): number {
    if (row < 0 || row >= this.tiles.length) return T.EMPTY;
    if (col < 0 || col >= this.tiles[row].length) return T.EMPTY;
    return this.tiles[row][col];
  }

  setTile(col: number, row: number, v: number) {
    if (row < 0 || row >= this.tiles.length) return;
    if (col < 0 || col >= this.tiles[row].length) return;
    this.tiles[row][col] = v;
  }

  isSolid(t: number) {
    return t === T.GROUND || t === T.BRICK || t === T.PIPE_TL || t === T.PIPE_TR || t === T.PIPE_BL || t === T.PIPE_BR || t === T.QUESTION || t === T.QUSED || t === T.HARD || t === T.LAVA || t === T.CASTLE;
  }

  rectCollide(a: Entity, b: { x: number; y: number; w: number; h: number }) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  update(dt: number) {
    if (this.time > 0) this.time -= dt / 60;
    if (this.time <= 0) { this.die(); return; }

    const p = this.player;
    const left = this.keys['ArrowLeft'] || this.keys['a'];
    const right = this.keys['ArrowRight'] || this.keys['d'];
    const jump = this.keys['ArrowUp'] || this.keys['w'] || this.keys[' '];
    const run = this.keys['Shift'];

    if (p.dead > 0) {
      p.vy += GRAVITY * 0.7 * dt;
      p.y += p.vy * dt;
      p.dead -= dt;
      return;
    }
    if (p.dead <= -60) {
      this.respawnPlayer();
      return;
    }

    if (p.invuln > 0) p.invuln -= dt;

    if (left && !right) {
      p.vx -= 0.4 * dt;
      p.facing = -1;
    } else if (right && !left) {
      p.vx += 0.4 * dt;
      p.facing = 1;
    } else {
      p.vx *= Math.pow(FRICTION, dt);
    }
    const maxV = run ? MAX_RUN : MAX_WALK;
    if (p.vx > maxV) p.vx = maxV;
    if (p.vx < -maxV) p.vx = -maxV;
    if (Math.abs(p.vx) < 0.05) p.vx = 0;

    if (jump && p.onGround) {
      p.vy = JUMP_V;
      p.onGround = false;
      p.jumpHeld = true;
    }
    if (!jump) p.jumpHeld = false;
    if (p.jumpHeld && p.vy < 0) p.vy += GRAVITY * 0.4 * dt;
    else p.vy += GRAVITY * dt;
    if (p.vy > MAX_FALL) p.vy = MAX_FALL;

    p.x += p.vx * dt;
    this.collideX(p);
    p.y += p.vy * dt;
    this.collideY(p);

    if (p.y > this.tiles.length * TILE + 100) { this.die(); return; }

    for (const c of this.coins) {
      if (!c.collected && this.rectCollide(p, c)) {
        c.collected = true; c.active = false;
        this.coinCount++; this.score += 200;
      }
    }
    for (const pu of this.powerups) {
      if (pu.active && this.rectCollide(p, pu)) {
        pu.active = false;
        if (pu.type === 'mushroom') {
          if (p.state === 'small') { p.state = 'big'; p.h = 44; p.y -= 14; }
          this.score += 1000;
        } else if (pu.type === 'fireflower') {
          if (p.state === 'small') { p.h = 44; p.y -= 14; }
          p.state = 'fire';
          this.score += 1000;
        } else if (pu.type === 'star') {
          p.invuln = 600;
          this.score += 1000;
        } else {
          this.lives++;
        }
      }
    }

    for (const e of this.enemies) {
      if (!e.active) continue;
      e.vy += GRAVITY * dt;
      if (e.vy > MAX_FALL) e.vy = MAX_FALL;
      e.x += e.vx * dt;
      this.entityCollideX(e);
      e.y += e.vy * dt;
      this.entityCollideY(e);
      if ('shellMoving' in e && e.inShell && !e.shellMoving) { e.vx = 0; }
      if (this.rectCollide(p, e)) {
        const stomp = p.vy > 0 && p.y + p.h - e.y < 16;
        if (stomp) {
          if (e instanceof Goomba) { e.dead = true; e.active = false; this.score += 100; p.vy = JUMP_V * 0.6; }
          else if (e instanceof Koopa) {
            if (!e.inShell) { e.inShell = true; e.h = 28; e.vx = 0; this.score += 200; p.vy = JUMP_V * 0.6; }
            else if (!e.shellMoving) { e.shellMoving = true; e.vx = p.facing * 6; this.score += 200; p.vy = JUMP_V * 0.6; }
            else { e.shellMoving = false; e.vx = 0; }
          } else if (e instanceof Bowser) {
            e.hp--; e.hitTimer = 30; p.vy = JUMP_V * 0.6;
            if (e.hp <= 0) { e.active = false; this.score += 5000; }
          }
        } else if (p.invuln <= 0) {
          if (e instanceof Bowser) this.hitPlayer();
          else this.hitPlayer();
        }
      }
      if (e.x < this.camera.x - 100) e.active = false;
      if (e.y > this.tiles.length * TILE + 100) e.active = false;
    }

    for (const fb of this.fireballs) {
      fb.vy += GRAVITY * dt;
      fb.x += fb.vx * dt;
      this.entityCollideX(fb);
      fb.y += fb.vy * dt;
      this.entityCollideY(fb);
      if (fb.bounceCount > 3) fb.active = false;
      if (fb.x < this.camera.x || fb.x > this.camera.x + VIEW_W + 100) fb.active = false;
      if (this.rectCollide(p, fb)) { fb.active = false; this.hitPlayer(); }
      for (const e of this.enemies) {
        if (!e.active) continue;
        if (this.rectCollide(fb, e)) {
          fb.active = false;
          if (e instanceof Goomba) { e.active = false; this.score += 100; }
          else if (e instanceof Koopa) {
            if (e.inShell) { e.active = false; this.score += 200; }
            else { e.inShell = true; e.h = 28; }
          } else if (e instanceof Bowser) {
            e.hp--; e.hitTimer = 30;
            if (e.hp <= 0) { e.active = false; this.score += 5000; }
          }
        }
      }
    }

    for (const e of this.enemies) {
      if (e instanceof Bowser && e.active) {
        e.fireTimer -= dt;
        if (e.fireTimer <= 0) {
          this.fireballs.push(new Fireball(e.x + e.w / 2 - 4, e.y + e.h - 16, e.facing * 4));
          e.fireTimer = 140;
        }
        if (e.x < this.camera.x + 50) { e.vx = 0.8; e.facing = 1; }
        if (e.x + e.w > this.camera.x + VIEW_W - 50) { e.vx = -0.8; e.facing = -1; }
      }
    }

    this.coins = this.coins.filter((c) => c.active);
    this.powerups = this.powerups.filter((p) => p.active);
    this.fireballs = this.fireballs.filter((f) => f.active);
    this.enemies = this.enemies.filter((e) => e.active);

    const maxCamX = this.maxGeneratedCol * TILE - VIEW_W;
    const targetCamX = p.x - VIEW_W * 0.35;
    this.camera.x += (targetCamX - this.camera.x) * 0.25;
    if (this.camera.x < 0) this.camera.x = 0;
    if (this.camera.x > maxCamX) this.camera.x = maxCamX;
    if (p.x < this.camera.x + 40) p.x = this.camera.x + 40;
    if (p.x + p.w > this.camera.x + VIEW_W - 20) p.x = this.camera.x + VIEW_W - 20 - p.w;
    this.camera.y = 0;

    this.distance = Math.max(this.distance, Math.floor(p.x / 10));
    this.bestDistance = Math.max(this.bestDistance, this.distance);
    this.score = this.bestDistance + this.coinCount * 200;

    const targetCol = Math.ceil((this.camera.x + VIEW_W * 2.2) / TILE) + 5;
    if (targetCol > this.maxGeneratedCol) {
      this.generateColumns(this.maxGeneratedCol, targetCol);
    }

    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        if (this.tiles[y][x] === T.CHECKPOINT) {
          if (p.x + p.w > x * TILE + 4 && p.x < x * TILE + TILE - 4) {
            if (x > this.lastCheckpointCol) this.lastCheckpointCol = x;
          }
        }
      }
    }
  }

  die() {
    if (this.player.dead <= 0) { this.player.vy = -10; this.player.dead = 90; }
  }

  hitPlayer() {
    const p = this.player;
    if (p.invuln > 0) return;
    if (p.state === 'small') { this.die(); return; }
    p.state = 'small'; p.h = 30; p.invuln = 120;
  }

  completeLevel() {
    // Endless mode: no level completion, just keep going
  }

  respawnPlayer() {
    this.player = this.makePlayer();
    this.player.x = this.lastCheckpointCol * TILE + 8;
    this.player.y = 11 * TILE;
    this.player.invuln = 120;
    this.camera.x = Math.max(0, this.lastCheckpointCol * TILE - VIEW_W * 0.4);
    this.time = 300;
  }

  collideX(e: Entity) {
    const p = e as PlayerState;
    const left = Math.floor(e.x / TILE);
    const right = Math.floor((e.x + e.w - 1) / TILE);
    const top = Math.floor(e.y / TILE);
    const bot = Math.floor((e.y + e.h - 1) / TILE);
    for (let y = top; y <= bot; y++) {
      for (let x = left; x <= right; x++) {
        const t = this.getTile(x, y);
        if (this.isSolid(t)) {
          if (e.vx > 0) e.x = x * TILE - e.w;
          else if (e.vx < 0) e.x = (x + 1) * TILE;
          e.vx = 0;
        }
      }
    }
  }

  collideY(e: Entity) {
    const p = e as PlayerState;
    const left = Math.floor(e.x / TILE);
    const right = Math.floor((e.x + e.w - 1) / TILE);
    const top = Math.floor(e.y / TILE);
    const bot = Math.floor((e.y + e.h - 1) / TILE);
    for (let y = top; y <= bot; y++) {
      for (let x = left; x <= right; x++) {
        const t = this.getTile(x, y);
        if (this.isSolid(t)) {
          if (e.vy > 0) {
            e.y = y * TILE - e.h;
            e.vy = 0;
            e.onGround = true;
          } else if (e.vy < 0) {
            e.y = (y + 1) * TILE;
            e.vy = 0;
            if (e === this.player) this.bumpTile(x, y);
          }
        }
      }
    }
  }

  entityCollideX(e: Entity) {
    const left = Math.floor(e.x / TILE);
    const right = Math.floor((e.x + e.w - 1) / TILE);
    const top = Math.floor(e.y / TILE);
    const bot = Math.floor((e.y + e.h - 1) / TILE);
    for (let y = top; y <= bot; y++) {
      for (let x = left; x <= right; x++) {
        const t = this.getTile(x, y);
        if (this.isSolid(t) && t !== T.LAVA) {
          if (e.vx > 0) e.x = x * TILE - e.w;
          else if (e.vx < 0) e.x = (x + 1) * TILE;
          e.vx = -e.vx;
          if (e instanceof Goomba || e instanceof Koopa) e.vx = -e.vx;
        }
      }
    }
  }

  entityCollideY(e: Entity) {
    const left = Math.floor(e.x / TILE);
    const right = Math.floor((e.x + e.w - 1) / TILE);
    const top = Math.floor(e.y / TILE);
    const bot = Math.floor((e.y + e.h - 1) / TILE);
    e.onGround = false;
    for (let y = top; y <= bot; y++) {
      for (let x = left; x <= right; x++) {
        const t = this.getTile(x, y);
        if (this.isSolid(t) && t !== T.LAVA) {
          if (e.vy > 0) { e.y = y * TILE - e.h; e.vy = 0; e.onGround = true; }
          else if (e.vy < 0) { e.y = (y + 1) * TILE; e.vy = 0; }
        }
      }
    }
  }

  bumpTile(col: number, row: number) {
    const t = this.getTile(col, row);
    if (t === T.QUESTION) {
      this.setTile(col, row, T.QUSED);
      this.coins.push(new Coin(col * TILE + 4, row * TILE - 20));
      this.score += 200;
    } else if (t === T.BRICK) {
      if (this.player.state !== 'small') {
        this.setTile(col, row, T.EMPTY);
        this.score += 50;
      } else {
        this.score += 50;
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const c = this.camera;
    ctx.fillStyle = '#5C94FC';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    const startCol = Math.max(0, Math.floor(c.x / TILE));
    const endCol = Math.min(this.tiles[0].length, Math.ceil((c.x + VIEW_W) / TILE) + 1);
    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = startCol; x < endCol; x++) {
        const t = this.tiles[y][x];
        const px = x * TILE - c.x;
        const py = y * TILE - c.y;
        this.drawTile(t, x, px, py);
      }
    }

    for (const co of this.coins) {
      const px = co.x - c.x;
      const py = co.y - c.y + Math.sin((this.frameCount + co.x) * 0.1) * 2;
      this.drawCoin(px, py);
    }
    for (const pu of this.powerups) {
      const px = pu.x - c.x;
      const py = pu.y - c.y;
      this.drawPowerUp(px, py, pu.type);
    }
    for (const fb of this.fireballs) {
      const px = fb.x - c.x;
      const py = fb.y - c.y;
      ctx.fillStyle = '#FF8800';
      ctx.beginPath();
      ctx.arc(px + 4, py + 4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFCC00';
      ctx.beginPath();
      ctx.arc(px + 4, py + 4, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const e of this.enemies) {
      const px = e.x - c.x;
      const py = e.y - c.y;
      if (e instanceof Goomba) this.drawGoomba(px, py, e.dead);
      else if (e instanceof Koopa) this.drawKoopa(px, py, e);
      else if (e instanceof Bowser) this.drawBowser(px, py, e);
    }

    if (this.player.dead <= 0) this.drawPlayer();

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, VIEW_W, 36);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`PLUMBER`, 16, 22);
    ctx.fillText(`${String(this.score).padStart(6, '0')}`, 16, 50);
    ctx.fillText(`x${String(this.coinCount).padStart(2, '0')}`, VIEW_W / 2 - 30, 50);
    ctx.textAlign = 'center';
    ctx.fillText(`DISTANZ`, VIEW_W / 2, 22);
    ctx.fillText(`${String(this.distance).padStart(5, '0')}m`, VIEW_W / 2, 50);
    ctx.textAlign = 'right';
    ctx.fillText(`BEST`, VIEW_W - 16, 22);
    ctx.fillText(`${String(this.bestDistance).padStart(5, '0')}m`, VIEW_W - 16, 50);

    if (this.paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSE', VIEW_W / 2, VIEW_H / 2);
    }
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.fillStyle = '#E53935';
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', VIEW_W / 2, VIEW_H / 2);
    }
  }

  drawTile(t: number, col: number, x: number, y: number) {
    const ctx = this.ctx;
    switch (t) {
      case T.GROUND:
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(x, y, TILE, 4);
        ctx.fillStyle = '#5C2E0E';
        ctx.fillRect(x + 4, y + 8, 6, 6);
        ctx.fillRect(x + 18, y + 12, 8, 6);
        ctx.fillRect(x + 10, y + 22, 8, 6);
        break;
      case T.BRICK:
        ctx.fillStyle = '#C84C09';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
        ctx.beginPath();
        ctx.moveTo(x, y + 16); ctx.lineTo(x + TILE, y + 16);
        ctx.moveTo(x + 16, y); ctx.lineTo(x + 16, y + 16);
        ctx.moveTo(x + 8, y + 16); ctx.lineTo(x + 8, y + TILE);
        ctx.moveTo(x + 24, y + 16); ctx.lineTo(x + 24, y + TILE);
        ctx.stroke();
        break;
      case T.QUESTION: {
        ctx.fillStyle = '#FFB800';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('?', x + TILE / 2, y + TILE / 2 + 6);
        break;
      }
      case T.QUSED:
        ctx.fillStyle = '#8B5A00';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
        break;
      case T.PIPE_TL:
        ctx.fillStyle = '#00A800';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = '#007800';
        ctx.fillRect(x + 4, y, 6, TILE);
        ctx.fillStyle = '#5CFC5C';
        ctx.fillRect(x + TILE - 6, y, 4, TILE);
        break;
      case T.PIPE_TR:
        ctx.fillStyle = '#00A800';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = '#007800';
        ctx.fillRect(x, y, 6, TILE);
        ctx.fillStyle = '#5CFC5C';
        ctx.fillRect(x + TILE - 6, y, 4, TILE);
        break;
      case T.PIPE_BL:
        ctx.fillStyle = '#00A800';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = '#007800';
        ctx.fillRect(x + 6, y, 6, TILE);
        ctx.fillStyle = '#5CFC5C';
        ctx.fillRect(x + TILE - 8, y, 4, TILE);
        break;
      case T.PIPE_BR:
        ctx.fillStyle = '#00A800';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = '#007800';
        ctx.fillRect(x, y, 6, TILE);
        ctx.fillStyle = '#5CFC5C';
        ctx.fillRect(x + TILE - 8, y, 4, TILE);
        break;
      case T.FLAG_POLE:
        ctx.fillStyle = '#888';
        ctx.fillRect(x + TILE / 2 - 2, y, 4, TILE);
        break;
      case T.FLAG_TOP:
        ctx.fillStyle = '#888';
        ctx.fillRect(x + TILE / 2 - 2, y, 4, TILE);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + 6, 6, 0, Math.PI * 2);
        ctx.fill();
        break;
      case T.CASTLE:
        ctx.fillStyle = '#888';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 8);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + TILE / 2 - 4, y + 12, 8, 12);
        break;
      case T.BUSH_L:
      case T.BUSH_M:
      case T.BUSH_R: {
        ctx.fillStyle = '#00A800';
        const r = 12;
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE, r, Math.PI, 0);
        ctx.fill();
        break;
      }
      case T.CLOUD_L:
      case T.CLOUD_M:
      case T.CLOUD_R: {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + TILE / 2 - 10, y + TILE / 2 + 4, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + TILE / 2 + 10, y + TILE / 2 + 4, 8, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case T.LAVA:
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(x, y + 4, TILE, 4);
        break;
      case T.CHECKPOINT: {
        const reached = col <= this.lastCheckpointCol;
        ctx.fillStyle = '#888';
        ctx.fillRect(x + TILE / 2 - 1, y + 4, 2, TILE - 4);
        ctx.fillStyle = reached ? '#00C800' : '#666';
        ctx.beginPath();
        ctx.moveTo(x + TILE / 2 + 1, y + 4);
        ctx.lineTo(x + TILE - 4, y + 10);
        ctx.lineTo(x + TILE / 2 + 1, y + 16);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = reached ? '#FFD700' : '#aaa';
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + 4, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
  }

  drawPlayer() {
    const ctx = this.ctx;
    const p = this.player;
    if (p.invuln > 0 && Math.floor(p.invuln / 4) % 2 === 0) return;
    const x = p.x - this.camera.x;
    const y = p.y - this.camera.y;
    const big = p.state !== 'small';
    const fire = p.state === 'fire';

    if (big) {
      ctx.fillStyle = '#E40000';
      ctx.fillRect(x + 2, y, 20, 8);
      ctx.fillStyle = '#FFCC99';
      ctx.fillRect(x + 6, y + 8, 12, 8);
    }
    ctx.fillStyle = '#E40000';
    ctx.fillRect(x + 2, big ? y + 8 : y, 20, big ? 6 : 8);
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(x + 6, big ? y + 14 : y + 8, 12, big ? 8 : 8);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + (p.facing > 0 ? 14 : 8), big ? y + 16 : y + 10, 2, 2);
    ctx.fillStyle = fire ? '#FF4500' : '#0000CC';
    ctx.fillRect(x + 4, big ? y + 22 : y + 16, 16, big ? 14 : 8);
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(x + 6, big ? y + 24 : y + 18, 4, 4);
    ctx.fillRect(x + 14, big ? y + 24 : y + 18, 4, 4);
    ctx.fillStyle = fire ? '#FFD700' : '#FFCC00';
    if (fire) {
      ctx.fillRect(x + 4, big ? y + 30 : y + 22, 16, 2);
    }
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 4, big ? y + 36 : y + 24, 6, 4);
    ctx.fillRect(x + 14, big ? y + 36 : y + 24, 6, 4);
  }

  drawGoomba(x: number, y: number, dead: boolean) {
    const ctx = this.ctx;
    if (dead) {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x, y + 18, 28, 10);
      return;
    }
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 2, y, 24, 18);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 4, y + 2, 20, 8);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 8, y + 4, 4, 4);
    ctx.fillRect(x + 16, y + 4, 4, 4);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 9, y + 5, 2, 2);
    ctx.fillRect(x + 17, y + 5, 2, 2);
    ctx.fillStyle = '#5C2E0E';
    ctx.fillRect(x + 2, y + 18, 10, 8);
    ctx.fillRect(x + 16, y + 18, 10, 8);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 4, y + 26, 6, 2);
    ctx.fillRect(x + 18, y + 26, 6, 2);
  }

  drawKoopa(x: number, y: number, k: Koopa) {
    const ctx = this.ctx;
    if (k.inShell) {
      ctx.fillStyle = '#00A800';
      ctx.fillRect(x, y + 16, 28, 12);
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x + 4, y + 18, 20, 8);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 16.5, 27, 11);
      return;
    }
    ctx.fillStyle = '#00A800';
    ctx.fillRect(x + 4, y, 20, 18);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x, y + 6, 28, 24);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 6.5, 27, 23);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + (k.vx > 0 ? 18 : 6), y + 10, 3, 3);
    ctx.fillStyle = '#00A800';
    ctx.fillRect(x + 6, y + 30, 6, 8);
    ctx.fillRect(x + 16, y + 30, 6, 8);
  }

  drawBowser(x: number, y: number, b: Bowser) {
    const ctx = this.ctx;
    const hurt = b.hitTimer > 0 && Math.floor(b.hitTimer / 4) % 2 === 0;
    ctx.fillStyle = hurt ? '#fff' : '#E45000';
    ctx.fillRect(x + 8, y, 40, 24);
    ctx.fillStyle = hurt ? '#fff' : '#FFB800';
    ctx.fillRect(x + 4, y + 20, 48, 32);
    ctx.fillStyle = hurt ? '#fff' : '#00A800';
    ctx.fillRect(x, y + 18, 56, 18);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + (b.facing > 0 ? 30 : 18), y + 6, 4, 4);
    ctx.fillRect(x + (b.facing > 0 ? 40 : 10), y + 6, 4, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + (b.facing > 0 ? 32 : 20), y + 8, 2, 2);
    ctx.fillRect(x + (b.facing > 0 ? 42 : 12), y + 8, 2, 2);
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x + 14, y + 14, 6, 4);
    ctx.fillRect(x + 36, y + 14, 6, 4);
    ctx.fillStyle = '#FFB800';
    ctx.fillRect(x + 8, y + 50, 12, 10);
    ctx.fillRect(x + 36, y + 50, 12, 10);
  }

  drawCoin(x: number, y: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#B8860B';
    ctx.fillRect(x + 11, y + 4, 2, 16);
  }

  drawPowerUp(x: number, y: number, type: string) {
    const ctx = this.ctx;
    if (type === 'mushroom') {
      ctx.fillStyle = '#E40000';
      ctx.beginPath();
      ctx.arc(x + 14, y + 12, 12, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(x + 2, y + 12, 24, 10);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x + 9, y + 9, 2, 0, Math.PI * 2);
      ctx.arc(x + 19, y + 11, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFE4B5';
      ctx.fillRect(x + 4, y + 22, 20, 6);
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 8, y + 14, 4, 4);
      ctx.fillRect(x + 18, y + 14, 4, 4);
    } else if (type === 'fireflower') {
      ctx.fillStyle = '#FF4500';
      ctx.beginPath();
      ctx.arc(x + 14, y + 14, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x + 14, y + 14, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x + 14, y + 14, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x + 14, y + 14, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export default function PlumberJump() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [, setTick] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    const game = new Game(canvasRef.current);
    game.onStateChange = () => setTick((t) => t + 1);
    gameRef.current = game;
    game.start();
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Shift', 'a', 'd', 'w', 's'].includes(e.key)) {
        e.preventDefault();
        game.setKey(e.key, down);
      }
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => {
      game.stop();
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  }, []);

  const handleBtn = (key: string, down: boolean) => {
    if (gameRef.current) gameRef.current.setKey(key, down);
  };

  const restart = () => {
    if (gameRef.current) gameRef.current.loadLevel(0);
  };

  const togglePause = () => {
    if (gameRef.current) gameRef.current.paused = !gameRef.current.paused;
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const g = gameRef.current;

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#000', color: '#fff' }}>
      <header
        style={{
          backgroundColor: waColors.headerBg,
          color: waColors.textOnDark,
          display: 'flex',
          alignItems: 'center',
          padding: '8px 6px',
          height: 56,
          flexShrink: 0,
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        <ArrowLeft size={24} color={waColors.textOnDark} onClick={() => navigate('/wazaaah/chat/mama')} style={{ cursor: 'pointer', padding: 4, marginRight: 8 }} />
        <span style={{ fontSize: 18, fontWeight: 600 }}>🍄 Plumber Boss</span>
        <CollectClueButton clueId="games:plumber" className="ml-2" size={16} />
        <div style={{ flex: 1 }} />
        {g && (
          <button onClick={togglePause} aria-label="Pause" style={{ background: 'transparent', border: 'none', color: waColors.textOnDark, cursor: 'pointer', padding: 6 }}>
            {g.paused ? <Play size={22} /> : <Pause size={22} />}
          </button>
        )}
        <button onClick={toggleFullscreen} aria-label="Vollbild" style={{ background: 'transparent', border: 'none', color: waColors.textOnDark, cursor: 'pointer', padding: 6 }}>
          {isFullscreen ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
        </button>
        <button onClick={restart} aria-label="Neustart" style={{ background: 'transparent', border: 'none', color: waColors.textOnDark, cursor: 'pointer', padding: 6 }}>
          <RotateCcw size={22} />
        </button>
      </header>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 12, overflow: 'auto' }}>
        <canvas
          ref={canvasRef}
          width={VIEW_W}
          height={VIEW_H}
          style={{ maxWidth: '100%', height: 'auto', imageRendering: 'pixelated', border: '4px solid #fff', borderRadius: 4, background: '#5C94FC' }}
        />
        {g && g.gameOver && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: 50, gap: 16, padding: 24, textAlign: 'center' }}>
            <h1 style={{ fontSize: 32, color: '#E40000', textShadow: '2px 2px 0 #fff', margin: 0 }}>PLUMBER BOSS</h1>
            <p style={{ fontSize: 18, color: '#fff' }}>GAME OVER</p>
            <p style={{ fontSize: 14, color: '#FFD700' }}>Punkte: {g.score}</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button onClick={restart} style={{ padding: '12px 24px', fontSize: 16, fontWeight: 700, background: '#E40000', color: '#fff', border: '2px solid #fff', borderRadius: 8, cursor: 'pointer' }}>Nochmal</button>
              <button onClick={() => navigate('/wazaaah/chat/mama')} style={{ padding: '12px 24px', fontSize: 14, background: 'transparent', color: '#fff', border: '2px solid #fff', borderRadius: 8, cursor: 'pointer' }}>Zurück zum Chat</button>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: VIEW_W, justifyContent: 'center' }}>
          <button onTouchStart={() => handleBtn('ArrowLeft', true)} onTouchEnd={() => handleBtn('ArrowLeft', false)} onMouseDown={() => handleBtn('ArrowLeft', true)} onMouseUp={() => handleBtn('ArrowLeft', false)} style={btnStyle}>◀</button>
          <button onTouchStart={() => handleBtn('ArrowRight', true)} onTouchEnd={() => handleBtn('ArrowRight', false)} onMouseDown={() => handleBtn('ArrowRight', true)} onMouseUp={() => handleBtn('ArrowRight', false)} style={btnStyle}>▶</button>
          <button onTouchStart={() => handleBtn(' ', true)} onTouchEnd={() => handleBtn(' ', false)} onMouseDown={() => handleBtn(' ', true)} onMouseUp={() => handleBtn(' ', false)} style={{ ...btnStyle, flex: 2 }}>JUMP</button>
          <button onTouchStart={() => handleBtn('Shift', true)} onTouchEnd={() => handleBtn('Shift', false)} onMouseDown={() => handleBtn('Shift', true)} onMouseUp={() => handleBtn('Shift', false)} style={btnStyle}>RUN</button>
        </div>
        {g && g.gameOver && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={restart} style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, background: waColors.primaryGreen, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Nochmal spielen</button>
            <button onClick={() => navigate('/wazaaah/chat/mama')} style={{ padding: '10px 20px', fontSize: 14, background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: 8, cursor: 'pointer' }}>Zurück zum Chat</button>
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  flex: 1,
  padding: '14px 8px',
  fontSize: 18,
  fontWeight: 700,
  backgroundColor: 'rgba(255,255,255,0.15)',
  color: '#fff',
  border: '2px solid rgba(255,255,255,0.4)',
  borderRadius: 8,
  cursor: 'pointer',
  userSelect: 'none',
  touchAction: 'manipulation',
};
