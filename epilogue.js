const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const W = canvas.width;
const H = canvas.height;

const audio = document.createElement('audio');
audio.src = 'ARIRANG/LikeAnimals.mp3';
audio.play();
document.body.appendChild(audio);

audio.addEventListener('ended', () => {
  // song finished naturally, could loop or stop
});

// Dust particles
const particles = Array.from({ length: 60 }, () => ({
  x: Math.random() * W,
  y: Math.random() * H,
  size: Math.random() * 1.5 + 0.3,
  speedX: (Math.random() - 0.5) * 0.15,
  speedY: (Math.random() - 0.5) * 0.08,
  opacity: Math.random() * 0.4 + 0.1
}));

const FLOOR_Y = H * 0.78;

// 3 cases — same proportions, different depths (scale) and scattered positions
// cy is calculated so the bottom of each case sits ON the floor
const BASE_W = W * 0.12;
const BASE_H = H * 0.26;

const cases = [
  { cx: W * 0.19, depth: 0.75, item: 'ship' },
  { cx: W * 0.42, depth: 0.65, item: 'book' },
  { cx: W * 0.72, depth: 0.88, item: 'ship' },
].map(c => ({
  ...c,
  cy: FLOOR_Y - (BASE_H * c.depth) / 2
}));

function drawCase(c, opacity = 1) {
  const w = BASE_W * c.depth;
  const h = BASE_H * c.depth;
  const left = c.cx - w / 2;
  const top = c.cy - h / 2;

  ctx.save();
  ctx.globalAlpha = opacity * (1 + c.depth * 0.5);

  // Glow behind case
  const glow = ctx.createRadialGradient(c.cx, c.cy, 0, c.cx, c.cy, w * 1.3);
  glow.addColorStop(0, 'rgba(255, 210, 130, 0.06)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(left - 40, top - 40, w + 80, h + 80);

  // Glass sheen
  const sheen = ctx.createLinearGradient(left, top, left + w, top);
  sheen.addColorStop(0, 'rgba(255,255,255,0.01)');
  sheen.addColorStop(0.3, 'rgba(255,255,255,0.04)');
  sheen.addColorStop(1, 'rgba(255,255,255,0.01)');
  ctx.fillStyle = sheen;
  ctx.fillRect(left, top, w, h);

  // Glass border
  ctx.strokeStyle = 'rgba(255, 210, 130, 0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(left, top, w, h);

  // Top highlight
  ctx.strokeStyle = 'rgba(255, 220, 160, 0.25)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left + w, top);
  ctx.stroke();

  // Plinth base
  ctx.fillStyle = 'rgba(255, 200, 100, 0.05)';
  ctx.fillRect(left - 5, top + h, w + 10, 7 * c.depth);
  ctx.strokeStyle = 'rgba(255, 210, 130, 0.12)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(left - 5, top + h, w + 10, 7 * c.depth);

  if (c.item === 'ship') {
    drawShip(c.cx, top + h * 0.72, w * 0.68);
  } else {
    drawBook(c.cx, top + h * 0.18, w * 0.42, h * 0.62);
  }

  ctx.restore();
}

function drawShip(cx, baseY, shipW) {
  const shipX = cx - shipW / 2;
  const s = shipW / 60;

  ctx.strokeStyle = 'rgba(255, 200, 120, 0.35)';
  ctx.lineWidth = 1.2;

  // Hull
  ctx.beginPath();
  ctx.moveTo(shipX + shipW * 0.1, baseY);
  ctx.lineTo(shipX + shipW * 0.9, baseY);
  ctx.quadraticCurveTo(shipX + shipW + 5, baseY + 8 * s, shipX + shipW * 0.75, baseY + 16 * s);
  ctx.lineTo(shipX + shipW * 0.25, baseY + 16 * s);
  ctx.quadraticCurveTo(shipX - 5, baseY + 8 * s, shipX + shipW * 0.1, baseY);
  ctx.fillStyle = 'rgba(255, 180, 80, 0.06)';
  ctx.fill();
  ctx.stroke();

  // Deck line
  ctx.strokeStyle = 'rgba(255, 200, 120, 0.2)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(shipX + shipW * 0.15, baseY + 4 * s);
  ctx.lineTo(shipX + shipW * 0.85, baseY + 4 * s);
  ctx.stroke();

  const mH = 38 * s;
  const fH = 26 * s;

  // Main mast
  ctx.strokeStyle = 'rgba(255, 200, 120, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - shipW * 0.05, baseY);
  ctx.lineTo(cx - shipW * 0.05, baseY - mH);
  ctx.stroke();

  // Fore mast
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx + shipW * 0.22, baseY);
  ctx.lineTo(cx + shipW * 0.22, baseY - fH);
  ctx.stroke();

  // Main sail left
  ctx.strokeStyle = 'rgba(255, 210, 140, 0.3)';
  ctx.fillStyle = 'rgba(255, 200, 120, 0.07)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - shipW * 0.05, baseY - mH);
  ctx.quadraticCurveTo(cx - shipW * 0.28, baseY - mH * 0.6, cx - shipW * 0.05, baseY - 8 * s);
  ctx.lineTo(cx - shipW * 0.05, baseY - mH);
  ctx.fill();
  ctx.stroke();

  // Main sail right
  ctx.beginPath();
  ctx.moveTo(cx - shipW * 0.05, baseY - mH);
  ctx.quadraticCurveTo(cx + shipW * 0.18, baseY - mH * 0.6, cx - shipW * 0.05, baseY - 8 * s);
  ctx.fill();
  ctx.stroke();

  // Fore sail
  ctx.beginPath();
  ctx.moveTo(cx + shipW * 0.22, baseY - fH);
  ctx.quadraticCurveTo(cx + shipW * 0.38, baseY - fH * 0.5, cx + shipW * 0.22, baseY - 4 * s);
  ctx.fill();
  ctx.stroke();

  // Crow's nest
  ctx.strokeStyle = 'rgba(255, 200, 120, 0.3)';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(cx - shipW * 0.1, baseY - mH - 6 * s, shipW * 0.1, 6 * s);

  // Rigging
  ctx.strokeStyle = 'rgba(255, 200, 120, 0.12)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - shipW * 0.05, baseY - mH);
  ctx.lineTo(shipX + shipW * 0.85, baseY + 2 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - shipW * 0.05, baseY - mH);
  ctx.lineTo(cx + shipW * 0.22, baseY - fH);
  ctx.stroke();

  // Bowsprit
  ctx.strokeStyle = 'rgba(255, 200, 120, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(shipX + shipW * 0.85, baseY + 2 * s);
  ctx.lineTo(shipX + shipW + 12 * s, baseY - 10 * s);
  ctx.stroke();
}

