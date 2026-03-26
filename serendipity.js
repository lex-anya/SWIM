const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const W = canvas.width;
const H = canvas.height;
let t = 0;
let bobOffset = 0;
let sceneTimer = 0;

const WATERLINE = H * 0.55;
const HULL_LEFT = W * 0.55; // hull starts here — mirrored to right side

const audio = document.createElement('audio');
audio.src = localStorage.getItem('audio_src') || 'ARIRANG/IntotheSun.mp3';
audio.currentTime = parseFloat(localStorage.getItem('audio_time') || '180');
audio.play();
document.body.appendChild(audio);

document.body.style.opacity = 0;
window.addEventListener('load', () => {
  document.body.style.transition = 'opacity 4s ease';
  document.body.style.opacity = 1;
});

function drawSky() {
  const sky = ctx.createLinearGradient(0, 0, 0, WATERLINE);
  sky.addColorStop(0, '#2e5a7a');
  sky.addColorStop(0.6, '#4a7a9a');
  sky.addColorStop(1, '#6a9ab8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, WATERLINE);

  // Softer amber sun glow — later in day
  const sunGlow = ctx.createRadialGradient(W * 0.25, H * 0.38, 0, W * 0.25, H * 0.38, W * 0.35);
  sunGlow.addColorStop(0, 'rgba(255, 210, 120, 0.3)');
  sunGlow.addColorStop(0.4, 'rgba(255, 180, 80, 0.09)');
  sunGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, W, WATERLINE);
}

function drawWater() {
  const water = ctx.createLinearGradient(0, WATERLINE, 0, H);
  water.addColorStop(0, '#2a7a96');
  water.addColorStop(0.4, '#1a5a75');
  water.addColorStop(1, '#0e3a52');
  ctx.fillStyle = water;
  ctx.fillRect(0, WATERLINE, W, H - WATERLINE);

  // Horizon line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, WATERLINE);
  ctx.lineTo(W, WATERLINE);
  ctx.stroke();

  // Waves — full width
  for (let i = 0; i < 10; i++) {
    const baseY = WATERLINE + 15 + i * H * 0.04;
    const amp = 3 + i * 0.8 + Math.sin(t * 0.5 + i) * 2;
    const freq = 0.01 - i * 0.0003;
    const speed = t * (0.8 + i * 0.1);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 - i * 0.007})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 3) {
      const y = baseY + Math.sin(x * freq + speed) * amp
              + Math.sin(x * freq * 2.1 - speed * 0.6) * (amp * 0.35);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Sun glint on water — left side (mirrored)
  const glint = ctx.createRadialGradient(W * 0.2, WATERLINE, 0, W * 0.2, WATERLINE + H * 0.15, W * 0.3);
  glint.addColorStop(0, 'rgba(255, 220, 140, 0.1)');
  glint.addColorStop(1, 'transparent');
  ctx.fillStyle = glint;
  ctx.fillRect(0, WATERLINE, HULL_LEFT, H - WATERLINE);
}

