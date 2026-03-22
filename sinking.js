const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const W = canvas.width;
const H = canvas.height;
let t = 0;
let darkness = 0; // 0 = teal, 1 = black

const audio = document.createElement('audio');
audio.src = localStorage.getItem('audio_src') || 'ARIRANG/SWIM.mp3';
audio.currentTime = parseFloat(localStorage.getItem('audio_time') || '0');
audio.play();
document.body.appendChild(audio);

// Bubbles drifting upward — makes sinking feel real
const bubbles = Array.from({ length: 35 }, () => ({
  x: Math.random() * W,
  y: Math.random() * H,
  size: Math.random() * 3 + 0.6,
  speed: 3 + Math.random() * 77,
  opacity: Math.random() * 0.3 + 0.1,
  wobble: Math.random() * Math.PI * 2,
}));

// Light rays from above — fade as we sink
const rays = Array.from({ length: 5 }, (_, i) => ({
  x: W * (0.1 + i * 0.2),
  width: 30 + Math.random() * 40,
}));

function drawWater() {
  // Water colour shifts from teal to deep black as darkness increases
  const r = Math.round(42 * (1 - darkness));
  const g = Math.round(122 * (1 - darkness));
  const b = Math.round(138 * (1 - darkness));

  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, W, H);

  // Depth gradient — always darker at bottom
  const depthGrad = ctx.createLinearGradient(0, 0, 0, H);
  depthGrad.addColorStop(0, 'transparent');
  depthGrad.addColorStop(1, `rgba(0, 0, 0, ${0.4 + darkness * 0.6})`);
  ctx.fillStyle = depthGrad;
  ctx.fillRect(0, 0, W, H);
}

function drawRays() {
  if (darkness > 0.7) return; // rays disappear as we go deeper
  const rayOpacity = (1 - darkness / 0.7) * 0.06;

  rays.forEach(r => {
    const rayGrad = ctx.createLinearGradient(r.x, 0, r.x + r.width * 0.5, H * 0.6);
    rayGrad.addColorStop(0, `rgba(150, 220, 240, ${rayOpacity})`);
    rayGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(r.x, 0);
    ctx.lineTo(r.x + r.width, 0);
    ctx.lineTo(r.x + r.width * 1.5, H * 0.6);
    ctx.lineTo(r.x - r.width * 0.5, H * 0.6);
    ctx.closePath();
    ctx.fill();
  });
}

function drawBubbles() {
  bubbles.forEach(b => {
    const opacity = b.opacity * (1 - darkness * 0.8);
    if (opacity <= 0) return;

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(180, 230, 245, ${opacity})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Drift upward — gives sinking sensation
    b.y -= b.speed;
    b.x += Math.sin(t * 0.5 + b.wobble) * 0.3;

    // Reset when they reach top
    if (b.y < -5) {
      b.y = H + 5;
      b.x = Math.random() * W;
    }
  });
}

function drawBlackout() {
  if (darkness <= 0) return;
  ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
  ctx.fillRect(0, 0, W, H);
}

function animate() {
  t += 0.04;

  // Darkness increases
  darkness = Math.min(t / 72, 1);
  audio.volume = Math.max(0, 1 - darkness * 1.7);

  ctx.clearRect(0, 0, W, H);
  drawWater();
  drawRays();
  drawBubbles();
  drawBlackout();

  if (darkness < 1) {
    requestAnimationFrame(animate);
  } else {
    goTo('underwater.html');
  return;
  }
}

animate();

function goTo(page) {
  document.body.style.transition = 'opacity 0.7s ease';
  document.body.style.opacity = 0;
  setTimeout(() => window.location.href = page, 700);
}