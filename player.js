const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const W = canvas.width;
const H = canvas.height;
let t = 0;

// ---- TRACKLIST ----
const tracks = [
  { title: 'Body to Body', file: 'ARIRANG/BodytoBody.mp3' },
  { title: 'Hooligan', file: 'ARIRANG/Hooligan.mp3' },
  { title: 'Aliens', file: 'ARIRANG/Aliens.mp3' },
  { title: 'FYA', file: 'ARIRANG/FYA.mp3' },
  { title: '2.0', file: 'ARIRANG/IntoTheSun.mp3' },
  { title: 'No. 29', file: 'ARIRANG/2.mp3' },
  { title: 'SWIM', file: 'ARIRANG/SWIM.mp3' },
  { title: 'Merry Go Round', file: 'ARIRANG/MerryGoRound.mp3' },
  { title: 'NORMAL', file: 'ARIRANG/NORMAL.mp3' },
  { title: 'Like Animals', file: 'ARIRANG/LikeAnimals.mp3' },
  { title: 'they don\'t know \'bout us', file: 'ARIRANG/theydontknowboutus.mp3' },
  { title: 'One More Night', file: 'ARIRANG/OneMoreNight.mp3' },
  { title: 'Please', file: 'ARIRANG/Please.mp3' },
  { title: 'Into the Sun', file: 'ARIRANG/IntotheSun.mp3' },
];

// ---- AUDIO ----
const audio = document.getElementById('bg-audio');
let currentTrack = -1;
let spinAngle = 0;

window.addEventListener('load', () => {
  const savedSrc = localStorage.getItem('audio_src');
  const savedTime = parseFloat(localStorage.getItem('audio_time') || '0');
  
  if (savedSrc && savedSrc.includes('LikeAnimals')) {
    // Coming from epilogue — resume Like Animals
    localStorage.setItem('vinyl_visited', 'true');
    playTrack(9, savedTime);
    localStorage.removeItem('audio_src');
    localStorage.removeItem('audio_time');
    buildTracklist();
  } else if (!localStorage.getItem('vinyl_visited')) {
    // First ever visit with no epilogue — start Like Animals from beginning
    localStorage.setItem('vinyl_visited', 'true');
    playTrack(9, 0);
    buildTracklist();
  } else {
    // Subsequent reload — nothing plays
    localStorage.removeItem('vinyl_track');
    localStorage.removeItem('vinyl_time');
    currentTrack = -1;
    buildTracklist();
  }
});

function playTrack(index, startTime = 0) {
  currentTrack = index;
  audio.src = tracks[index].file;
  audio.currentTime = startTime;
  audio.play();
  updateTrackHighlight();
}

audio.addEventListener('ended', () => {
  playTrack((currentTrack + 1) % tracks.length);
});

setInterval(() => {
  if (currentTrack >= 0) {
    localStorage.setItem('vinyl_track', currentTrack);
    localStorage.setItem('vinyl_time', audio.currentTime);
  }
}, 2000);

// ---- RECORD PLAYER DIMENSIONS ----
const cx = W / 2;
const cy = H * 0.46;
const recordR = Math.min(W, H) * 0.32;

// ---- DRAW RECORD PLAYER ----
function drawBase() {
  // Wooden plinth base
  const bw = recordR * 2.6;
  const bh = recordR * 2.2;
  const bx = cx - bw / 2;
  const by = cy - bh * 0.5;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.roundRect(bx + 8, by + 8, bw, bh, 12);
  ctx.fill();

  // Base body
  const baseGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
  baseGrad.addColorStop(0, '#1a0e04');
  baseGrad.addColorStop(0.4, '#2a1508');
  baseGrad.addColorStop(1, '#120a02');
  ctx.fillStyle = baseGrad;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 12);
  ctx.fill();

  // Gold border
  ctx.strokeStyle = 'rgba(200, 155, 60, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 12);
  ctx.stroke();

  // Inner gold inlay lines
  ctx.strokeStyle = 'rgba(200, 155, 60, 0.25)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.roundRect(bx + 8, by + 8, bw - 16, bh - 16, 8);
  ctx.stroke();

  // Wood grain
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 12; i++) {
    const gx = bx + (bw / 12) * i + Math.random() * 5;
    ctx.beginPath();
    ctx.moveTo(gx, by);
    ctx.lineTo(gx + (Math.random() - 0.5) * 4, by + bh);
    ctx.stroke();
  }
}