function drawHull() {
  // Hull on RIGHT side — from HULL_LEFT to right edge of screen

  // Hull body — Serendipity's dark wood (#180c04 base)
  ctx.fillStyle = '#180c04';
  ctx.fillRect(HULL_LEFT, 0, W - HULL_LEFT, WATERLINE + bobOffset);

  // Submerged hull
  const subGrad = ctx.createLinearGradient(0, WATERLINE + bobOffset, 0, WATERLINE + bobOffset + H * 0.18);
  subGrad.addColorStop(0, 'rgba(30, 14, 4, 0.6)');
  subGrad.addColorStop(1, 'rgba(10, 5, 0, 0.2)');
  ctx.fillStyle = subGrad;
  ctx.fillRect(HULL_LEFT * 1.05, WATERLINE + bobOffset, W - HULL_LEFT, H * 0.18);

  // Plank lines — horizontal, full width of hull
  const plankCount = 12;
  const plankH = WATERLINE / plankCount;
  for (let i = 1; i < plankCount; i++) {
    const y = plankH * i;
    ctx.strokeStyle = 'rgba(8, 4, 1, 0.45)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(HULL_LEFT, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Gold inlay lines — full hull width
  const inlayYs = [WATERLINE * 0.55, WATERLINE * 0.60];
  inlayYs.forEach(y => {
    const inlayGrad = ctx.createLinearGradient(HULL_LEFT, 0, W, 0);
    inlayGrad.addColorStop(0, 'rgba(200, 155, 60, 0.6)');
    inlayGrad.addColorStop(0.5, 'rgba(240, 200, 90, 0.95)');
    inlayGrad.addColorStop(1, 'rgba(200, 155, 60, 0.6)');
    ctx.strokeStyle = inlayGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(HULL_LEFT, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  });

  // Waterline stripe
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(HULL_LEFT, WATERLINE + bobOffset);
  ctx.lineTo(W, WATERLINE + bobOffset);
  ctx.stroke();

  // SERENDIPITY — gold etched, upper right area of hull
  const nameX = W * 0.64;
  const nameY = WATERLINE * 0.69;

  ctx.save();
  ctx.font = `italic ${Math.round(H * 0.037)}px 'Cormorant Garamond', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Purple dot — fullstop on right of name
  ctx.fillStyle = 'rgba(160, 90, 220, 0.7)';
  const dotY = nameY;
  const textHalfW = W * 0.1;
  ctx.beginPath();
  ctx.arc(nameX + textHalfW + 7, nameY, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Purple underline — constrained within hull
  ctx.strokeStyle = 'rgba(150, 80, 210, 0.5)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(Math.max(nameX - textHalfW, HULL_LEFT + 5), nameY + H * 0.028);
  ctx.lineTo(Math.min(nameX + textHalfW, W - 10), nameY + H * 0.028);
  ctx.stroke();

  // Shadow
  ctx.fillStyle = 'rgba(50, 25, 0, 0.85)';
  ctx.fillText('SERENDIPITY', nameX + 2, nameY + 2);

  // Gold gradient
  const nameGrad = ctx.createLinearGradient(nameX - 80, nameY, nameX + 80, nameY);
  nameGrad.addColorStop(0, 'rgba(170, 120, 35, 0.9)');
  nameGrad.addColorStop(0.5, 'rgba(255, 215, 100, 1)');
  nameGrad.addColorStop(1, 'rgba(170, 120, 35, 0.9)');
  ctx.fillStyle = nameGrad;
  ctx.fillText('SERENDIPITY', nameX, nameY);

  ctx.restore();

  // Left edge of hull — shadow where hull meets open water
  const edgeShadow = ctx.createLinearGradient(HULL_LEFT, 0, HULL_LEFT + 40, 0);
  edgeShadow.addColorStop(0, 'rgba(0,0,0,0.4)');
  edgeShadow.addColorStop(1, 'transparent');
  ctx.fillStyle = edgeShadow;
  ctx.fillRect(HULL_LEFT, 0, 40, WATERLINE);

  // Vertical edge line
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(HULL_LEFT, 0);
  ctx.lineTo(HULL_LEFT, WATERLINE);
  ctx.stroke();
}

function drawPorthole() {
  const px = W * 0.9;  // horizontal — distance from left edge of screen
  const py = WATERLINE * 0.27;  // vertical — distance from top, as fraction of waterline height
  const r = H * 0.087;  // radius — controls size of the whole porthole

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

  // Warm light inside cabin
  const cabinLight = ctx.createRadialGradient(px, py + r * 0.5, 0, px, py, r);
  cabinLight.addColorStop(0, 'rgba(255, 200, 120, 0.15)');
  cabinLight.addColorStop(1, 'transparent');
  ctx.fillStyle = cabinLight;
  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.fill();

  // Clip figures to inside the porthole
  ctx.save();
  ctx.beginPath();
  ctx.arc(px, py, r - 2, 0, Math.PI * 2);
  ctx.clip();

  // Figure 1 — left
  drawPortholeF(px - r * 0.38, py, r, 1);   // left figure tilts right
  // Figure 2 — right
  drawPortholeF(px + r * 0.38, py, r, -1);  // right figure tilts left

  ctx.restore();

  // Glass glare
  ctx.beginPath();
  ctx.arc(px - r * 0.5, py - r * 0.37, r * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.057)';
  ctx.fill();

  // Inner ring shadow
  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawPortholeF(fx, fy, r, tiltDir) {
  const headR = r * 0.28;
  const headY = fy + r * 0.15;

  ctx.save();
  ctx.translate(fx, headY);
  ctx.rotate(tiltDir * 0.15); // slight tilt toward center

  // Head
  ctx.fillStyle = 'rgba(195, 145, 90, 0.95)';
  ctx.beginPath();
  ctx.arc(0, 0, headR, 0, Math.PI * 2);
  ctx.fill();

  // Chest — just a hint below the head, clipped by porthole
  ctx.fillStyle = 'rgba(180, 130, 78, 0.85)'; // chest
  ctx.beginPath();
  ctx.ellipse(0, headR * 1.95, headR * 1.4, headR * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawVignette() {
  const vignette = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.15, W * 0.5, H * 0.5, H * 0.9);
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0,0,0,0.2)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function animate() {
  t += 0.04;
  sceneTimer++;
  
  // Auto transition after ~12 seconds (720 frames at 60fps)
  if (sceneTimer >= 720) {
    goTo('serendipityView.html');
    return;
  }
  bobOffset = Math.sin(t * 0.8) * 3;
  ctx.clearRect(0, 0, W, H);
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