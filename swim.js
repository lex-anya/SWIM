const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const W = canvas.width;
const H = canvas.height;
let t = 0;
let surfaceFlash = 0;
let flashStarted = false;
let flashHold = false;

const audio = document.createElement('audio');
audio.src = localStorage.getItem('audio_src') || 'ARIRANG/MerryGoRound.mp3';
audio.currentTime = parseFloat(localStorage.getItem('audio_time') || '0');
audio.play();
document.body.appendChild(audio);

setInterval(() => {
  localStorage.setItem('audio_time', audio.currentTime);
}, 1000);

let audioCtx = null;
let analyser = null;
let dataArray = null;

function initAudioAnalyser() {
  if (analyser) return; // already initialized
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.resume();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  } catch(e) {
    analyser = null;
  }
}

// World height
const WORLD_H = H * 7;

// Start position — just below first chest so she needs to scroll a little
let scrollY = WORLD_H - H * 0.75;
let targetScrollY = scrollY;

let autoScrolling = false;
let autoScrollTarget = 0;
let autoScrollSpeed = 0.04;
let currentChest = 0;
let scrollLocked = false; // locked after first chest is reached

// 5 chests — evenly spaced, alternating left/right
const chests = Array.from({ length: 5 }, (_, i) => ({
  x: i % 2 === 0 ? W * 0.35 : W * 0.65,
  worldY: WORLD_H - H * 1.1 - i * ((WORLD_H - H * 2) / 4),
  solved: false,
}));

// Bubbles
const bubbles = Array.from({ length: 40 }, () => ({
  x: Math.random() * W,
  worldY: Math.random() * WORLD_H,
  size: Math.random() * 3 + 0.5,
  speed: 1.5 + Math.random() * 3,
  opacity: Math.random() * 0.25 + 0.08,
  wobble: Math.random() * Math.PI * 2,
}));

// Light rays
const rays = Array.from({ length: 6 }, (_, i) => ({
  x: W * (0.05 + i * 0.19),
  width: 20 + Math.random() * 30,
}));

// Overlay
let overlayOpen = false;
let overlayChestIndex = -1;

// SVG filenames in chest order (bottom to top)
const chestSVGs = [
  'assets/icons/purpleHeadphones.svg',
  'assets/icons/smeraldoFlower.svg',
  'assets/icons/arirangVinyl.svg',
  'assets/icons/hooliganKatanas.svg',
  'assets/icons/redString.svg',
];

const chestImages = chestSVGs.map(src => {
  const img = new Image();
  img.src = src;
  return img;
});

// ---- BOOK OVERLAY ----
const bookOverlay = document.getElementById('book-overlay');
const puzzleLeft  = document.getElementById('puzzle-left');
const puzzleRight = document.getElementById('puzzle-right');

function openBook(chestIndex) {
  overlayOpen = true;
  overlayChestIndex = chestIndex;
  bookOverlay.classList.add('open');
  renderPuzzle(chestIndex);
}

function closeBook(solved) {
  overlayOpen = false;
  bookOverlay.classList.remove('open');
  puzzleLeft.innerHTML = '';
  puzzleRight.innerHTML = '';
  puzzleLeft.style.cssText = '';
  puzzleRight.style.cssText = '';

  if (solved) {
    chests[overlayChestIndex].solved = true;
    currentChest++;

    if (currentChest < chests.length) {
      autoScrolling = true;
      autoScrollSpeed = 0.045;
      autoScrollTarget = chests[currentChest].worldY - H * 0.45;
      targetScrollY = autoScrollTarget;
      scrollLocked = false;
    } else {
      autoScrolling = true;
      autoScrollSpeed = 0.06;
      autoScrollTarget = 0;
      targetScrollY = 0;
      scrollLocked = true;
      setTimeout(() => { flashStarted = true; }, 1200);
    }
  }
}

function renderPuzzle(index) {
  if (index === 4) renderPuzzleOddOneOut();
  else if (index === 2) renderPuzzleNormal();
  else if (index === 3) renderPuzzleHooligan();
  else if (index === 1) renderPuzzleTruthUntold();
  else if (index === 0) renderPuzzleHumming();
}

