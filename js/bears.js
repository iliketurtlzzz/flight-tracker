// ═══════════════════════════════════════
// 8-BIT PETS — Winnie (pitbull) & Happy Bear
// Ported from richmanssport-dashboard
// ═══════════════════════════════════════

function px(c, x, y, w, h) { c.fillRect(x, y, w || 1, h || 1); }

// ── Palettes ──
function pupPal() {
  return {
    body: '#7eb8e0', bodyLt: '#a0d4f0', dark: '#5a9cc5',
    white: '#e0f0ff', nose: '#3a7ca8', eye: '#1a4a70',
    tongue: '#e07080', outline: '#4a8ab0'
  };
}

function bearPal() {
  return {
    body: '#A67B5B', bodyLt: '#C49A6C', dark: '#6B4226',
    white: '#E8D5B7', nose: '#3a2010', eye: '#1a0a00',
    mouth: '#d06060', ears: '#6B4226'
  };
}

// ── Doghouse ──
function drawDoghouse() {
  const cv = document.getElementById('dhCanvas'); if (!cv) return;
  const c = cv.getContext('2d'); const p = pupPal();
  c.clearRect(0, 0, 40, 26); c.fillStyle = p.body;
  for (let i = 0; i < 6; i++) c.fillRect(9 - i * 2, i, 22 + i * 4, 1);
  c.fillRect(1, 6, 38, 20);
  c.fillStyle = p.dark; c.fillRect(13, 10, 14, 16); c.fillRect(14, 8, 12, 2); c.fillRect(15, 7, 10, 1);
}

function drawSign() {
  const cv = document.getElementById('dhSign'); if (!cv) return;
  const c = cv.getContext('2d'); const p = pupPal();
  c.clearRect(0, 0, 28, 22); c.fillStyle = p.body;
  c.fillRect(13, 0, 2, 22); c.fillRect(0, 3, 28, 11);
  c.fillStyle = p.white;
  px(c,3,5);px(c,3,6);px(c,3,7);px(c,3,8);px(c,4,9);px(c,5,8);px(c,6,9);px(c,7,5);px(c,7,6);px(c,7,7);px(c,7,8);
  px(c,9,5);px(c,9,6);px(c,9,7);px(c,9,8);px(c,9,9);
  px(c,11,5);px(c,11,6);px(c,11,7);px(c,11,8);px(c,11,9);px(c,12,6);px(c,13,7);px(c,14,5);px(c,14,6);px(c,14,7);px(c,14,8);px(c,14,9);
  px(c,16,5);px(c,16,6);px(c,16,7);px(c,16,8);px(c,16,9);px(c,17,6);px(c,18,7);px(c,19,5);px(c,19,6);px(c,19,7);px(c,19,8);px(c,19,9);
  px(c,21,5);px(c,21,6);px(c,21,7);px(c,21,8);px(c,21,9);
  px(c,23,5);px(c,23,6);px(c,23,7);px(c,23,8);px(c,23,9);px(c,24,5);px(c,24,7);px(c,24,9);px(c,25,5);px(c,25,9);
}

// ── Cave (bear home) ──
function drawCave() {
  const cv = document.getElementById('dhCanvas'); if (!cv) return;
  const c = cv.getContext('2d'); const p = bearPal();
  c.clearRect(0, 0, 40, 26);
  c.fillStyle = p.dark;
  c.fillRect(2, 8, 36, 18); c.fillRect(4, 6, 32, 2); c.fillRect(6, 4, 28, 2); c.fillRect(10, 2, 20, 2); c.fillRect(14, 0, 12, 2);
  c.fillStyle = '#0a0a0a'; c.fillRect(12, 10, 16, 16); c.fillRect(14, 8, 12, 2);
  c.fillStyle = p.body; px(c, 5, 10, 3, 2); px(c, 30, 12, 4, 2); px(c, 8, 18, 2, 2); px(c, 32, 18, 3, 2);
}

