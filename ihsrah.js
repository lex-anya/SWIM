// Resume audio from previous page
const audio = document.createElement('audio');
audio.src = localStorage.getItem('audio_src') || 'ARIRANG/SWIM.mp3';
audio.currentTime = parseFloat(localStorage.getItem('audio_time') || '0');
audio.play();
document.body.appendChild(audio);
setInterval(() => {
  localStorage.setItem('audio_time', audio.currentTime);
}, 1000);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const W = canvas.width;
const H = canvas.height;
let t = 0;

let sceneTimer = 0;

const WATERLINE = H * 0.55;
const HULL_RIGHT = W * 0.45; // where hull ends, sea begins

let bobOffset = 0;

function drawSky() {
  const sky = ctx.createLinearGradient(0, 0, 0, WATERLINE);
  sky.addColorStop(0, '#2a3f52');
  sky.addColorStop(0.6, '#3a5568');
  sky.addColorStop(1, '#4a6a7a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, WATERLINE);
}

function drawWater() {
  const water = ctx.createLinearGradient(0, WATERLINE, 0, H);
  water.addColorStop(0, '#2a7a8a');
  water.addColorStop(0.4, '#1a5a6a');
  water.addColorStop(1, '#0e3a4a');
  ctx.fillStyle = water;
  ctx.fillRect(0, WATERLINE, W, H - WATERLINE);

  // Horizon line — full width
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, WATERLINE);
  ctx.lineTo(W, WATERLINE);
  ctx.stroke();

  // Waves — full width across entire screen
  for (let i = 0; i < 10; i++) {
    const baseY = WATERLINE + 15 + i * H * 0.04;
    const amp = 3 + i * 0.8 + Math.sin(t * 0.5 + i) * 2;
    const freq = 0.01 - i * 0.0003;
    const speed = t * (1.97 + i * 0.15);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.14 - i * 0.01})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 3) {
      const y = baseY + Math.sin(x * freq + speed) * amp
              + Math.sin(x * freq * 2.1 - speed * 0.6) * (amp * 0.35);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Sun glint on water right side
  const glint = ctx.createRadialGradient(W * 0.8, WATERLINE, 0, W * 0.8, WATERLINE + H * 0.15, W * 0.3);
  glint.addColorStop(0, 'rgba(255, 240, 180, 0.1)');
  glint.addColorStop(1, 'transparent');
  ctx.fillStyle = glint;
  ctx.fillRect(HULL_RIGHT, WATERLINE, W - HULL_RIGHT, H - WATERLINE);
}

