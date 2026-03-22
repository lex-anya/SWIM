const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const W = canvas.width;
const H = canvas.height;
let t = 0;

let openTimer = 0;
let eyesFullyOpen = false;
let audioStarted = false;

const audio = document.createElement('audio');
audio.src = 'ARIRANG/MerryGoRound.mp3';
audio.volume = 0;
document.body.appendChild(audio);

// Blink state
let phase = 'closed'; // 'closed' -> 'blinking' -> 'open'
let blinkProgress = 0;
let blinkTimer = 0;
const blinks = [
  { openAt: 60,  closeAt: 110  },  // first blink — slower
  { openAt: 180, closeAt: 240 },   // second blink — slower
  { openAt: 300, closeAt: 999 },   // third blink — stays open faster
];
let blinkIndex = 0;
let eyeOpen = 0; // 0 = fully closed, 1 = fully open

// Bubbles
const bubbles = Array.from({ length: 30 }, () => ({
  x: Math.random() * W,
  y: Math.random() * H,
  size: Math.random() * 3 + 0.5,
  speed: 1.5 + Math.random() * 3,
  opacity: Math.random() * 0.3 + 0.1,
  wobble: Math.random() * Math.PI * 2,
}));

// Light rays from far above
const rays = Array.from({ length: 6 }, (_, i) => ({
  x: W * (0.05 + i * 0.19),
  width: 20 + Math.random() * 30,
}));

function drawWater() {
  // Deep dark water — we're far down
  const waterGrad = ctx.createLinearGradient(0, 0, 0, H);
  waterGrad.addColorStop(0, '#040f14');
  waterGrad.addColorStop(0.5, '#030a0e');
  waterGrad.addColorStop(1, '#020608');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, 0, W, H);
}

function drawRays() {
  rays.forEach((r, i) => {
  const sway = Math.sin(t * 0.3 + i) * 15;
  const rayGrad = ctx.createLinearGradient(r.x + sway, 0, r.x + sway, H * 0.7);
  rayGrad.addColorStop(0, 'rgba(100, 200, 220, 0.03)');
  rayGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = rayGrad;
  ctx.beginPath();
  ctx.moveTo(r.x + sway, 0);
  ctx.lineTo(r.x + sway + r.width, 0);
  ctx.lineTo(r.x + sway + r.width * 2, H * 0.8);
  ctx.lineTo(r.x + sway - r.width, H * 0.8);
  ctx.closePath();
  ctx.fill();
});
}

function drawBubbles() {
  bubbles.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(150, 210, 230, ${b.opacity})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    b.y -= b.speed;
    b.x += Math.sin(t * 1.2 + b.wobble) * 1.2;
    if (b.y < -5) {
      b.y = H + 5;
      b.x = Math.random() * W;
    }
  });
}

function drawBlink() {
  if (eyeOpen >= 1) return;

  const lidH = H * 0.5 * (1 - eyeOpen);

  // Top eyelid — curved bottom edge
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, lidH);
  ctx.quadraticCurveTo(W / 2, lidH + H * 0.04, 0, lidH);
  ctx.closePath();
  ctx.fill();

  // Bottom eyelid — curved top edge
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(W, H);
  ctx.lineTo(W, H - lidH);
  ctx.quadraticCurveTo(W / 2, H - lidH - H * 0.04, 0, H - lidH);
  ctx.closePath();
  ctx.fill();

  // Soft feathered edge on top lid
  const topEdge = ctx.createLinearGradient(0, lidH, 0, lidH + H * 0.08);
  topEdge.addColorStop(0, 'rgba(0,0,0,0.8)');
  topEdge.addColorStop(1, 'transparent');
  ctx.fillStyle = topEdge;
  ctx.fillRect(0, lidH, W, H * 0.08);

  // Soft feathered edge on bottom lid
  const botEdge = ctx.createLinearGradient(0, H - lidH - H * 0.08, 0, H - lidH);
  botEdge.addColorStop(0, 'transparent');
  botEdge.addColorStop(1, 'rgba(0,0,0,0.8)');
  ctx.fillStyle = botEdge;
  ctx.fillRect(0, H - lidH - H * 0.08, W, H * 0.08);
}

function updateBlink() {
  blinkTimer++;
  if (blinkIndex >= blinks.length) {
    // fully open — just ease to 1 and stop
    eyeOpen = Math.min(eyeOpen + 0.035, 1);
    return;
  }

  const b = blinks[blinkIndex];

  if (blinkTimer < b.openAt) {
    eyeOpen = 0;
  } else if (blinkTimer < b.closeAt) {
    const progress = (blinkTimer - b.openAt) / (b.closeAt - b.openAt);
    eyeOpen = Math.sin(progress * Math.PI);
  } else {
    blinkIndex++;
  }
}

function animate() {
  t += 0.04;
  if (audio && !audio.paused) {
    localStorage.setItem('audio_time', audio.currentTime);
  }
  updateBlink();

  if (blinkIndex >= 2 && !audioStarted) {
    audioStarted = true;
    audio.play();
    localStorage.setItem('audio_src', 'ARIRANG/MerryGoRound.mp3');
    localStorage.setItem('audio_time', '0');
    const fadeIn = setInterval(() => {
      if (audio.volume < 1) {
        audio.volume = Math.min(audio.volume + 0.05, 1);
      } else {
        clearInterval(fadeIn);
      }
    }, 50);
  }

  if (eyeOpen >= 1 && blinkIndex >= blinks.length && !eyesFullyOpen) {
    eyesFullyOpen = true;
  }

  if (eyesFullyOpen) {
    openTimer++;
    if (openTimer >= 90) {
      window.location.href = 'swim.html';
      return;
    }
  }

  ctx.clearRect(0, 0, W, H);
  drawWater();
  drawRays();
  drawBubbles();
  drawBlink();

  requestAnimationFrame(animate);
}

animate();