function renderPuzzleHumming() {
  
  // Fixed neat positions — 2x2 grid
  const leftPositions  = [{x:35, y:35}, {x:35, y:65}];
  const rightPositions = [{x:65, y:35}, {x:65, y:65}];
  
  // Shuffle which index is correct each time
  const correctIndex = Math.floor(Math.random() * 4);

  // Fake rhythms for wrong blobs — confusingly close but off
  const fakeRhythms = [
    { phase: 0,    speed: 2.1  },  // slightly fast
    { phase: 1.2,  speed: 1.55 },  // close but offset
    { phase: 0.6,  speed: 1.85 },  // almost right tempo, wrong phase
  ];
  let fakeIdx = 0;

  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  // Build containers
  puzzleLeft.innerHTML = `<div id="hum-left" style="width:100%;height:100%;position:relative;"></div>`;
  puzzleRight.innerHTML = `<div id="hum-right" style="width:100%;height:100%;position:relative;"></div>`;

  // Create 4 blob elements
  const blobs = [];
  // Assign blobs to positions in shuffled order
  const positions = [
    { ...leftPositions[0],  side: 'left'  },
    { ...leftPositions[1],  side: 'left'  },
    { ...rightPositions[0], side: 'right' },
    { ...rightPositions[1], side: 'right' },
  ];

// Shuffle which blob sits where
const shuffledPositions = shuffle(positions);

  shuffledPositions.forEach((pos, i) => {
    const el = document.createElement('div');
    el.style.cssText = `
      position:absolute;
      left:${pos.x}%;
      top:${pos.y}%;
      transform:translate(-50%,-50%);
      width:60px; height:60px;
      border-radius:50%;
      background:radial-gradient(circle, rgba(220,175,70,0.9) 0%, rgba(200,140,40,0.4) 50%, transparent 70%);
      cursor:pointer;
      transition:box-shadow 0.05s;
      box-shadow: 0 0 12px 4px rgba(220,175,70,0.3);
    `;
    const container = document.getElementById(pos.side === 'left' ? 'hum-left' : 'hum-right');
    container.appendChild(el);
    blobs.push({ el, correct: i === correctIndex, fakeRhythm: fakeRhythms[fakeIdx++ % fakeRhythms.length] });

    el.addEventListener('click', () => {
      if (i === correctIndex) {
        el.style.boxShadow = '0 0 30px 12px rgba(120,180,80,0.7)';
        el.style.background = 'radial-gradient(circle, rgba(150,210,100,0.9) 0%, rgba(100,170,60,0.4) 50%, transparent 70%)';
        cancelAnimationFrame(animFrame);
        if (audioCtx) audioCtx.close();
        setTimeout(() => closeBook(true), 700);
      } else {
        el.style.boxShadow = '0 0 30px 12px rgba(180,60,40,0.7)';
        el.style.background = 'radial-gradient(circle, rgba(200,80,60,0.9) 0%, rgba(160,40,30,0.4) 50%, transparent 70%)';
        cancelAnimationFrame(animFrame);
        if (audioCtx) audioCtx.close();
        setTimeout(() => {
          closeBook(false);
          currentChest = 0;
          chests.forEach(c => c.solved = false);
          scrollY = WORLD_H - H * 0.75;
          targetScrollY = scrollY;
          scrollLocked = false;
          autoScrolling = false;
        }, 800);
      }
    });
  });

  // Animation loop
  let animFrame;
  let pt = 0;

  function animBlobs() {
    pt += 0.04;

    // Get real audio energy for correct blob
    let audioEnergy = 0;
    if (analyser) {
      analyser.getByteFrequencyData(dataArray);
      // Focus on bass/mid frequencies (indices 2-20)
      let sum = 0;
      for (let i = 2; i < 20; i++) sum += dataArray[i];
      audioEnergy = sum / (18 * 255); // 0 to 1
    } else {
      // Fallback — pulse at ~1.7 beats/sec (approximates Merry Go Round tempo)
      audioEnergy = Math.max(0, Math.sin(pt * 1.7) * 0.7);
    }

    blobs.forEach((b, i) => {
      let pulse;
      if (i === correctIndex) {
        pulse = audioEnergy;
      } else {
        // Fake pulse — sinusoidal at wrong rhythm
        pulse = Math.max(0, Math.sin(pt * b.fakeRhythm.speed + b.fakeRhythm.phase) * 0.65);
      }

      const scale = 1 + pulse * 0.55;
      const glow = 8 + pulse * 24;
      const glowOpacity = 0.25 + pulse * 0.55;

      b.el.style.transform = `translate(-50%,-50%) scale(${scale})`;
      b.el.style.boxShadow = `0 0 ${glow}px ${glow * 0.4}px rgba(220,175,70,${glowOpacity})`;
    });

    animFrame = requestAnimationFrame(animBlobs);
  }

  animBlobs();
}