function drawHull() {
  // Flat straight hull — left side of screen, no curves, like a proper tall ship side
  // Hull goes from left edge to HULL_RIGHT, top of screen to WATERLINE

  // Hull body
  const hullGrad = ctx.createLinearGradient(0, 0, HULL_RIGHT, 0);
  hullGrad.addColorStop(0, '#1a0e04');
  hullGrad.addColorStop(0.7, '#2a1508');
  hullGrad.addColorStop(1, '#1e1006');
  ctx.fillStyle = hullGrad;
  ctx.fillRect(0, 0, HULL_RIGHT, WATERLINE + bobOffset);

  // Submerged hull — below waterline
  const subGrad = ctx.createLinearGradient(0, WATERLINE, 0, WATERLINE + H * 0.18);
  subGrad.addColorStop(0, 'rgba(18, 10, 2, 0.7)');
  subGrad.addColorStop(1, 'rgba(8, 4, 0, 0.3)');
  ctx.fillStyle = subGrad;
  ctx.fillRect(0, WATERLINE + bobOffset, HULL_RIGHT * 0.85, H * 0.18);

  // Plank lines — horizontal, full width of hull
  const plankCount = 12;
  const plankH = WATERLINE / plankCount;
  for (let i = 1; i < plankCount; i++) {
    const y = plankH * i;
    ctx.strokeStyle = 'rgba(8, 4, 1, 0.45)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(HULL_RIGHT, y);
    ctx.stroke();
  }

  // Gold inlay lines — spanning full width of hull
  const inlayYs = [WATERLINE * 0.55, WATERLINE * 0.60];
  inlayYs.forEach(y => {
    const inlayGrad = ctx.createLinearGradient(0, 0, HULL_RIGHT, 0);
    inlayGrad.addColorStop(0, 'rgba(200, 155, 60, 0.6)');
    inlayGrad.addColorStop(0.5, 'rgba(240, 200, 90, 0.95)');
    inlayGrad.addColorStop(1, 'rgba(200, 155, 60, 0.6)');
    ctx.strokeStyle = inlayGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(HULL_RIGHT, y);
    ctx.stroke();
  });

  // Waterline stripe — full hull width
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, WATERLINE + bobOffset);
  ctx.lineTo(HULL_RIGHT, WATERLINE + bobOffset);
  ctx.stroke();

  // IHSRAH — smaller, upper portion of hull, left aligned
  const nameX = W * 0.38;
  const nameY = WATERLINE * 0.71;

  ctx.save();
  ctx.font = `italic ${Math.round(H * 0.036)}px 'IM Fell English', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Shadow
  ctx.fillStyle = 'rgba(50, 25, 0, 0.85)';
  ctx.fillText('IHSRAH', nameX + 2, nameY + 2);

  // Gold
  const nameGrad = ctx.createLinearGradient(nameX - 60, nameY, nameX + 60, nameY);
  nameGrad.addColorStop(0, 'rgba(170, 120, 35, 0.9)');
  nameGrad.addColorStop(0.5, 'rgba(255, 215, 100, 1)');
  nameGrad.addColorStop(1, 'rgba(170, 120, 35, 0.9)');
  ctx.fillStyle = nameGrad;
  ctx.fillText('IHSRAH', nameX, nameY);

  ctx.restore();

  // Vertical edge of hull — sharp right edge where hull meets sea
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(HULL_RIGHT, 0);
  ctx.lineTo(HULL_RIGHT, WATERLINE);
  ctx.stroke();

  // Shadow on right edge of hull
  const edgeShadow = ctx.createLinearGradient(HULL_RIGHT - 40, 0, HULL_RIGHT, 0);
  edgeShadow.addColorStop(0, 'transparent');
  edgeShadow.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = edgeShadow;
  ctx.fillRect(HULL_RIGHT - 40, 0, 40, WATERLINE);
}

function drawPorthole() {
  const px = W * 0.08;
  const py = WATERLINE * 0.27;
  const r = H * 0.087;

  // Outer brass ring
  ctx.beginPath();
  ctx.arc(px, py, r + 5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(200, 155, 60, 0.9)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Glass — dark interior
  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(8, 18, 28, 0.85)';
  ctx.fill();

  // Warm light inside — empty cabin
  const cabinLight = ctx.createRadialGradient(px, py + r * 0.3, 0, px, py, r);
  cabinLight.addColorStop(0, 'rgba(255, 200, 120, 0.05)');
  cabinLight.addColorStop(1, 'transparent');
  ctx.fillStyle = cabinLight;
  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.fill();

  // Glass glare
  ctx.beginPath();
  ctx.arc(px + r * 0.5, py - r * 0.37, r * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.fill();

  // Inner ring shadow
  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawVignette() {
  const vignette = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.15, W * 0.5, H * 0.5, H * 0.9);
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function animate() {
    t += 0.04;
    sceneTimer++;
  
  // Auto transition after ~1.5 seconds (60 frames at 60fps)
  if (sceneTimer >= 90) {
    goTo('sinking.html');
    return;
  }
    ctx.clearRect(0, 0, W, H);
    bobOffset = Math.sin(t * 0.8) * 3;
    drawSky();
    drawWater();
    drawHull();
    drawPorthole();
    drawVignette();
    requestAnimationFrame(animate);
}

animate();

function goTo(page) {
  localStorage.setItem('audio_time', audio.currentTime);
  document.body.style.transition = 'opacity 0.7s ease';
  document.body.style.opacity = 0;
  setTimeout(() => window.location.href = page, 700);
}