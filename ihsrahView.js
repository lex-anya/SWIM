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

  // Sky — bright day
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  sky.addColorStop(0, '#4a8fc4');   // was #5a9fd4
  sky.addColorStop(0.6, '#6db5e0'); // was #7dbfe8
  sky.addColorStop(1, '#90ccf0');   // was #a8d8f0
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.55);

  // Sun glow
  const sunGlow = ctx.createRadialGradient(W * 0.62, H * 0.25, 0, W * 0.62, H * 0.25, W * 0.45);
  sunGlow.addColorStop(0, 'rgba(255, 255, 220, 0.55)');  // was 0.35
  sunGlow.addColorStop(0.4, 'rgba(255, 230, 160, 0.22)'); // was 0.12
  sunGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, W, H * 0.55);

  // Water — bright teal - light on the surface
  const water = ctx.createLinearGradient(0, H * 0.55, 0, H * 0.82);
  water.addColorStop(0, '#4ab8d4');  // was #3a9eba
  water.addColorStop(0.4, '#3a90aa'); // was #2a7a95
  water.addColorStop(1, '#2a6a82');  // was #1a5a72
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
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - i * 0.01})`;
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
  woodGrad.addColorStop(0, '#1e0f05');
  woodGrad.addColorStop(0.3, '#2a1508');
  woodGrad.addColorStop(0.7, '#180c04');
  woodGrad.addColorStop(1, '#100804');
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

  // Wood plank dividers
  const plankCount = 5;
  const plankH = (H - railTop) / plankCount;
  for (let i = 0; i < plankCount; i++) {
    const y = railTop + plankH * i;

    // Alternating plank tone
    ctx.fillStyle = i % 2 === 0
      ? 'rgba(0,0,0,0.08)'
      : 'rgba(255,200,120,0.04)';
    ctx.fillRect(0, y, W, plankH * 0.9);

    // Plank gap line
    ctx.strokeStyle = 'rgba(15, 8, 3, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y + plankH * 0.92);
    ctx.lineTo(W, y + plankH * 0.92);
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
  ctx.fillStyle = '#2a1608';
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
  vignette.addColorStop(1, 'rgba(0,0,0,0.25)'); // was 0.4
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function animate() {
  t += 0.04;
  sceneTimer++;
  
  // Auto transition after ~10 seconds (600 frames at 60fps)
  if (sceneTimer >= 600) {
    goTo('storm.html');
    return;
  }
  draw();
  requestAnimationFrame(animate);
}

animate();

function goTo(page) {
  localStorage.setItem('audio_time', audio.currentTime);
  document.body.style.transition = 'opacity 0.7s ease';
  document.body.style.opacity = 0;
  setTimeout(() => window.location.href = page, 700);
}