function drawBearSign() {
  const cv = document.getElementById('dhSign'); if (!cv) return;
  const c = cv.getContext('2d'); const p = bearPal();
  c.clearRect(0, 0, 28, 22); c.fillStyle = p.dark;
  c.fillRect(13, 0, 2, 22); c.fillRect(0, 3, 28, 11);
  c.fillStyle = p.white;
  px(c,2,5);px(c,2,6);px(c,2,7);px(c,2,8);px(c,2,9);px(c,3,7);px(c,4,5);px(c,4,6);px(c,4,7);px(c,4,8);px(c,4,9);
  px(c,6,6);px(c,6,7);px(c,6,8);px(c,6,9);px(c,7,5);px(c,7,7);px(c,8,6);px(c,8,7);px(c,8,8);px(c,8,9);
  px(c,10,5);px(c,10,6);px(c,10,7);px(c,10,8);px(c,10,9);px(c,11,5);px(c,11,7);px(c,12,5);px(c,12,6);
  px(c,14,5);px(c,14,6);px(c,14,7);px(c,14,8);px(c,14,9);px(c,15,5);px(c,15,7);px(c,16,5);px(c,16,6);
  px(c,18,5);px(c,18,6);px(c,19,7);px(c,19,8);px(c,19,9);px(c,20,5);px(c,20,6);
}

// ═══════════════════════════════════════
// PET STATE
// ═══════════════════════════════════════
const PUP = {
  el: null, canvas: null, ctx: null,
  x: 300, y: 400, dir: 1,
  state: 'walk', frame: 0, stateTimer: 0,
  walkSpeed: 0.3, awake: true,
  SLEEP_AFTER: 120000, t: 0,
  path: [], pathIdx: 0, targetX: 0, targetY: 0
};

let activePet = 'winnie';
let petSwapInterval = null;
let sleepTimeout = null;
let dhTarget = null;