function renderPuzzleTruthUntold() {
  let maskPlaced = false;
  let flowerPlaced = false;
  let dragging = null;
  let dragOffX = 0, dragOffY = 0;
  let groupEl = null;

  // Read size from book-left BEFORE injecting HTML (it's always rendered)
  const bookLeft = document.getElementById('book-left');
  const bookRect = bookLeft.getBoundingClientRect();
  const pageW = bookRect.width;
  const pageH = bookRect.height;

  // All sizes proportional to page — tuned to match original look
  const manSize        = Math.round(pageH * 0.18);   // ~100px on 550px page
  const maskSize       = Math.round(manSize * 0.5);  // ~50px
  const maskPlacedSize = Math.round(manSize * 0.25); // ~25px
  const flowerSize     = Math.round(manSize * 0.5);  // ~50px
  const flowerHandSize = Math.round(manSize * 0.2);  // ~20px

  puzzleLeft.innerHTML = `
    <div id="tu-left" style="width:100%;height:100%;position:relative;">
      <img id="tu-man" src="assets/icons/man.svg" style="
        position:absolute;
        width:${manSize}px; height:${manSize}px;
        left:30%; top:45%;
        transform:translate(-50%,-50%);
        cursor:default;
      "/>
      <img id="tu-mask-drag" src="assets/icons/mask.svg" style="
        position:absolute;
        width:${maskSize}px; height:${maskSize}px;
        left:70%; top:15%;
        transform:translate(-50%,0);
        cursor:grab;
      "/>
      <img id="tu-mask-placed" src="assets/icons/mask.svg" style="
        position:absolute;
        width:${maskPlacedSize}px; height:${maskPlacedSize}px;
        left:30%; top:36.5%;
        transform:translate(-50%,-50%);
        display:none;
        pointer-events:none;
      "/>
      <img id="tu-flower-feet" src="assets/icons/flower.svg" style="
        position:absolute;
        width:${flowerSize}px; height:${flowerSize}px;
        left:70%; top:70%;
        transform:translate(-50%,-50%);
        cursor:default;
      "/>
      <img id="tu-flower-hand" src="assets/icons/flower.svg" style="
        position:absolute;
        width:${flowerHandSize}px; height:${flowerHandSize}px;
        left:32%; top:43.5%;
        transform:translate(-50%,-50%);
        display:none;
        pointer-events:none;
      "/>
    </div>`;

  puzzleRight.innerHTML = `
    <div id="tu-right" style="width:100%;height:100%;position:relative;">
      <img src="assets/icons/castle.svg" style="
        position:absolute;
        width:90%; height:auto;
        left:50%; top:50%;
        transform:translate(-50%,-50%);
        opacity:0.75;
        pointer-events:none;
      "/>
      <div id="tu-castle-zone" style="
        position:absolute;
        width:${Math.round(pageW * 0.35)}px; height:${Math.round(pageH * 0.25)}px;
        left:50%; bottom:30%;
        transform:translateX(-50%);
        display:none;
      "></div>
      <img id="tu-flower-castle" src="assets/icons/flower.svg" style="
        position:absolute;
        width:${Math.round(manSize * 0.36)}px; height:${Math.round(manSize * 0.36)}px;
        left:50%; bottom:20%;
        transform:translateX(-50%);
        display:none;
        pointer-events:none;
        opacity:0.9;
      "/>
    </div>`;

  // Snap threshold — proportional to page width
  // Original was 250px on ~440px puzzle width → ~57% of page width
  const snapDist       = pageW * 0.57;
  const castleSnapDist = pageW * 0.45;

  function getEl(id) { return document.getElementById(id); }

  function snapCenter(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function dist(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  function startDrag(el, e) {
    dragging = el;
    const rect = el.getBoundingClientRect();
    dragOffX = e.clientX - rect.left;
    dragOffY = e.clientY - rect.top;
    el.style.position = 'fixed';
    el.style.width = rect.width + 'px';
    el.style.height = rect.height + 'px';
    el.style.left = rect.left + 'px';
    el.style.top = rect.top + 'px';
    el.style.transform = 'none';
    el.style.cursor = 'grabbing';
    el.style.zIndex = 9999;
    el.style.pointerEvents = 'none';
  }

  function startGroupDrag(e) {
    const manRect = getEl('tu-man').getBoundingClientRect();

    const offsetX = Math.round(manSize * 0.15);
    const offsetY = Math.round(manSize * 0.35);

    // Mask on face — top centre of man
    const maskOffX = Math.round(manSize * 0.375);
    const maskOffY = Math.round(manSize * 0.15);

    // Flower in hand — mid right of man
    const flowerOffX = Math.round(manSize * 0.43);
    const flowerOffY = Math.round(manSize * 0.52);

    const groupW = Math.round(manSize * 1.3);
    const groupH = Math.round(manSize * 1.5);

    groupEl = document.createElement('div');
    groupEl.id = 'tu-group';
    groupEl.style.cssText = `
      position:fixed;
      left:${manRect.left - offsetX}px;
      top:${manRect.top - offsetY}px;
      width:${groupW}px; height:${groupH}px;
      cursor:grabbing;
      z-index:9999;
      pointer-events:none;
    `;
    groupEl.innerHTML = `
      <img src="assets/icons/man.svg"    style="position:absolute;width:${manSize}px;height:${manSize}px;left:0;top:${Math.round(manSize*0.2)}px;"/>
      <img src="assets/icons/mask.svg"   style="position:absolute;width:${maskPlacedSize}px;height:${maskPlacedSize}px;left:${maskOffX}px;top:${maskOffY}px;"/>
      <img src="assets/icons/flower.svg" style="position:absolute;width:${flowerHandSize}px;height:${flowerHandSize}px;left:${flowerOffX}px;top:${flowerOffY}px;"/>
    `;
    document.body.appendChild(groupEl);
    getEl('tu-man').style.opacity = '0';
    getEl('tu-mask-placed').style.display = 'none';
    getEl('tu-flower-hand').style.display = 'none';
    dragOffX = e.clientX - manRect.left + offsetX;
    dragOffY = e.clientY - manRect.top + offsetY;
    dragging = groupEl;
  }

  function onMove(e) {
    if (!dragging) return;
    dragging.style.left = (e.clientX - dragOffX) + 'px';
    dragging.style.top  = (e.clientY - dragOffY) + 'px';
  }

  function onUp(e) {
    if (!dragging) return;
    const dropped = dragging;
    const dropCenter = { x: e.clientX, y: e.clientY };
    dragging = null;

    if (dropped.id === 'tu-mask-drag' && !maskPlaced) {
      dropped.style.pointerEvents = 'auto';
      dropped.style.cursor = 'grab';
      const target = snapCenter(getEl('tu-man'));
      if (dist(dropCenter, target) < snapDist) {
        dropped.style.display = 'none';
        getEl('tu-mask-placed').style.display = 'block';
        maskPlaced = true;
        if (flowerPlaced) enableManDrag();
      } else {
        dropped.style.position = 'absolute';
        dropped.style.left = '70%';
        dropped.style.top = '15%';
        dropped.style.transform = 'translate(-50%,0)';
        dropped.style.width = maskSize + 'px';
        dropped.style.height = maskSize + 'px';
        dropped.style.zIndex = '';
      }
    }

    else if (dropped.id === 'tu-flower-feet' && !flowerPlaced) {
      dropped.style.pointerEvents = 'auto';
      dropped.style.cursor = 'grab';
      const target = snapCenter(getEl('tu-man'));
      if (dist(dropCenter, target) < snapDist) {
        dropped.style.display = 'none';
        getEl('tu-flower-hand').style.display = 'block';
        flowerPlaced = true;
        if (maskPlaced) enableManDrag();
      } else {
        dropped.style.position = 'absolute';
        dropped.style.left = '70%';
        dropped.style.top = '70%';
        dropped.style.transform = 'translate(-50%,-50%)';
        dropped.style.width = flowerSize + 'px';
        dropped.style.height = flowerSize + 'px';
        dropped.style.zIndex = '';
      }
    }

    else if (dropped === groupEl) {
      const target = snapCenter(getEl('tu-castle-zone'));
      if (dist(dropCenter, target) < castleSnapDist) {
        groupEl.remove(); groupEl = null;
        getEl('tu-man').style.display = 'none';
        getEl('tu-flower-castle').style.display = 'block';
        setTimeout(() => closeBook(true), 2500);
      } else {
        groupEl.remove(); groupEl = null;
        getEl('tu-man').style.opacity = '1';
        getEl('tu-mask-placed').style.display = 'block';
        getEl('tu-flower-hand').style.display = 'block';
      }
    }
  }

  function enableManDrag() {
    getEl('tu-man').style.cursor = 'grab';
    getEl('tu-castle-zone').style.display = 'block';
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);

  getEl('tu-mask-drag').addEventListener('mousedown', e => {
    if (maskPlaced) return;
    e.preventDefault();
    startDrag(getEl('tu-mask-drag'), e);
  });

  getEl('tu-flower-feet').addEventListener('mousedown', e => {
    if (flowerPlaced) return;
    e.preventDefault();
    startDrag(getEl('tu-flower-feet'), e);
  });

  getEl('tu-man').addEventListener('mousedown', e => {
    if (!maskPlaced || !flowerPlaced) return;
    e.preventDefault();
    startGroupDrag(e);
  });
}

// ---- HOOLIGAN PATTERNS ----
// 5 patterns, each 7 cells on a 4x4 grid [col, row]
const hooliganPatterns = [
  [ // pattern 0 — original
    [0, 3], [0, 1],
    [1, 2],
    [2, 0], [2, 3],
    [3, 1], [3, 2],
  ],
  [ // pattern 1 — diagonal slash
    [0, 0], [0, 2],
    [1, 1], [1, 3],
    [2, 0], [2, 2],
    [3, 1],
  ],
  [ // pattern 2 — scattered corners + centre
    [0, 0], [0, 3],
    [1, 2],
    [2, 1],
    [3, 0], [3, 2], [3, 3],
  ],
  [ // pattern 3 — zigzag
    [0, 1], [0, 3],
    [1, 0], [1, 2],
    [2, 1], [2, 3],
    [3, 2],
  ],
  [ // pattern 4 — sparse cross
    [0, 2],
    [1, 0], [1, 3],
    [2, 1], [2, 3],
    [3, 0], [3, 2],
  ],
];

function renderPuzzleHooligan() {
  // Pick a pattern — avoid repeating the last one shown on failure
  const lastIndex = parseInt(localStorage.getItem('hooligan_last_pattern') ?? '-1');
  let patternIndex;
  do {
    patternIndex = Math.floor(Math.random() * hooliganPatterns.length);
  } while (patternIndex === lastIndex && hooliganPatterns.length > 1);

  localStorage.setItem('hooligan_last_pattern', patternIndex);
  const pattern = hooliganPatterns[patternIndex];

  const ROWS = 4;
  const COLS = 4;
  let replaysLeft = 2;
  let isPlaying = false;

  function buildGrid(id, interactive) {
    return `
      <div id="${id}" style="
        display: grid;
        grid-template-columns: repeat(${COLS}, 1fr);
        grid-template-rows: repeat(${ROWS}, 1fr);
        gap: 8px;
        width: 100%;
        height: 100%;
      ">
        ${Array.from({ length: ROWS * COLS }, (_, i) => {
          const row = Math.floor(i / COLS);
          const col = i % COLS;
          return `<div class="synth-cell ${interactive ? 'synth-input' : 'synth-show'}"
            data-row="${row}" data-col="${col}"
            style="
              background: rgba(160, 120, 50, 0.08);
              border: 1px solid rgba(160, 120, 50, 0.2);
              border-radius: 3px;
              cursor: ${interactive ? 'pointer' : 'default'};
              transition: background 0.15s, border-color 0.15s;
            "></div>`;
        }).join('')}
      </div>`;
  }

  puzzleLeft.innerHTML = `
    <div style="width:85%;height:70%;display:flex;flex-direction:column;gap:16px;align-items:center;">
      ${buildGrid('synth-left', false).replace('width: 100%', 'width: 100%').replace('height: 100%', 'flex:1')}
    </div>`;

  puzzleRight.innerHTML = '';

  const userPattern = [];

  function playPattern(onDone) {
    isPlaying = true;
    document.querySelectorAll('#synth-left .synth-show').forEach(c => {
      c.style.background = 'rgba(160, 120, 50, 0.08)';
      c.style.borderColor = 'rgba(160, 120, 50, 0.2)';
    });

    let step = 0;
    function lightNext() {
      if (step >= pattern.length) {
        setTimeout(() => {
          document.querySelectorAll('#synth-left .synth-show').forEach(c => {
            c.style.background = 'rgba(160, 120, 50, 0.04)';
            c.style.borderColor = 'rgba(160, 120, 50, 0.1)';
          });
          isPlaying = false;
          if (onDone) onDone();
        }, 800);
        return;
      }
      const [col, row] = pattern[step];
      const cell = document.querySelector(`#synth-left [data-row="${row}"][data-col="${col}"]`);
      if (cell) {
        cell.style.background = 'rgba(180, 130, 40, 0.55)';
        cell.style.borderColor = 'rgba(220, 175, 70, 0.8)';
      }
      step++;
      setTimeout(lightNext, 400);
    }
    setTimeout(lightNext, 300);
  }

  function showRightGrid() {
    userPattern.length = 0;
    puzzleRight.innerHTML = buildGrid('synth-right', true);

    document.querySelectorAll('#synth-right .synth-input').forEach(cell => {
      cell.addEventListener('click', () => {
        if (isPlaying) return;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const alreadySelected = userPattern.some(p => p[0] === col && p[1] === row);

        if (alreadySelected) {
          userPattern.splice(userPattern.findIndex(p => p[0] === col && p[1] === row), 1);
          cell.style.background = 'rgba(160, 120, 50, 0.08)';
          cell.style.borderColor = 'rgba(160, 120, 50, 0.2)';
        } else {
          userPattern.push([col, row]);
          cell.style.background = 'rgba(180, 130, 40, 0.45)';
          cell.style.borderColor = 'rgba(220, 175, 70, 0.7)';
        }

        if (userPattern.length === pattern.length) {
          const patternSet = new Set(pattern.map(p => `${p[0]},${p[1]}`));
          const userSet = new Set(userPattern.map(p => `${p[0]},${p[1]}`));
          const correct = [...patternSet].every(k => userSet.has(k));

          if (correct) {
            document.querySelectorAll('#synth-right .synth-input').forEach(c => {
              if (userSet.has(`${c.dataset.col},${c.dataset.row}`)) {
                c.style.background = 'rgba(100, 150, 70, 0.3)';
                c.style.borderColor = 'rgba(120, 170, 80, 0.6)';
              }
            });
            setTimeout(() => closeBook(true), 700);
          } else {
            document.querySelectorAll('#synth-right .synth-input').forEach(c => {
              c.style.background = 'rgba(160, 60, 40, 0.15)';
              c.style.borderColor = 'rgba(160, 60, 40, 0.4)';
            });
            setTimeout(() => {
              if (replaysLeft <= 0) {
                // Full failure reset — next open will pick a different pattern
                closeBook(false);
                currentChest = 0;
                chests.forEach(c => c.solved = false);
                scrollY = WORLD_H - H * 0.75;
                targetScrollY = scrollY;
                scrollLocked = false;
                autoScrolling = false;
              } else {
                userPattern.length = 0;
                document.querySelectorAll('#synth-right .synth-input').forEach(c => {
                  c.style.background = 'rgba(160, 120, 50, 0.08)';
                  c.style.borderColor = 'rgba(160, 120, 50, 0.2)';
                });
              }
            }, 600);
          }
        }
      });
    });

    updateReplayBtn();
  }

  function updateReplayBtn() {
    const existing = document.getElementById('replay-btn');
    if (existing) existing.remove();

    if (replaysLeft <= 0) return;

    const btn = document.createElement('button');
    btn.id = 'replay-btn';
    btn.textContent = `replay (${replaysLeft} left)`;
    btn.style.cssText = `
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: transparent;
      border: 1px solid rgba(160,120,50,0.4);
      color: rgba(90,55,15,0.7);
      font-family: 'IM Fell English', Georgia, serif;
      font-style: italic;
      font-size: 0.85rem;
      padding: 7px 18px;
      cursor: pointer;
      letter-spacing: 0.05em;
    `;
    btn.addEventListener('click', () => {
      if (isPlaying) return;
      replaysLeft--;
      puzzleRight.innerHTML = '';
      document.querySelectorAll('#synth-left .synth-show').forEach(c => {
        c.style.background = 'rgba(160, 120, 50, 0.08)';
        c.style.borderColor = 'rgba(160, 120, 50, 0.2)';
      });
      playPattern(() => showRightGrid());
    });

    puzzleLeft.style.position = 'relative';
    puzzleLeft.appendChild(btn);
  }

  playPattern(() => showRightGrid());
}