function drawBook(cx, topY, bW, bH) {
  const bX = cx - bW / 2;

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(bX + 3, topY + 3, bW, bH);

  ctx.fillStyle = 'rgba(180, 120, 50, 0.12)';
  ctx.fillRect(bX, topY, bW, bH);

  ctx.fillStyle = 'rgba(180, 120, 50, 0.2)';
  ctx.fillRect(bX, topY, 6, bH);

  ctx.strokeStyle = 'rgba(255, 200, 120, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(bX, topY, bW, bH);

  ctx.strokeStyle = 'rgba(255, 200, 120, 0.15)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(bX + 4, topY + 4, bW - 8, bH - 8);

  ctx.strokeStyle = 'rgba(255, 235, 180, 0.2)';
  ctx.lineWidth = 0.4;
  for (let i = 1; i <= 6; i++) {
    ctx.beginPath();
    ctx.moveTo(bX + bW, topY + (bH / 7) * i);
    ctx.lineTo(bX + bW + 2, topY + (bH / 7) * i);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255, 200, 120, 0.2)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(cx + 2, topY + bH * 0.4, 5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 200, 120, 0.08)';
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(bX + 10, topY + (bH / 5) * i);
    ctx.lineTo(bX + bW - 6, topY + (bH / 5) * i);
    ctx.stroke();
  }
}

function drawFigures(opacity = 0.15) {
  const figH = H * 0.13;
  const figures = [
    { x: W * 0.455 },
    { x: W * 0.48 },
    { x: W * 0.505 },
  ];

  figures.forEach(f => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = 'rgba(255, 210, 150, 0.9)';

    const headR = figH * 0.13;
    const bodyW = figH * 0.28;
    const bodyH = figH * 0.38;
    const legH  = figH * 0.32;
    const legW  = bodyW * 0.38;

    // anchor everything from the floor up
    const footY  = FLOOR_Y;
    const bodyY  = footY - legH;
    const headCY = bodyY - bodyH - headR;

    // Head
    ctx.beginPath();
    ctx.arc(f.x, headCY, headR, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillRect(f.x - bodyW / 2, bodyY - bodyH, bodyW, bodyH);

    // Left leg
    ctx.fillRect(f.x - bodyW * 0.42, bodyY, legW, legH);

    // Right leg
    ctx.fillRect(f.x + bodyW * 0.42 - legW, bodyY, legW, legH);

    ctx.restore();
  });
}

function drawMuseum() {
  ctx.clearRect(0, 0, W, H);

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0e0b07');
  bg.addColorStop(0.5, '#0a0805');
  bg.addColorStop(1, '#060503');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Ceiling light
  const ceilingLight = ctx.createRadialGradient(W*0.7, -100, 0, W*0.7, -100, H * 0.9);
  ceilingLight.addColorStop(0, 'rgba(255, 210, 130, 0.45)');
  ceilingLight.addColorStop(1, 'transparent');
  ctx.fillStyle = ceilingLight;
  ctx.fillRect(0, 0, W, H);

  // Floor
  ctx.fillStyle = '#14100a';
  ctx.fillRect(0, H * 0.78, W, H * 0.22);
  const floorGrad = ctx.createLinearGradient(0, H * 0.78, 0, H);
  floorGrad.addColorStop(0, 'rgba(255,200,100,0.03)');
  floorGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, H * 0.78, W, H * 0.22);
  ctx.strokeStyle = 'rgba(255, 200, 100, 0.04)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.78);
  ctx.lineTo(W, H * 0.78);
  ctx.stroke();

  // Cases
  cases.forEach(c => drawCase(c));

  // Figures (dim in intro)
  drawFigures(0.15);

  // Vignette
  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, H * 0.85);
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function drawParticles() {
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 220, 150, ${p.opacity})`;
    ctx.fill();
    p.x += p.speedX;
    p.y += p.speedY;
    if (p.x < 0) p.x = W;
    if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H;
    if (p.y > H) p.y = 0;
  });
}

function animate() {
  if (audio && !audio.paused) {
  localStorage.setItem('audio_src', 'ARIRANG/LikeAnimals.mp3');
  localStorage.setItem('audio_time', audio.currentTime);
}
  drawMuseum();
  drawParticles();
  requestAnimationFrame(animate);
}

animate();

function goTo(page) {
  audio.pause();
  document.body.style.transition = 'opacity 0.7s ease';
  document.body.style.opacity = 0;
  setTimeout(() => window.location.href = page, 700);
}

canvas.addEventListener('click', () => {
  goTo('player.html');
});