// ── Draw Winnie (pitbull) ──
function drawWinnie() {
  const c = PUP.ctx; c.clearRect(0, 0, 24, 24);
  const p = pupPal(); const f = Math.floor(PUP.frame) % 4;
  PUP.t += 0.015;
  const isPlay = PUP.state === 'pet' || PUP.state === 'treat';
  const bob = isPlay ? 0 : Math.round(Math.sin(PUP.t) * 0.4);
  const headDip = isPlay ? 1 : 0;

  if (PUP.state === 'sleep') {
    c.fillStyle = p.body; c.fillRect(6, 15, 12, 5);
    c.fillStyle = p.white; c.fillRect(8, 17, 6, 3);
    c.fillStyle = p.body; c.fillRect(1, 10, 10, 7);
    c.fillStyle = p.dark; c.fillRect(0, 9, 3, 4); c.fillRect(9, 9, 3, 4);
    c.fillStyle = p.white; c.fillRect(2, 14, 5, 3);
    c.fillStyle = p.nose; px(c, 2, 14, 2, 1);
    c.fillStyle = p.eye; px(c, 4, 12, 2, 1); px(c, 7, 12, 2, 1);
    c.fillStyle = p.body; px(c, 17, 14, 2, 1); px(c, 18, 13, 2, 1);
    return;
  }

  const by = bob + headDip;
  c.fillStyle = p.body;
  c.fillRect(1, 1 + by, 11, 10); c.fillRect(0, 3 + by, 13, 6); c.fillRect(2, 0 + by, 9, 1);
  c.fillStyle = p.dark; c.fillRect(0, 0 + by, 2, 7); c.fillRect(11, 0 + by, 2, 7);
  c.fillStyle = p.white; c.fillRect(1, 7 + by, 7, 4); c.fillRect(0, 8 + by, 2, 2);
  c.fillStyle = p.nose; px(c, 1, 7 + by, 2, 2);

  if (isPlay) {
    c.fillStyle = '#ff5577';
    px(c, 3, 3 + by); px(c, 5, 3 + by); px(c, 4, 4 + by);
    px(c, 7, 3 + by); px(c, 9, 3 + by); px(c, 8, 4 + by);
  } else {
    c.fillStyle = p.white; c.fillRect(3, 3 + by, 3, 3); c.fillRect(7, 3 + by, 3, 3);
    c.fillStyle = p.eye;
    const lk = PUP.dir > 0 ? 1 : 0;
    c.fillRect(3 + lk, 4 + by, 2, 2); c.fillRect(7 + lk, 4 + by, 2, 2);
    c.fillStyle = p.white; px(c, 3 + lk, 4 + by); px(c, 7 + lk, 4 + by);
  }

  if (isPlay) {
    c.fillStyle = p.nose; px(c, 2, 10 + by, 4, 1);
    c.fillStyle = p.tongue; c.fillRect(3, 11 + by, 2, 2);
  } else {
    c.fillStyle = p.nose; px(c, 3, 10 + by, 3, 1);
  }

  c.fillStyle = p.body; c.fillRect(4, 11 + headDip, 9, 6);
  c.fillStyle = p.white; c.fillRect(5, 14 + headDip, 5, 3);
  c.fillStyle = p.bodyLt; c.fillRect(4, 11 + headDip, 9, 2);

  c.fillStyle = p.body;
  const ts = isPlay ? 8 : 1.5; const tw = Math.sin(PUP.t * ts) * 1.5;
  const tl = isPlay ? -2 : 0;
  px(c, 13, 11 + headDip + Math.round(tw) + tl, 2, 1);
  px(c, 14, 10 + headDip + Math.round(tw) + tl, 2, 1);
  px(c, 15, 9 + headDip + Math.round(tw * 0.7) + tl, 1, 1);

  const ly = 17 + headDip;
  c.fillStyle = p.body;
  if (PUP.state === 'walk') {
    const s = f;
    c.fillRect(5, ly, 2, s < 2 ? 4 : 3); c.fillRect(7, ly, 2, s < 2 ? 3 : 4);
    c.fillRect(9, ly, 2, s >= 2 ? 4 : 3); c.fillRect(11, ly, 2, s >= 2 ? 3 : 4);
    c.fillStyle = p.dark;
    px(c, 5, ly + (s < 2 ? 3 : 2), 2, 1); px(c, 7, ly + (s < 2 ? 2 : 3), 2, 1);
    px(c, 9, ly + (s >= 2 ? 3 : 2), 2, 1); px(c, 11, ly + (s >= 2 ? 2 : 3), 2, 1);
  } else if (isPlay) {
    c.fillRect(4, ly, 2, 4); c.fillRect(6, ly, 2, 4);
    c.fillRect(9, ly - 1, 2, 3); c.fillRect(11, ly - 1, 2, 3);
    c.fillStyle = p.dark;
    px(c, 4, ly + 3, 2, 1); px(c, 6, ly + 3, 2, 1); px(c, 9, ly + 1, 2, 1); px(c, 11, ly + 1, 2, 1);
  } else {
    c.fillRect(5, ly, 2, 3); c.fillRect(7, ly, 2, 3); c.fillRect(9, ly, 2, 3); c.fillRect(11, ly, 2, 3);
    c.fillStyle = p.dark;
    px(c, 5, ly + 2, 2, 1); px(c, 7, ly + 2, 2, 1); px(c, 9, ly + 2, 2, 1); px(c, 11, ly + 2, 2, 1);
  }
}