function renderPuzzleNormal() {
  // Left page — question
  puzzleLeft.innerHTML = `
    <div style="
      font-family: 'IM Fell English', Georgia, serif;
      color: rgba(70, 42, 12, 0.75);
      font-size: 1.4rem;
      font-style: italic;
      line-height: 1.8;
      text-align: center;
      padding: 20px;
    ">
      What you need, twin?
    </div>`;

  // Right page — multiselect list, all must be selected
  const options = ['Fantasy', 'Fame', 'Hate', 'Love'];
  const selected = new Set();

  puzzleRight.innerHTML = `
    <div id="normal-list" style="
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 20px;
      width: 80%;
      margin: auto;
    ">
      ${options.map((o, i) => `
        <div class="normal-option" data-index="${i}" style="
          font-family: 'IM Fell English', Georgia, serif;
          font-size: 1.25rem;
          font-style: italic;
          color: rgba(70, 42, 12, 0.65);
          padding: 10px 20px;
          border-bottom: 1px solid rgba(160, 120, 50, 0.18);
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
          user-select: none;
          letter-spacing: 0.04em;
        ">${o}</div>
      `).join('')}
    </div>`;

  document.querySelectorAll('.normal-option').forEach((el, i) => {
    el.addEventListener('click', () => {
      if (selected.has(i)) {
        selected.delete(i);
        el.style.color = 'rgba(70, 42, 12, 0.65)';
        el.style.borderBottomColor = 'rgba(160, 120, 50, 0.18)';
        el.style.fontWeight = 'normal';
      } else {
        selected.add(i);
        el.style.color = 'rgba(100, 60, 10, 0.95)';
        el.style.borderBottomColor = 'rgba(160, 120, 50, 0.55)';
        el.style.fontWeight = 'bold';
      }

      // All 4 selected — solve
      if (selected.size === 4) {
        document.querySelectorAll('.normal-option').forEach(e => {
          e.style.color = 'rgba(80, 120, 60, 0.85)';
          e.style.borderBottomColor = 'rgba(100, 150, 70, 0.4)';
        });
        setTimeout(() => closeBook(true), 700);
      }
    });
  });
}

