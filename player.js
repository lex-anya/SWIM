const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const W = canvas.width;
const H = canvas.height;
let t = 0;

const isMobile = window.innerWidth < 768;

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
    localStorage.setItem('vinyl_visited', 'true');
    playTrack(9, savedTime);
    localStorage.removeItem('audio_src');
    localStorage.removeItem('audio_time');
    buildTracklist();
  } else if (!localStorage.getItem('vinyl_visited')) {
    localStorage.setItem('vinyl_visited', 'true');
    playTrack(9, 0);
    buildTracklist();
  } else {
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
const cy = isMobile ? H * 0.38 : H * 0.46;
const recordR = Math.min(W, H) * (isMobile ? 0.3 : 0.32);

// Arm pivot radius — scales with record
const pivotR = Math.max(10, recordR * 0.056);

// ---- DRAW RECORD PLAYER ----
function drawBase() {
  const bw = recordR * 2.6;
  const bh = recordR * 2.2;
  const bx = cx - bw / 2;
  const by = cy - bh * 0.5;

  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.roundRect(bx + 8, by + 8, bw, bh, 12);
  ctx.fill();

  const baseGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
  baseGrad.addColorStop(0, '#1a0e04');
  baseGrad.addColorStop(0.4, '#2a1508');
  baseGrad.addColorStop(1, '#120a02');
  ctx.fillStyle = baseGrad;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 12);
  ctx.fill();

  ctx.strokeStyle = 'rgba(200, 155, 60, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 12);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(200, 155, 60, 0.25)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.roundRect(bx + 8, by + 8, bw - 16, bh - 16, 8);
  ctx.stroke();

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
  ctx.beginPath();
  ctx.arc(cx, cy, recordR, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0806';
  ctx.fill();

  for (let r = recordR * 0.35; r < recordR * 0.96; r += recordR * 0.045) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

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

  const labelR = recordR * 0.28;
  const labelGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, labelR);
  labelGrad.addColorStop(0, '#c8a050');
  labelGrad.addColorStop(0.6, '#b08030');
  labelGrad.addColorStop(1, '#8a6020');
  ctx.fillStyle = labelGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, labelR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(30, 15, 3, 0.85)';
  ctx.font = `italic bold ${Math.round(recordR * 0.1)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ARIRANG', cx, cy - recordR * 0.05);

  if (currentTrack >= 0) {
    ctx.font = `italic ${Math.round(recordR * 0.065)}px Georgia, serif`;
    ctx.fillStyle = 'rgba(30, 15, 3, 0.65)';
    ctx.fillText(tracks[currentTrack].title, cx, cy + recordR * 0.1);
  }

  ctx.beginPath();
  ctx.arc(cx, cy, recordR * 0.025, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0806';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,155,60,0.4)';
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

// ---- PAUSE BUTTON ----
// On desktop: right of record. On mobile: below record.
function drawPauseBtn() {
  if (currentTrack === -1) return;

  const bx = cx + recordR * 1.1;
  const by = cy + recordR * 0.9;
  const br = isMobile ? 16 : 22;

  ctx.beginPath();
  ctx.arc(bx, by, br, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(200,155,60,0.15)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,155,60,0.55)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const s = br / 22;
  ctx.fillStyle = 'rgba(200,155,60,0.85)';
  if (audio.paused) {
    ctx.beginPath();
    ctx.moveTo(bx - 7*s, by - 9*s);
    ctx.lineTo(bx + 11*s, by);
    ctx.lineTo(bx - 7*s, by + 9*s);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillRect(bx - 8*s, by - 8*s, 5*s, 16*s);
    ctx.fillRect(bx + 3*s, by - 8*s, 5*s, 16*s);
  }

  vinyl_pauseBtn = { x: bx, y: by, r: br };
}

let vinyl_pauseBtn = null;

function drawArm() {
  const pivotX = cx + recordR * 1.05;
  const pivotY = cy - recordR * 0.85;

  const armAngle = Math.PI * 0.82;
  const armLen = recordR * 1.15;
  const tipX = pivotX + Math.cos(armAngle) * armLen;
  const tipY = pivotY + Math.sin(armAngle) * armLen;

  const pivotGrad = ctx.createRadialGradient(pivotX, pivotY, 0, pivotX, pivotY, pivotR);
  pivotGrad.addColorStop(0, '#c8a050');
  pivotGrad.addColorStop(1, '#8a6020');
  ctx.fillStyle = pivotGrad;
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, pivotR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,155,60,0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(200,165,70,0.9)';
  ctx.lineWidth = Math.max(2, recordR * 0.012);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,220,120,0.3)';
  ctx.lineWidth = Math.max(1, recordR * 0.006);
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  ctx.fillStyle = 'rgba(180,140,50,0.9)';
  ctx.beginPath();
  ctx.arc(tipX, tipY, Math.max(3, recordR * 0.016), 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0a0806';
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, pivotR * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

// ---- CLICK HINT ----
function drawHint() {
  ctx.fillStyle = `rgba(200, 155, 60, ${0.2 + Math.sin(t * 0.8) * 0.1})`;
  ctx.font = `italic ${Math.round(H * 0.018)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const hintY = isMobile ? cy + recordR * 1.7 : cy + recordR * 1.35;
  const hintText = isMobile ? 'tap to browse tracks' : 'click to browse tracks';
  ctx.fillText(hintText, cx, hintY);
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

// ---- INTERACTION — click + touch ----
function handleInteraction(clientX, clientY) {
  // Check pause button
  if (vinyl_pauseBtn) {
    const dx = clientX - vinyl_pauseBtn.x;
    const dy = clientY - vinyl_pauseBtn.y;
    if (Math.sqrt(dx * dx + dy * dy) < vinyl_pauseBtn.r) {
      audio.paused ? audio.play() : audio.pause();
      return;
    }
  }

  // Click/tap on record → open tracklist
  const dx = clientX - cx;
  const dy = clientY - cy;
  if (Math.sqrt(dx * dx + dy * dy) < recordR) {
    document.getElementById('book-overlay').classList.add('open');
  }
}

canvas.addEventListener('click', e => handleInteraction(e.clientX, e.clientY));

canvas.addEventListener('touchend', e => {
  e.preventDefault();
  const touch = e.changedTouches[0];
  handleInteraction(touch.clientX, touch.clientY);
}, { passive: false });

// ---- TRACKLIST ----
function buildTracklist() {
  if (isMobile) {
    buildTracklistMobile();
  } else {
    buildTracklistDesktop();
  }
}

function buildTracklistDesktop() {
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

  const leftEl = document.getElementById('puzzle-left');
  leftEl.style.cssText = 'width:85%;height:85%;display:flex;flex-direction:column;align-items:stretch;';
  leftEl.innerHTML = `
    <div style="
      font-family:Georgia,serif;
      font-style:italic;
      font-weight:bold;
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

  const rightEl = document.getElementById('puzzle-right');
  rightEl.style.cssText = 'width:85%;height:85%;display:flex;flex-direction:column;align-items:stretch;position:relative;';
  rightEl.innerHTML = `
    <button id="overlay-close" style="
      position:absolute;
      top:0px; right:0px;
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

  attachTracklistEvents();
}

function buildTracklistMobile() {
  const leftEl = document.getElementById('puzzle-left');
  leftEl.style.cssText = 'display:none;';

  const rightEl = document.getElementById('puzzle-right');
  rightEl.style.cssText = 'width:88%;height:88%;display:flex;flex-direction:column;align-items:stretch;position:relative;';
  rightEl.innerHTML = `
    <!-- Drag handle -->
    <div style="
      width:36px; height:4px;
      background:rgba(160,120,50,0.3);
      border-radius:2px;
      margin:0 auto 14px auto;
      flex-shrink:0;
    "></div>
    <div style="
      font-family:Georgia,serif;
      font-style:italic;
      font-weight:bold;
      font-size:1.2rem;
      color:rgba(70,42,12,0.75);
      text-align:center;
      letter-spacing:0.08em;
      padding-bottom:10px;
      border-bottom:1px solid rgba(160,120,50,0.2);
      margin-bottom:8px;
      flex-shrink:0;
    ">ARIRANG</div>
    <button id="overlay-close" style="
      position:absolute;
      top:20px; right:0;
      background:transparent;
      border:1px solid rgba(160,120,50,0.35);
      color:rgba(100,65,20,0.7);
      font-family:Georgia,serif;
      font-size:1.1rem;
      width:36px; height:36px;
      cursor:pointer;
      border-radius:2px;
      line-height:1;
    ">✕</button>
    <div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;">
      ${tracks.map((track, i) => `
        <div class="track-item" data-index="${i}" style="
          font-family:Georgia,serif;
          font-style:italic;
          font-size:1rem;
          color:rgba(70,42,12,0.7);
          border-bottom:1px solid rgba(160,120,50,0.12);
          cursor:pointer;
          letter-spacing:0.03em;
          padding:12px 0;
          display:flex;
          align-items:center;
        ">${track.title}</div>
      `).join('')}
    </div>`;

  attachTracklistEvents();
}

function attachTracklistEvents() {
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