// ── Draw Happy Bear ──
function drawBear() {
  const c = PUP.ctx; c.clearRect(0, 0, 24, 24);
  const p = bearPal(); const f = Math.floor(PUP.frame) % 4;
  PUP.t += 0.015;
  const isPlay = PUP.state === 'pet' || PUP.state === 'treat';
  const bob = isPlay ? 0 : Math.round(Math.sin(PUP.t) * 0.4);
  const headDip = isPlay ? 1 : 0;

  if (PUP.state === 'sleep') {
    c.fillStyle = p.body; c.fillRect(5, 14, 14, 6);
    c.fillStyle = p.white; c.fillRect(8, 16, 7, 4);
    c.fillStyle = p.body; c.fillRect(1, 9, 12, 8);
    c.fillStyle = p.ears; c.fillRect(1, 7, 4, 4); c.fillRect(9, 7, 4, 4);
    c.fillStyle = p.white; c.fillRect(3, 13, 6, 3);
    c.fillStyle = p.nose; px(c, 4, 13, 3, 2);
    c.fillStyle = p.eye; px(c, 4, 11, 2, 1); px(c, 8, 11, 2, 1);
    return;
  }

  const by = bob + headDip;
  c.fillStyle = p.ears;
  c.fillRect(0, 0 + by, 4, 4); c.fillRect(9, 0 + by, 4, 4);
  c.fillStyle = p.bodyLt; px(c, 1, 1 + by, 2, 2); px(c, 10, 1 + by, 2, 2);
  c.fillStyle = p.body;
  c.fillRect(0, 2 + by, 13, 10); c.fillRect(1, 1 + by, 11, 1); c.fillRect(1, 12 + by, 11, 1);
  c.fillStyle = p.white; c.fillRect(2, 8 + by, 8, 4); c.fillRect(3, 7 + by, 6, 1);
  c.fillStyle = p.nose; px(c, 4, 8 + by, 4, 2);

  if (isPlay) {
    c.fillStyle = '#ff5577';
    px(c, 2, 4 + by); px(c, 4, 4 + by); px(c, 3, 5 + by);
    px(c, 8, 4 + by); px(c, 10, 4 + by); px(c, 9, 5 + by);
  } else {
    c.fillStyle = p.eye;
    c.fillRect(3, 4 + by, 2, 3); c.fillRect(8, 4 + by, 2, 3);
    c.fillStyle = p.white; px(c, 3, 4 + by); px(c, 8, 4 + by);
  }

  if (isPlay) {
    c.fillStyle = p.mouth; px(c, 4, 11 + by, 4, 1);
    c.fillStyle = p.mouth; c.fillRect(5, 12 + by, 2, 1);
  } else {
    c.fillStyle = p.nose; px(c, 5, 11 + by, 2, 1);
  }

  c.fillStyle = p.body; c.fillRect(3, 12 + headDip, 10, 6); c.fillRect(2, 13 + headDip, 12, 4);
  c.fillStyle = p.white; c.fillRect(5, 14 + headDip, 5, 4);
  c.fillStyle = p.bodyLt; c.fillRect(3, 12 + headDip, 10, 2);
  c.fillStyle = p.body; px(c, 14, 13 + headDip, 1, 2);

  const ly = 17 + headDip;
  c.fillStyle = p.body;
  if (PUP.state === 'walk') {
    const s = f;
    c.fillRect(4, ly, 2, s < 2 ? 4 : 3); c.fillRect(6, ly, 2, s < 2 ? 3 : 4);
    c.fillRect(9, ly, 2, s >= 2 ? 4 : 3); c.fillRect(11, ly, 2, s >= 2 ? 3 : 4);
    c.fillStyle = p.dark;
    px(c, 4, ly + (s < 2 ? 3 : 2), 2, 1); px(c, 6, ly + (s < 2 ? 2 : 3), 2, 1);
    px(c, 9, ly + (s >= 2 ? 3 : 2), 2, 1); px(c, 11, ly + (s >= 2 ? 2 : 3), 2, 1);
  } else if (isPlay) {
    c.fillRect(3, ly, 2, 4); c.fillRect(5, ly, 2, 4);
    c.fillRect(9, ly - 1, 2, 3); c.fillRect(11, ly - 1, 2, 3);
    c.fillStyle = p.dark;
    px(c, 3, ly + 3, 2, 1); px(c, 5, ly + 3, 2, 1); px(c, 9, ly + 1, 2, 1); px(c, 11, ly + 1, 2, 1);
  } else {
    c.fillRect(4, ly, 2, 3); c.fillRect(6, ly, 2, 3); c.fillRect(9, ly, 2, 3); c.fillRect(11, ly, 2, 3);
    c.fillStyle = p.dark;
    px(c, 4, ly + 2, 2, 1); px(c, 6, ly + 2, 2, 1); px(c, 9, ly + 2, 2, 1); px(c, 11, ly + 2, 2, 1);
  }
}