function renderPuzzleOddOneOut() {
  // Left page — question
  puzzleLeft.innerHTML = `
    <div style="
      font-family: 'IM Fell English', Georgia, serif;
      color: rgba(70, 42, 12, 0.75);
      font-size: 1.4rem;
      font-style: italic;
      line-height: 1.8;
      text-align: center;
      padding: 20px;
    ">
      Is it different for me?<br>Is it different for you?
    </div>`;

  // Right page — 4 emojis in a square
  // Order: 🌊 💜 / 𝟳 🥀
  const options = [
    { emoji: '🌊', correct: false },
    { emoji: '💜', correct: true  },
    { emoji: '7',  correct: false },
    { emoji: '🥀', correct: false },
  ];

  puzzleRight.innerHTML = `
    <div id="odd-grid" style="
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      padding: 20px;
      margin: auto;
    ">
      ${options.map((o, i) => `
        <div class="odd-option" data-index="${i}" style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100px;
          height: 100px;
          font-size: ${o.isText ? '2.2rem' : '2.4rem'};
          font-family: ${o.isText ? "'IM Fell English', Georgia, serif" : 'serif'};
          font-style: ${o.isText ? 'italic' : 'normal'};
          color: ${o.isText ? 'rgba(60,35,10,0.85)' : 'inherit'};
          border: 1px solid rgba(160, 120, 50, 0.2);
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          background: transparent;
          user-select: none;
        ">${o.emoji}</div>
      `).join('')}
    </div>`;

  document.querySelectorAll('.odd-option').forEach((el, i) => {
    el.addEventListener('mouseenter', () => {
      el.style.background = 'rgba(160,120,50,0.08)';
      el.style.borderColor = 'rgba(160,120,50,0.45)';
    });
    el.addEventListener('mouseleave', () => {
      el.style.background = 'transparent';
      el.style.borderColor = 'rgba(160,120,50,0.2)';
    });
    el.addEventListener('click', () => {
      if (options[i].correct) {
        // Flash correct state then close
        el.style.background = 'rgba(120,160,80,0.15)';
        el.style.borderColor = 'rgba(120,160,80,0.5)';
        setTimeout(() => closeBook(true), 600);
      } else {
        // Flash wrong state then close and reset
        el.style.background = 'rgba(160,60,40,0.12)';
        el.style.borderColor = 'rgba(160,60,40,0.4)';
        setTimeout(() => {
          closeBook(false);
          // Reset to first chest
          currentChest = 0;
          chests.forEach(c => c.solved = false);
          scrollY = WORLD_H - H * 0.75;
          targetScrollY = scrollY;
          scrollLocked = false;
          autoScrolling = false;
        }, 800);
      }
    });
  });
}

