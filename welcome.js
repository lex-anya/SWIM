const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const W = canvas.width;
const H = canvas.height;
let t = 0;

let mouseX = 0, mouseY = 0;
canvas.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Dust particles — same as museum
const particles = Array.from({ length: 60 }, () => ({
  x: Math.random() * W,
  y: Math.random() * H,
  size: Math.random() * 1.5 + 0.3,
  speedX: (Math.random() - 0.5) * 0.15,
  speedY: (Math.random() - 0.5) * 0.08,
  opacity: Math.random() * 0.4 + 0.1
}));

// ---- PRELOAD ALL AUDIO ----
const audioFiles = [
  'ARIRANG/SWIM.mp3',
  'ARIRANG/MerryGoRound.mp3',
  'ARIRANG/LikeAnimals.mp3',
  'ARIRANG/IntoTheSun.mp3',
  'ARIRANG/BodytoBody.mp3',
  'ARIRANG/Hooligan.mp3',
  'ARIRANG/Aliens.mp3',
  'ARIRANG/FYA.mp3',
  'ARIRANG/2.mp3',
  'ARIRANG/NORMAL.mp3',
  'ARIRANG/theydontknowboutus.mp3',
  'ARIRANG/OneMoreNight.mp3',
  'ARIRANG/Please.mp3',
  'ARIRANG/IntotheSun.mp3',
];

let loadedCount = 0;
let ready = false;
let transitioning = false;

audioFiles.forEach(src => {
  const a = new Audio();
  a.preload = 'auto';
  a.src = src;
  a.addEventListener('canplaythrough', () => {
    loadedCount++;
    if (loadedCount >= audioFiles.length && !ready) {
      ready = true;
    }
  }, { once: true });
  // Fallback — count errors too so one bad file doesn't block forever
  a.addEventListener('error', () => {
    loadedCount++;
    if (loadedCount >= audioFiles.length && !ready) {
      ready = true;
    }
  }, { once: true });
});

// Fallback — if loading takes more than 12 seconds, just go anyway
setTimeout(() => {
  if (!ready) ready = true;
}, 12000);

// ---- DRAW ----
function drawBackground() {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0e0b07');
  bg.addColorStop(0.5, '#0a0805');
  bg.addColorStop(1, '#060503');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle ceiling light
  const ceilingLight = ctx.createRadialGradient(W / 2, -100, 0, W / 2, -100, H * 0.9);
  ceilingLight.addColorStop(0, 'rgba(255, 210, 130, 0.12)');
  ceilingLight.addColorStop(1, 'transparent');
  ctx.fillStyle = ceilingLight;
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

function drawText() {
  // Slow breathing glow
  const breathe = 0.6 + Math.sin(t * 0.6) * 0.2;

  // Outer soft glow behind text
  const glowGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.25);
  glowGrad.addColorStop(0, `rgba(200, 155, 60, ${0.04 * breathe})`);
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `300 ${Math.round(H * 0.042)}px 'Noto Serif KR', serif`;

  // Shadow layer
  ctx.fillStyle = `rgba(40, 20, 5, ${0.9 * breathe})`;
  ctx.fillText('어서 와, 여기는 처음이지?', W / 2 + 2, H / 2 + 2);

  // Gold gradient on text
  const textGrad = ctx.createLinearGradient(W / 2 - 200, H / 2, W / 2 + 200, H / 2);
  textGrad.addColorStop(0, `rgba(170, 120, 35, ${breathe})`);
  textGrad.addColorStop(0.5, `rgba(220, 175, 80, ${breathe})`);
  textGrad.addColorStop(1, `rgba(170, 120, 35, ${breathe})`);
  ctx.fillStyle = textGrad;
  ctx.fillText('어서 와, 여기는 처음이지?', W / 2, H / 2);

  ctx.restore();
}

function drawTooltip() {
  // Rough text bounding box
  const textW = W * 0.38;
  const textH = H * 0.06;
  const textLeft = W / 2 - textW / 2;
  const textTop = H / 2 - textH / 2;

  if (mouseX < textLeft || mouseX > textLeft + textW ||
      mouseY < textTop || mouseY > textTop + textH) return;

  const tip = 'Welcome, this is your first time here, right?';
  const tipY = H / 2 + H * 0.09;

  ctx.save();
  ctx.font = `300 ${Math.round(H * 0.022)}px 'Noto Serif KR', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Measure for background box
  const tipW = ctx.measureText(tip).width;
  const pad = 14;

  // Background pill
  ctx.fillStyle = 'rgba(10, 8, 5, 0.65)';
  ctx.beginPath();
  ctx.roundRect(W / 2 - tipW / 2 - pad, tipY - 14, tipW + pad * 2, 28, 4);
  ctx.fill();

  // Border
  ctx.strokeStyle = 'rgba(200, 155, 60, 0.15)';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Text
  ctx.fillStyle = 'rgba(200, 155, 60, 0.55)';
  ctx.fillText(tip, W / 2, tipY);

  ctx.restore();
}

function drawLoadingDots() {
  if (ready) return;
  // Subtle dots below text to show loading
  const dotCount = 3;
  const dotSpacing = 12;
  const dotY = H / 2 + H * 0.075;
  const dotStartX = W / 2 - (dotCount - 1) * dotSpacing / 2;

  for (let i = 0; i < dotCount; i++) {
    const phase = (t * 1.2 - i * 0.5);
    const opacity = 0.15 + Math.max(0, Math.sin(phase)) * 0.3;
    ctx.beginPath();
    ctx.arc(dotStartX + i * dotSpacing, dotY, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 155, 60, ${opacity})`;
    ctx.fill();
  }
}

function drawVignette() {
  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, H * 0.85);
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0,0,0,0.82)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

// ---- ANIMATE ----
let readyTimer = 0; // frames since ready became true

function animate() {
  t += 0.04;

  if (ready) {
    readyTimer++;
    // Wait ~5 seconds after ready before transitioning (let text breathe once more)
    if (readyTimer >= 300 && !transitioning) {
      transitioning = true;
      document.body.style.transition = 'opacity 1.2s ease';
      document.body.style.opacity = 0;
      setTimeout(() => window.location.href = 'doors.html', 1200);
    }
  }

  ctx.clearRect(0, 0, W, H);
  drawBackground();
  drawParticles();
  drawText();
  drawTooltip();
  drawLoadingDots();
  drawVignette();

  requestAnimationFrame(animate);
}

animate();