// 8-bit Winnie (pitbull) & Happy Bear — ported from richmanssport-dashboard
// Static display versions for the header

function px(c, x, y, w, h) { c.fillRect(x, y, w || 1, h || 1); }

function drawWinnieBear(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const c = canvas.getContext('2d');
  c.clearRect(0, 0, 24, 24);

  const p = {
    body: '#7eb8e0', bodyLt: '#a0d4f0', dark: '#5a9cc5',
    white: '#e0f0ff', nose: '#3a7ca8', eye: '#1a4a70',
    tongue: '#e07080', outline: '#4a8ab0'
  };

  // ══ BIG HEAD ══
  c.fillStyle = p.body;
  c.fillRect(1, 1, 11, 10); c.fillRect(0, 3, 13, 6);
  c.fillRect(2, 0, 9, 1);
  // Dark ears — floppy
  c.fillStyle = p.dark;
  c.fillRect(0, 0, 2, 7); c.fillRect(11, 0, 2, 7);
  // White muzzle
  c.fillStyle = p.white;
  c.fillRect(1, 7, 7, 4); c.fillRect(0, 8, 2, 2);
  // Nose
  c.fillStyle = p.nose; px(c, 1, 7, 2, 2);
  // Eyes — big white with pupils
  c.fillStyle = p.white; c.fillRect(3, 3, 3, 3); c.fillRect(7, 3, 3, 3);
  c.fillStyle = p.eye;
  c.fillRect(4, 4, 2, 2); c.fillRect(8, 4, 2, 2);
  c.fillStyle = p.white; px(c, 4, 4); px(c, 8, 4); // shine
  // Mouth — smile
  c.fillStyle = p.nose; px(c, 3, 10, 3, 1);

  // ══ BODY ══
  c.fillStyle = p.body; c.fillRect(4, 11, 9, 6);
  c.fillStyle = p.white; c.fillRect(5, 14, 5, 3); // belly
  c.fillStyle = p.bodyLt; c.fillRect(4, 11, 9, 2); // lighter back

  // ══ TAIL ══
  c.fillStyle = p.body;
  px(c, 13, 11, 2, 1); px(c, 14, 10, 2, 1); px(c, 15, 9, 1, 1);

  // ══ LEGS — standing ══
  c.fillStyle = p.body;
  c.fillRect(5, 17, 2, 3); c.fillRect(7, 17, 2, 3);
  c.fillRect(9, 17, 2, 3); c.fillRect(11, 17, 2, 3);
  c.fillStyle = p.dark;
  px(c, 5, 19, 2, 1); px(c, 7, 19, 2, 1);
  px(c, 9, 19, 2, 1); px(c, 11, 19, 2, 1);
}

function drawHappyBear(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const c = canvas.getContext('2d');
  c.clearRect(0, 0, 24, 24);

  const p = {
    body: '#A67B5B', bodyLt: '#C49A6C', dark: '#6B4226',
    white: '#E8D5B7', nose: '#3a2010', eye: '#1a0a00',
    mouth: '#d06060', ears: '#6B4226'
  };

  // ══ ROUND EARS ══
  c.fillStyle = p.ears;
  c.fillRect(0, 0, 4, 4); c.fillRect(9, 0, 4, 4);
  c.fillStyle = p.bodyLt; px(c, 1, 1, 2, 2); px(c, 10, 1, 2, 2); // inner ear

  // ══ BIG ROUND HEAD ══
  c.fillStyle = p.body;
  c.fillRect(0, 2, 13, 10); c.fillRect(1, 1, 11, 1); c.fillRect(1, 12, 11, 1);
  // Muzzle
  c.fillStyle = p.white;
  c.fillRect(2, 8, 8, 4); c.fillRect(3, 7, 6, 1);
  // Nose
  c.fillStyle = p.nose; px(c, 4, 8, 4, 2);
  // Eyes — big with shine
  c.fillStyle = p.eye;
  c.fillRect(3, 4, 2, 3); c.fillRect(8, 4, 2, 3);
  c.fillStyle = p.white; px(c, 3, 4); px(c, 8, 4); // shine
  // Mouth — smile
  c.fillStyle = p.nose; px(c, 5, 11, 2, 1);

  // ══ BODY ══
  c.fillStyle = p.body; c.fillRect(3, 12, 10, 6); c.fillRect(2, 13, 12, 4);
  c.fillStyle = p.white; c.fillRect(5, 14, 5, 4); // belly
  c.fillStyle = p.bodyLt; c.fillRect(3, 12, 10, 2); // lighter back

  // ══ STUBBY TAIL ══
  c.fillStyle = p.body; px(c, 14, 13, 1, 2);

  // ══ LEGS — standing ══
  c.fillStyle = p.body;
  c.fillRect(4, 17, 2, 3); c.fillRect(6, 17, 2, 3);
  c.fillRect(9, 17, 2, 3); c.fillRect(11, 17, 2, 3);
  c.fillStyle = p.dark;
  px(c, 4, 19, 2, 1); px(c, 6, 19, 2, 1);
  px(c, 9, 19, 2, 1); px(c, 11, 19, 2, 1);
}

// Draw on load
document.addEventListener('DOMContentLoaded', () => {
  drawWinnieBear('winnie-bear');
  drawHappyBear('happy-bear');
});
