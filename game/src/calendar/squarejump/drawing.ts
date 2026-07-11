const GROUND_HEIGHT = 84;

export function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  const h = w * 0.45;
  ctx.beginPath();
  ctx.ellipse(x + w * 0.3, y + h * 0.6, w * 0.28, h * 0.45, 0, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.55, y + h * 0.4, w * 0.32, h * 0.55, 0, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.78, y + h * 0.65, w * 0.24, h * 0.4, 0, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.5, y + h * 0.75, w * 0.4, h * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawHills(ctx: CanvasRenderingContext2D, w: number, groundY: number) {
  ctx.save();
  const hillColor = "#7ec850";
  ctx.fillStyle = hillColor;
  const baseY = groundY;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  const period = 90;
  for (let x = 0; x <= w; x += 6) {
    const y = baseY - 16 - Math.abs(Math.sin((x / period) * Math.PI * 2)) * 14;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  for (let x = 0; x <= w; x += 6) {
    const y = baseY - 4 - Math.abs(Math.sin((x / period) * Math.PI * 2 + 0.6)) * 4;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawBush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save();
  ctx.fillStyle = "#5fa73a";
  for (let i = 0; i < 3; i++) {
    const cx = x + (i + 0.5) * (w / 3);
    const r = h * (0.55 + (i % 2) * 0.1);
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.55, r, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  for (let i = 0; i < 3; i++) {
    const cx = x + (i + 0.5) * (w / 3) - 2;
    const r = h * (0.55 + (i % 2) * 0.1);
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.4, r * 0.5, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawPipe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  height: number,
) {
  if (height <= 0) return;
  const isTop = y === 0;
  const capH = 26;
  const capExtra = 8;

  ctx.save();
  const bodyGrad = ctx.createLinearGradient(x, 0, x + w, 0);
  bodyGrad.addColorStop(0, "#5fa73a");
  bodyGrad.addColorStop(0.35, "#8ad159");
  bodyGrad.addColorStop(0.5, "#a0e067");
  bodyGrad.addColorStop(0.7, "#7ac749");
  bodyGrad.addColorStop(1, "#4d8a2a");
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(x, isTop ? y + capH : y, w, isTop ? height - capH : height - capH);

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(x + w - 8, isTop ? y + capH : y, 8, isTop ? height - capH : height - capH);

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(x + 4, isTop ? y + capH : y, 4, isTop ? height - capH : height - capH);

  ctx.fillStyle = bodyGrad;
  const capY = isTop ? y : y + height - capH;
  ctx.fillRect(x - capExtra / 2, capY, w + capExtra, capH);

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(
    x - capExtra / 2,
    capY + capH - 5,
    w + capExtra,
    5,
  );
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(x - capExtra / 2 + 4, capY + 3, 4, capH - 6);
  ctx.fillRect(x + w + capExtra / 2 - 8, capY + 3, 4, capH - 6);

  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - capExtra / 2 + 0.5, capY + 0.5, w + capExtra - 1, capH - 1);
  ctx.restore();
}

export function drawGround(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  offset: number,
) {
  const groundY = h - GROUND_HEIGHT;
  ctx.save();

  const dirt = ctx.createLinearGradient(0, groundY, 0, h);
  dirt.addColorStop(0, "#ded895");
  dirt.addColorStop(0.18, "#d6c87a");
  dirt.addColorStop(1, "#bca84e");
  ctx.fillStyle = dirt;
  ctx.fillRect(0, groundY, w, GROUND_HEIGHT);

  ctx.fillStyle = "#7ec850";
  ctx.fillRect(0, groundY, w, 14);
  ctx.fillStyle = "#5fa73a";
  ctx.fillRect(0, groundY + 14, w, 4);

  ctx.fillStyle = "#5fa73a";
  for (let x = -offset; x < w; x += 12) {
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x + 6, groundY - 8);
    ctx.lineTo(x + 12, groundY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  for (let x = -offset; x < w; x += 12) {
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x + 3, groundY - 5);
    ctx.lineTo(x + 6, groundY);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  for (let x = -offset + 4; x < w; x += 18) {
    ctx.fillRect(x, groundY + 26, 6, 3);
    ctx.fillRect(x + 8, groundY + 46, 4, 3);
  }

  ctx.restore();
}

export function drawBird(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rot: number,
  wing: number,
) {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate((rot * Math.PI) / 180);

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(2, size / 2.6, size / 2.1, size / 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  const bodyGrad = ctx.createLinearGradient(0, -size / 2, 0, size / 2);
  bodyGrad.addColorStop(0, "#ffe34a");
  bodyGrad.addColorStop(1, "#f7c200");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size / 2, size / 2.3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(0, size / 7, size / 2.4, size / 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const wingFlap = Math.sin(wing);
  const wingY = wingFlap > 0.2 ? -size / 6 : wingFlap < -0.2 ? size / 8 : 0;
  const wingRot = wingFlap * 0.5;
  ctx.save();
  ctx.translate(-size / 8, wingY);
  ctx.rotate(wingRot);
  const wingGrad = ctx.createLinearGradient(0, -size / 6, 0, size / 6);
  wingGrad.addColorStop(0, "#f1b400");
  wingGrad.addColorStop(1, "#c98a00");
  ctx.fillStyle = wingGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size / 2.6, size / 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(size / 7, -size / 7, size / 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = "#202124";
  ctx.beginPath();
  ctx.arc(size / 4, -size / 7, size / 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(size / 3.5, -size / 8, size / 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f37820";
  ctx.beginPath();
  ctx.moveTo(size / 2.2, -size / 12);
  ctx.lineTo(size / 1.05, -size / 22);
  ctx.lineTo(size / 1.05, size / 22);
  ctx.lineTo(size / 2.2, size / 12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#d65a0a";
  ctx.beginPath();
  ctx.moveTo(size / 2.2, size / 24);
  ctx.lineTo(size / 1.05, size / 22);
  ctx.lineTo(size / 1.05, size / 6);
  ctx.lineTo(size / 2.2, size / 12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#e8334d";
  ctx.beginPath();
  ctx.moveTo(-size / 3, -size / 2.4);
  ctx.lineTo(-size / 2.2, -size / 1.6);
  ctx.lineTo(-size / 4, -size / 1.7);
  ctx.lineTo(-size / 5, -size / 2.6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}