// ═══════════════════════════════════════
// INITIALIZATION & POSITION
// ═══════════════════════════════════════
function initPuppy() {
  drawDoghouse(); drawSign();
  const div = document.createElement('div'); div.id = 'puppy';
  const cvs = document.createElement('canvas'); cvs.width = 24; cvs.height = 24;
  div.appendChild(cvs);
  document.querySelector('.app').appendChild(div);
  PUP.el = div; PUP.canvas = cvs; PUP.ctx = cvs.getContext('2d');
  PUP.stateTimer = Date.now();
  posPup();

  div.addEventListener('click', e => {
    e.stopPropagation();
    if (!PUP.awake) { wakePuppy(); return; }
    const act = Math.random() > 0.5 ? 'pet' : 'treat';
    PUP.state = act; PUP.frame = 0; PUP.stateTimer = Date.now();
    const rect = PUP.el.getBoundingClientRect();
    const em = document.createElement('div'); em.className = 'puppy-reaction';
    em.textContent = act === 'pet' ? '💖' : (activePet === 'winnie' ? '🦴' : '🍯');
    em.style.left = rect.left + rect.width / 2 - 8 + 'px';
    em.style.top = rect.top - 16 + 'px';
    em.style.position = 'fixed';
    document.body.appendChild(em); setTimeout(() => em.remove(), 1200);
  });

  startPetSwapTimer();
  requestAnimationFrame(puppyLoop);
}

function posPup() {
  const dh = document.getElementById('doghouse');
  const app = document.querySelector('.app');
  if (!dh || !app) return;
  const aR = app.getBoundingClientRect();
  const dhR = dh.getBoundingClientRect();
  const sY = window.scrollY;
  const y = dhR.bottom + sY - 48;
  const left = 0;
  const right = aR.width - 48;
  PUP.path = [{ x: left, y: y }, { x: right, y: y }];
  PUP.pathIdx = 0;
  PUP.x = left; PUP.y = y;
  PUP.targetX = PUP.path[1].x;
  PUP.targetY = PUP.path[1].y;
  PUP.pathIdx = 1;
}

// ═══════════════════════════════════════
// ANIMATION LOOP
// ═══════════════════════════════════════
function puppyLoop() {
  const now = Date.now();

  if (PUP.state === 'goHome') {
    PUP.frame += 0.025;
    const dx = dhTarget.x - PUP.x, dy = dhTarget.y - PUP.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 3) {
      goToSleep();
      if (sleepTimeout) clearTimeout(sleepTimeout);
      sleepTimeout = setTimeout(wakePuppy, 60000);
    } else {
      PUP.x += dx / dist * 1.2; PUP.y += dy / dist * 1.2;
      if (Math.abs(dx) > 1) PUP.dir = dx > 0 ? 1 : -1;
    }
  } else if (PUP.state === 'wakeUp') {
    PUP.frame += 0.08;
    const elapsed = now - PUP.stateTimer;
    PUP.dir = Math.sin(elapsed * 0.02) > 0 ? 1 : -1;
    if (elapsed > 2000) {
      PUP.state = 'walk'; PUP.stateTimer = now; PUP.dir = 1;
      const dh2 = document.getElementById('doghouse');
      const app2 = document.querySelector('.app');
      if (dh2 && app2) {
        const aR2 = app2.getBoundingClientRect();
        const dhR2 = dh2.getBoundingClientRect();
        const sY2 = window.scrollY;
        const y2 = dhR2.bottom + sY2 - 48;
        PUP.path = [{ x: 0, y: y2 }, { x: aR2.width - 48, y: y2 }];
        PUP.y = y2;
        const distLeft = Math.abs(PUP.x);
        const distRight = Math.abs(PUP.x - (aR2.width - 48));
        PUP.pathIdx = distRight > distLeft ? 1 : 0;
        PUP.targetX = PUP.path[PUP.pathIdx].x;
        PUP.targetY = y2;
      }
      const rect = PUP.el.getBoundingClientRect();
      const em = document.createElement('div'); em.className = 'puppy-reaction'; em.style.position = 'fixed';
      em.textContent = '🐾'; em.style.left = rect.left + rect.width / 2 - 8 + 'px'; em.style.top = rect.top - 16 + 'px';
      document.body.appendChild(em); setTimeout(() => em.remove(), 1200);
    }
  } else if (PUP.state === 'pet' || PUP.state === 'treat') {
    PUP.frame += 0.04;
    if (now - PUP.stateTimer > 3000) { PUP.state = 'walk'; PUP.stateTimer = now; }
  } else if (PUP.state === 'walk' && PUP.awake) {
    PUP.frame += 0.02;
    const tx = PUP.targetX, ty = PUP.targetY;
    const dx = tx - PUP.x, dy = ty - PUP.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 2) {
      if (Math.random() < 0.3) { PUP.state = 'sit'; PUP.stateTimer = now; }
      PUP.pathIdx = (PUP.pathIdx + 1) % PUP.path.length;
      PUP.targetX = PUP.path[PUP.pathIdx].x;
      PUP.targetY = PUP.path[PUP.pathIdx].y;
      const ndx2 = PUP.targetX - PUP.x;
      if (Math.abs(ndx2) > 1) PUP.dir = ndx2 > 0 ? 1 : -1;
    } else {
      PUP.x += dx / dist * PUP.walkSpeed; PUP.y += dy / dist * PUP.walkSpeed;
    }
    if (Math.abs(dx) > 1) PUP.dir = dx > 0 ? 1 : -1;
    if (now - PUP.stateTimer > PUP.SLEEP_AFTER) sendToSleep();
  } else if (PUP.state === 'sit') {
    PUP.frame += 0.01;
    if (now - PUP.stateTimer > 3000) {
      PUP.state = 'walk'; PUP.stateTimer = now;
      PUP.pathIdx = (PUP.pathIdx + 1) % PUP.path.length;
      PUP.targetX = PUP.path[PUP.pathIdx].x;
      PUP.targetY = PUP.path[PUP.pathIdx].y;
      const ndx = PUP.targetX - PUP.x;
      if (Math.abs(ndx) > 1) PUP.dir = ndx > 0 ? 1 : -1;
    }
  } else if (PUP.state === 'sleep') { PUP.frame += 0.01; }

  PUP.el.style.transform = PUP.dir > 0 ? 'scaleX(-1)' : '';
  if (activePet === 'winnie') drawWinnie(); else drawBear();
  PUP.el.style.left = PUP.x + 'px';
  PUP.el.style.top = PUP.y + 'px';
  PUP.el.style.display = PUP.state === 'sleep' ? 'none' : '';
  requestAnimationFrame(puppyLoop);
}