function drawRecord() {
  // Outer record — very dark with grooves
  ctx.beginPath();
  ctx.arc(cx, cy, recordR, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0806';
  ctx.fill();

  // Groove rings
  for (let r = recordR * 0.35; r < recordR * 0.96; r += recordR * 0.045) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Sheen on record (light reflection)
  const sheen = ctx.createRadialGradient(
    cx - recordR * 0.3, cy - recordR * 0.3, 0,
    cx, cy, recordR
  );
  sheen.addColorStop(0, 'rgba(255,255,255,0.06)');
  sheen.addColorStop(0.5, 'transparent');
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.arc(cx, cy, recordR, 0, Math.PI * 2);
  ctx.fill();

  // Gold label in center
  const labelR = recordR * 0.28;
  const labelGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, labelR);
  labelGrad.addColorStop(0, '#c8a050');
  labelGrad.addColorStop(0.6, '#b08030');
  labelGrad.addColorStop(1, '#8a6020');
  ctx.fillStyle = labelGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, labelR, 0, Math.PI * 2);
  ctx.fill();

  // Label text
  ctx.fillStyle = 'rgba(30, 15, 3, 0.85)';
  ctx.font = `italic bold ${Math.round(recordR * 0.1)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ARIRANG', cx, cy - recordR * 0.05);

  // Track name below
  if (currentTrack >= 0) {
    ctx.font = `italic ${Math.round(recordR * 0.065)}px Georgia, serif`;
    ctx.fillStyle = 'rgba(30, 15, 3, 0.65)';
    ctx.fillText(tracks[currentTrack].title, cx, cy + recordR * 0.1);
  }

  // Center spindle hole
  ctx.beginPath();
  ctx.arc(cx, cy, recordR * 0.025, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0806';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,155,60,0.4)';
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

// ---- PAUSE BUTTON ----
function drawPauseBtn() {
  if (currentTrack === -1) return; // hide until a track is selected
  const bx = cx + recordR * 1.1;
  const by = cy + recordR * 0.9;
  const br = 22;

  ctx.beginPath();
  ctx.arc(bx, by, br, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(200,155,60,0.15)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,155,60,0.55)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = 'rgba(200,155,60,0.85)';
  if (audio.paused) {
    // Play triangle
    ctx.beginPath();
    ctx.moveTo(bx - 7, by - 9);
    ctx.lineTo(bx + 11, by);
    ctx.lineTo(bx - 7, by + 9);
    ctx.closePath();
    ctx.fill();
  } else {
    // Pause bars
    ctx.fillRect(bx - 8, by - 8, 5, 16);
    ctx.fillRect(bx + 3, by - 8, 5, 16);
  }

  // Store button position for click detection
  vinyl_pauseBtn = { x: bx, y: by, r: br };
}

let vinyl_pauseBtn = null;

function drawArm() {
  // Pivot point — top right of record
  const pivotX = cx + recordR * 1.05;
  const pivotY = cy - recordR * 0.85;

  // Arm angle — resting position slightly over record
  const armAngle = Math.PI * 0.82;
  const armLen = recordR * 1.15;
  const tipX = pivotX + Math.cos(armAngle) * armLen;
  const tipY = pivotY + Math.sin(armAngle) * armLen;

  // Pivot base circle
  const pivotGrad = ctx.createRadialGradient(pivotX, pivotY, 0, pivotX, pivotY, 18);
  pivotGrad.addColorStop(0, '#c8a050');
  pivotGrad.addColorStop(1, '#8a6020');
  ctx.fillStyle = pivotGrad;
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,155,60,0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Arm body
  ctx.strokeStyle = 'rgba(200,165,70,0.9)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  // Arm highlight
  ctx.strokeStyle = 'rgba(255,220,120,0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  // Needle head
  ctx.fillStyle = 'rgba(180,140,50,0.9)';
  ctx.beginPath();
  ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
  ctx.fill();

  // Pivot inner dot
  ctx.fillStyle = '#0a0806';
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
  ctx.fill();
}

// ---- CLICK HINT ----
function drawHint() {
  ctx.fillStyle = `rgba(200, 155, 60, ${0.2 + Math.sin(t * 0.8) * 0.1})`;
  ctx.font = `italic ${Math.round(H * 0.018)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('click to browse tracks', cx, cy + recordR * 1.35);
}

// ---- MUSEUM BACKGROUND ----
const particles = Array.from({ length: 60 }, () => ({
  x: Math.random() * W, y: Math.random() * H,
  size: Math.random() * 1.5 + 0.3,
  speedX: (Math.random() - 0.5) * 0.15,
  speedY: (Math.random() - 0.5) * 0.08,
  opacity: Math.random() * 0.4 + 0.1,
}));

