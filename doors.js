const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const W = canvas.width;
const H = canvas.height;
let t = 0;

// Door animation state
let doorOpen = 0; // 0 = closed, 1 = fully open
let animating = false;

// Dust particles — same as museum
const particles = Array.from({ length: 60 }, () => ({
  x: Math.random() * W,
  y: Math.random() * H,
  size: Math.random() * 1.5 + 0.3,
  speedX: (Math.random() - 0.5) * 0.15,
  speedY: (Math.random() - 0.5) * 0.08,
  opacity: Math.random() * 0.4 + 0.1
}));

function drawBackground() {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0e0b07');
  bg.addColorStop(0.5, '#0a0805');
  bg.addColorStop(1, '#060503');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Warm light from behind the doors
  const warmLight = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.4);
  warmLight.addColorStop(0, `rgba(255, 210, 130, ${0.06 + doorOpen * 0.12})`);
  warmLight.addColorStop(1, 'transparent');
  ctx.fillStyle = warmLight;
  ctx.fillRect(0, 0, W, H);
}

function drawDoors() {
  const doorW = W / 2;
  const doorH = H;
  const centerX = W / 2;

  // How far each door has swung — using perspective skew
  const swing = doorOpen;

  // Left door — swings left (shrinks in width as it opens)
  const leftW = doorW * (1 - swing * 0.95);

  // Left door body
  const leftGrad = ctx.createLinearGradient(0, 0, leftW, 0);
  leftGrad.addColorStop(0, '#0a0805');
  leftGrad.addColorStop(0.7, '#14100a');
  leftGrad.addColorStop(1, '#1a140e');
  ctx.fillStyle = leftGrad;
  ctx.fillRect(0, 0, leftW, doorH);

  // Left door edge highlight — gold trim
  if (leftW > 5) {
    const inlayGrad = ctx.createLinearGradient(0, 0, 0, H);
    inlayGrad.addColorStop(0, 'transparent');
    inlayGrad.addColorStop(0.2, 'rgba(200, 155, 60, 0.5)');
    inlayGrad.addColorStop(0.8, 'rgba(200, 155, 60, 0.5)');
    inlayGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = inlayGrad;
    ctx.fillRect(leftW - 2, 0, 2, doorH);

    // Door panel lines — subtle recessed panels
    ctx.strokeStyle = `rgba(255, 200, 100, ${0.06 * (1 - swing)})`;
    ctx.lineWidth = 0.5;
    const panelMargin = leftW * 0.12;
    ctx.strokeRect(panelMargin, H * 0.08, leftW - panelMargin * 2, H * 0.38);
    ctx.strokeRect(panelMargin, H * 0.54, leftW - panelMargin * 2, H * 0.38);

    // Door handle — small gold circle
    const handleX = leftW - leftW * 0.18;
    const handleY = H / 2;
    ctx.beginPath();
    ctx.arc(handleX, handleY, 4 * (1 - swing * 0.8), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(200, 155, 60, ${0.7 * (1 - swing)})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Right door — swings right (shrinks in width as it opens)
  const rightW = doorW * (1 - swing * 0.95);
  const rightX = W - rightW;

  // Right door body
  const rightGrad = ctx.createLinearGradient(rightX, 0, W, 0);
  rightGrad.addColorStop(0, '#1a140e');
  rightGrad.addColorStop(0.3, '#14100a');
  rightGrad.addColorStop(1, '#0a0805');
  ctx.fillStyle = rightGrad;
  ctx.fillRect(rightX, 0, rightW, doorH);

  if (rightW > 5) {
    // Right door edge highlight
    const inlayGrad2 = ctx.createLinearGradient(0, 0, 0, H);
    inlayGrad2.addColorStop(0, 'transparent');
    inlayGrad2.addColorStop(0.2, 'rgba(200, 155, 60, 0.5)');
    inlayGrad2.addColorStop(0.8, 'rgba(200, 155, 60, 0.5)');
    inlayGrad2.addColorStop(1, 'transparent');
    ctx.fillStyle = inlayGrad2;
    ctx.fillRect(rightX, 0, 2, doorH);

    // Panel lines
    ctx.strokeStyle = `rgba(255, 200, 100, ${0.06 * (1 - swing)})`;
    ctx.lineWidth = 0.5;
    const rPanelMargin = rightW * 0.12;
    ctx.strokeRect(rightX + rPanelMargin, H * 0.08, rightW - rPanelMargin * 2, H * 0.38);
    ctx.strokeRect(rightX + rPanelMargin, H * 0.54, rightW - rPanelMargin * 2, H * 0.38);

    // Handle
    const rHandleX = rightX + rightW * 0.18;
    ctx.beginPath();
    ctx.arc(rHandleX, H / 2, 4 * (1 - swing * 0.8), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(200, 155, 60, ${0.7 * (1 - swing)})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Center gap glow — light bleeding through as doors open
  if (doorOpen > 0) {
    const gapW = W * doorOpen * 0.15;
    const gapGrad = ctx.createLinearGradient(centerX - gapW, 0, centerX + gapW, 0);
    gapGrad.addColorStop(0, 'transparent');
    gapGrad.addColorStop(0.5, `rgba(255, 210, 130, ${doorOpen * 0.15})`);
    gapGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = gapGrad;
    ctx.fillRect(centerX - gapW, 0, gapW * 2, H);
  }
}

function drawParticles() {
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 220, 150, ${p.opacity * (0.3 + doorOpen * 0.7)})`;
    ctx.fill();
    p.x += p.speedX;
    p.y += p.speedY;
    if (p.x < 0) p.x = W;
    if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H;
    if (p.y > H) p.y = 0;
  });
}

function drawVignette() {
  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, H * 0.85);
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, `rgba(0,0,0,${0.4 - doorOpen * 0.5})`);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function goTo(page) {
  const audio = document.getElementById('bg-audio');
  if (audio) localStorage.setItem('audio_time', audio.currentTime);
  document.body.style.transition = 'opacity 1s ease';
  document.body.style.opacity = 0;
  setTimeout(() => window.location.href = page, 1000);
}

function animate() {
  t += 0.04;
  const audio = document.getElementById('bg-audio');
  if (audio && !audio.paused) {
    localStorage.setItem('audio_time', audio.currentTime);
  }
  ctx.clearRect(0, 0, W, H);

  if (animating) {
    const speed = doorOpen < 0.7 ? 0.018 : 0.006;
    doorOpen = Math.min(doorOpen + speed, 1);
    if (doorOpen >= 1) {
      goTo('intro.html');
      return;
    }
  }

  drawBackground();
  drawDoors();
  drawParticles();
  drawVignette();

  requestAnimationFrame(animate);
}

animate();

canvas.addEventListener('click', () => {
  if (!animating) {
    animating = true;
    const audio = document.getElementById('bg-audio');
    audio.play();
    localStorage.setItem('audio_src', 'ARIRANG/SWIM.mp3');
    localStorage.setItem('audio_time', '0');
  }
});