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

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Sky — change to later afternoon
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  sky.addColorStop(0, '#2e5a7a');
  sky.addColorStop(0.6, '#4a7a9a');
  sky.addColorStop(1, '#6a9ab8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.55);

  
  // Sun glow — softer, more golden/amber (later in day)
  const sunGlow = ctx.createRadialGradient(W * 0.62, H * 0.38, 0, W * 0.62, H * 0.38, W * 0.35);
  sunGlow.addColorStop(0, 'rgba(255, 210, 120, 0.3)');
  sunGlow.addColorStop(0.4, 'rgba(255, 180, 80, 0.09)');
  sunGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, W, H * 0.55);


  // Water — deeper, darker
  const water = ctx.createLinearGradient(0, H * 0.55, 0, H * 0.82);
  water.addColorStop(0, '#2a7a96');
  water.addColorStop(0.4, '#1a5a75');
  water.addColorStop(1, '#0e3a52');
  ctx.fillStyle = water;
  ctx.fillRect(0, H * 0.55, W, H * 0.27);

  // Horizon line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.55);
  ctx.lineTo(W, H * 0.55);
  ctx.stroke();

  // Animated wave lines
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const baseY = H * 0.57 + i * H * 0.017;
    const amp = 2 + i * 0.5;
    const freq = 0.008 - i * 0.0005;
    const speed = t * (0.8 + i * 0.1);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 - i * 0.01})`;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 4) {
      const y = baseY + Math.sin(x * freq + speed) * amp;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // ---- WOODEN RAIL ----
  const railTop = H * 0.78;

  // Wood base fill
  const woodGrad = ctx.createLinearGradient(0, railTop, 0, H);
  woodGrad.addColorStop(0, '#180c04');
  woodGrad.addColorStop(0.3, '#180c04');
  woodGrad.addColorStop(0.7, '#180c04');
  woodGrad.addColorStop(1, '#180c04');
  ctx.fillStyle = woodGrad;
  ctx.fillRect(0, railTop, W, H - railTop);
  

  // Golden inlay lines — decorative trim along the rail
  const inlayY1 = railTop + 14;
  const inlayY2 = railTop + 18;
  const inlayGrad = ctx.createLinearGradient(0, 0, W, 0);
  inlayGrad.addColorStop(0, 'transparent');
  inlayGrad.addColorStop(0.1, 'rgba(200, 155, 60, 0.6)');
  inlayGrad.addColorStop(0.5, 'rgba(230, 185, 80, 0.9)');
  inlayGrad.addColorStop(0.9, 'rgba(200, 155, 60, 0.6)');
  inlayGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = inlayGrad;
  ctx.fillRect(0, inlayY1, W, 1.5);
  ctx.fillRect(0, inlayY2, W, 1.5);

  // Tally marks — etched into wood, right side
  const tallyX = W * 0.85;
  const tallyY = railTop + 50;
  const tallyH = 27;
  const tallyGap = 10;

  ctx.strokeStyle = 'rgba(255, 200, 100, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  // Three vertical marks
  for (let i = 0; i < 3; i++) {
    const x = tallyX + i * tallyGap;
    ctx.beginPath();
    ctx.moveTo(x, tallyY);
    ctx.lineTo(x - 5, tallyY + tallyH);
    ctx.stroke();
  }

  // Vertical grain streaks
  ctx.strokeStyle = 'rgba(0,0,0,0.07)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 28; i++) {
    const x = (W / 28) * i + (Math.random() * 8 - 4);
    ctx.beginPath();
    ctx.moveTo(x, railTop);
    ctx.lineTo(x + (Math.random() - 0.5) * 6, H);
    ctx.stroke();
  }

  // Top rail cap — sun-bleached lighter strip
  ctx.fillStyle = '#0e0e1a';
  ctx.fillRect(0, railTop, W, 8);
  // Golden highlight on top edge
  ctx.fillStyle = 'rgba(210, 165, 60, 0.5)';
  ctx.fillRect(0, railTop, W, 2.5);
  // Shadow under cap
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, railTop + 8, W, 5);

  // Subtle sunlight warmth on wood
  const woodLight = ctx.createLinearGradient(0, railTop, W, railTop);
  woodLight.addColorStop(0, 'transparent');
  woodLight.addColorStop(0.6, 'rgba(255, 200, 120, 0.06)');
  woodLight.addColorStop(1, 'transparent');
  ctx.fillStyle = woodLight;
  ctx.fillRect(0, railTop, W, H - railTop);

  // Vignette — light, it's a bright day
  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function animate() {
  t += 0.04;
  sceneTimer++;
  
  audio.addEventListener('ended', () => {
    goTo('epilogue.html');
  });
  draw();
  requestAnimationFrame(animate);
}

animate();

function goTo(page) {
  document.body.style.transition = 'opacity 0.7s ease';
  document.body.style.opacity = 0;
  setTimeout(() => window.location.href = page, 700);
}