// ═══════════════════════════════════════
// SLEEP / WAKE
// ═══════════════════════════════════════
function getDHPos() {
  const dh = document.getElementById('doghouse');
  const app = document.querySelector('.app');
  const dhR = dh.getBoundingClientRect(); const aR = app.getBoundingClientRect();
  return { x: dhR.left - aR.left + 20, y: dhR.top + window.scrollY };
}

function goToSleep() {
  PUP.state = 'sleep'; PUP.awake = false;
  document.getElementById('dhZzz').style.display = '';
  const pos = getDHPos(); PUP.x = pos.x; PUP.y = pos.y;
}

function sendToSleep() {
  if (!PUP.awake || PUP.state === 'goHome') return;
  PUP.state = 'goHome';
  dhTarget = getDHPos();
}

function wakePuppy() {
  if (PUP.awake) return;
  if (sleepTimeout) { clearTimeout(sleepTimeout); sleepTimeout = null; }
  PUP.awake = true;
  PUP.state = 'wakeUp';
  PUP.stateTimer = Date.now();
  PUP.frame = 0;
  document.getElementById('dhZzz').style.display = 'none';
  const pos = getDHPos(); PUP.x = pos.x; PUP.y = pos.y;
}

// ═══════════════════════════════════════
// PET SWAP
// ═══════════════════════════════════════
function switchToPet(pet) {
  activePet = pet;
  if (pet === 'winnie') { drawDoghouse(); drawSign(); }
  else { drawCave(); drawBearSign(); }
  const btn = document.getElementById('petToggle');
  if (btn) { btn.textContent = pet === 'winnie' ? '🐕' : '🐻'; btn.title = pet === 'winnie' ? 'Switch to Happy Bear' : 'Switch to Winnie'; }
}

function togglePetManual() {
  switchToPet(activePet === 'winnie' ? 'bear' : 'winnie');
}

function startPetSwapTimer() {
  if (petSwapInterval) clearInterval(petSwapInterval);
  petSwapInterval = setInterval(() => {
    switchToPet(activePet === 'winnie' ? 'bear' : 'winnie');
  }, 600000);
}

// ── Init ──
setTimeout(initPuppy, 500);
window.addEventListener('resize', () => { if (PUP.awake && PUP.state === 'walk') posPup(); });