function drawBackground() {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0e0b07');
  bg.addColorStop(0.5, '#0a0805');
  bg.addColorStop(1, '#060503');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const light = ctx.createRadialGradient(W / 2, -100, 0, W / 2, -100, H * 0.9);
  light.addColorStop(0, 'rgba(255, 210, 130, 0.07)');
  light.addColorStop(1, 'transparent');
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 220, 150, ${p.opacity})`;
    ctx.fill();
    p.x += p.speedX; p.y += p.speedY;
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
  });

  // Floor
  ctx.fillStyle = '#14100a';
  ctx.fillRect(0, H * 0.85, W, H * 0.15);
  ctx.strokeStyle = 'rgba(255, 200, 100, 0.04)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.85);
  ctx.lineTo(W, H * 0.85);
  ctx.stroke();

  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, H * 0.85);
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0,0,0,0.88)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

// ---- ANIMATE ----
function animate() {
  t += 0.04;
  if (!audio.paused) spinAngle += 0.012;

  ctx.clearRect(0, 0, W, H);
  drawBackground();
  drawBase();
  // Save and rotate canvas for spinning record
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(spinAngle);
  ctx.translate(-cx, -cy);
  drawRecord();
  ctx.restore();

  drawArm();
  drawPauseBtn();
  drawHint();

  requestAnimationFrame(animate);
}

animate();

// ---- CLICK on canvas ----
canvas.addEventListener('click', e => {
  // Check pause button first
  if (vinyl_pauseBtn) {
    const dx = e.clientX - vinyl_pauseBtn.x;
    const dy = e.clientY - vinyl_pauseBtn.y;
    if (Math.sqrt(dx * dx + dy * dy) < vinyl_pauseBtn.r) {
      audio.paused ? audio.play() : audio.pause();
      return;
    }
  }

  // Click on record → open tracklist
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  if (Math.sqrt(dx * dx + dy * dy) < recordR) {
    document.getElementById('book-overlay').classList.add('open');
  }
});

// ---- TRACKLIST ----
function buildTracklist() {
  const half = Math.ceil(tracks.length / 2);
  const leftTracks  = tracks.slice(0, half);
  const rightTracks = tracks.slice(half);

  function makeItems(list, offset) {
    return list.map((track, i) => {
      const idx = i + offset;
      return `<div class="track-item" data-index="${idx}" style="
        font-family: Georgia, serif;
        font-style: italic;
        font-size: 1.05rem;
        color: rgba(70, 42, 12, 0.7);
        border-bottom: 1px solid rgba(160,120,50,0.12);
        cursor: pointer;
        transition: color 0.2s;
        letter-spacing: 0.03em;
        width: 100%;
        flex: 1;
        display: flex;
        align-items: center;
      ">${track.title}</div>`;
    }).join('');
  }

  // Left page
  const leftEl = document.getElementById('puzzle-left');
  leftEl.style.cssText = 'width:85%;height:85%;display:flex;flex-direction:column;align-items:stretch;';
  leftEl.innerHTML = `
    <div style="
      font-family:Georgia,serif;
      font-style:italic;
      font-weight: bold;
      font-size:1.5rem;
      color:rgba(70,42,12,0.75);
      text-align:center;
      letter-spacing:0.08em;
      padding-bottom:10px;
      border-bottom:1px solid rgba(160,120,50,0.2);
      margin-bottom:8px;
      flex-shrink:0;
    ">ARIRANG</div>
    <div style="flex:1;display:flex;flex-direction:column;">
      ${makeItems(leftTracks, 0)}
    </div>`;

  // Right page
  const rightEl = document.getElementById('puzzle-right');
  rightEl.style.cssText = 'width:85%;height:85%;display:flex;flex-direction:column;align-items:stretch;position:relative;';
  rightEl.innerHTML = `
    <button id="overlay-close" style="
      position:absolute;
      top:-8px; right:-8px;
      background:transparent;
      border:1px solid rgba(160,120,50,0.4);
      color:rgba(100,65,20,0.7);
      font-family:Georgia,serif;
      font-size:1.1rem;
      width:28px; height:28px;
      cursor:pointer;
      border-radius:2px;
      line-height:1;
    ">✕</button>
    <div style="flex:1;display:flex;flex-direction:column;padding-top:8px;">
      ${makeItems(rightTracks, half)}
    </div>`;

  document.querySelectorAll('.track-item').forEach(el => {
    el.addEventListener('mouseenter', () => el.style.color = 'rgba(100,60,10,0.95)');
    el.addEventListener('mouseleave', () => {
      if (parseInt(el.dataset.index) !== currentTrack)
        el.style.color = 'rgba(70,42,12,0.7)';
    });
    el.addEventListener('click', () => {
      playTrack(parseInt(el.dataset.index));
      document.getElementById('book-overlay').classList.remove('open');
    });
  });

  document.getElementById('overlay-close').addEventListener('click', () => {
    document.getElementById('book-overlay').classList.remove('open');
  });

  updateTrackHighlight();
}

function updateTrackHighlight() {
  document.querySelectorAll('.track-item').forEach(el => {
    const i = parseInt(el.dataset.index);
    el.style.color = i === currentTrack ? 'rgba(140,90,20,1)' : 'rgba(70,42,12,0.7)';
    el.style.fontWeight = i === currentTrack ? 'bold' : 'normal';
  });
}

buildTracklist();

document.getElementById('book-overlay').addEventListener('click', function(e) {
  if (e.target === this) this.classList.remove('open');
});