// ---- HELPERS ----
function getScrollProgress() {
  return 1 - scrollY / (WORLD_H - H);
}

function getWaterColor(progress) {
  const r = Math.round(4  + progress * 38);
  const g = Math.round(15 + progress * 107);
  const b = Math.round(20 + progress * 118);
  return `rgb(${r}, ${g}, ${b})`;
}

// ---- DRAW ----
function drawWater(progress) {
  ctx.fillStyle = getWaterColor(progress);
  ctx.fillRect(0, 0, W, H);

  const depthGrad = ctx.createLinearGradient(0, 0, 0, H);
  depthGrad.addColorStop(0, 'transparent');
  depthGrad.addColorStop(1, `rgba(0,0,0,${0.35 - progress * 0.25})`);
  ctx.fillStyle = depthGrad;
  ctx.fillRect(0, 0, W, H);
}

function drawRays(progress) {
  const opacity = 0.05 + progress * 0.07;
  rays.forEach((r, i) => {
    const sway = Math.sin(t * 0.3 + i) * 15;
    const rayGrad = ctx.createLinearGradient(r.x + sway, 0, r.x + sway, H * 0.8);
    rayGrad.addColorStop(0, `rgba(150, 220, 240, ${opacity})`);
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
    const screenY = b.worldY - scrollY;
    if (screenY < -10 || screenY > H + 10) return;

    ctx.beginPath();
    ctx.arc(b.x, screenY, b.size, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(150, 210, 230, ${b.opacity})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    b.worldY -= b.speed;
    b.x += Math.sin(t * 1.2 + b.wobble) * 1.2;
    if (b.worldY < 0) {
      b.worldY = WORLD_H;
      b.x = Math.random() * W;
    }
  });
}

function drawChests(progress) {
  chests.forEach((c, i) => {
    if (c.solved) return; // solved objects disappear
    const screenY = c.worldY - scrollY;
    if (screenY < -80 || screenY > H + 80) return;

    // Glow
    const glow = ctx.createRadialGradient(c.x, screenY, 0, c.x, screenY, 65);
    glow.addColorStop(0, `rgba(255, 200, 100, ${0.08 + progress * 0.1})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(c.x - 65, screenY - 65, 130, 130);

    ctx.save();
    ctx.translate(c.x, screenY);
    ctx.font = `${Math.round(H * 0.07)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const img = chestImages[i];
    if (img.complete) {
      ctx.drawImage(img, -35, -35, 70, 70);
    }
    ctx.restore();
  });
}

function drawVignette() {
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
  v.addColorStop(0, 'transparent');
  v.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

function drawSurfaceFlash() {
  if (surfaceFlash <= 0) return;
  ctx.fillStyle = `rgba(200, 240, 255, ${surfaceFlash})`;
  ctx.fillRect(0, 0, W, H);
}

// ---- ANIMATE ----
function animate() {
  t += 0.04;
  const progress = getScrollProgress();
  if (audio && !audio.paused) {
    localStorage.setItem('audio_time', audio.currentTime);
  }

  if (autoScrolling) {
    scrollY += (autoScrollTarget - scrollY) * autoScrollSpeed;
    targetScrollY = scrollY;
    if (Math.abs(scrollY - autoScrollTarget) < 0.5) {
      scrollY = autoScrollTarget;
      autoScrolling = false;
    }
  } else {
    scrollY += (targetScrollY - scrollY) * 0.1;
  }

  if (currentChest >= chests.length && flashStarted) {
  surfaceFlash = Math.min(surfaceFlash + 0.015, 1);
  if (surfaceFlash >= 0.3 && !flashHold) {
    flashHold = true;
    // Switch to Into the Sun from 3:00
    audio.pause();
    audio.src = 'ARIRANG/IntoTheSun.mp3';
    audio.currentTime = 180;
    audio.play();
    localStorage.setItem('audio_src', 'ARIRANG/IntoTheSun.mp3');
    localStorage.setItem('audio_time', '180');
    localStorage.setItem('audio_time', audio.currentTime);
    setTimeout(() => { window.location.href = 'serendipity.html'; }, 2500);
  }
}

  scrollY = Math.max(0, Math.min(WORLD_H - H, scrollY));

  ctx.clearRect(0, 0, W, H);
  drawWater(progress);
  drawRays(progress);
  drawBubbles();
  drawChests(progress);
  drawVignette();
  drawSurfaceFlash();

  requestAnimationFrame(animate);
}

// ---- SCROLL ----
window.addEventListener('wheel', (e) => {
  if (overlayOpen || autoScrolling || scrollLocked) return;

  const delta = e.deltaY;
  const newTarget = targetScrollY + delta * 0.8;
  const firstChestLimit = chests[0].worldY - H * 0.45;

  targetScrollY = Math.max(firstChestLimit, Math.min(WORLD_H - H, newTarget));

  if (targetScrollY <= firstChestLimit) {
    targetScrollY = firstChestLimit;
    scrollLocked = true;
  }
});

// ---- CLICK ----
canvas.addEventListener('click', (e) => {
  if (overlayOpen) return;
  if (currentChest >= chests.length) return;

  const c = chests[currentChest];
  const screenY = c.worldY - scrollY;
  const dist = Math.sqrt((e.clientX - c.x) ** 2 + (e.clientY - screenY) ** 2);
  if (dist < 55) {
    openBook(currentChest);
  }
});

animate();