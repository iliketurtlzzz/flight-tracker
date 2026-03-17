// 8-bit pixel art bears drawn on canvas

function drawWinnieBear(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const p = 4; // pixel size (64 / 16 grid)

  const colors = {
    body: '#F4A460',    // sandy brown
    belly: '#FFDEAD',   // lighter
    nose: '#4A3728',    // dark brown
    eye: '#1a1a2e',     // near black
    cheek: '#FF9999',   // pink blush
    ear: '#D2691E',     // darker brown
    honey: '#FFD700',   // gold
    shirt: '#CC0000',   // red shirt (Winnie!)
  };

  ctx.clearRect(0, 0, 64, 64);

  // Helper
  const px = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * p, y * p, p, p);
  };

  // Ears
  [4,5].forEach(x => [1,2].forEach(y => px(x, y, colors.ear)));
  [10,11].forEach(x => [1,2].forEach(y => px(x, y, colors.ear)));
  px(5, 1, colors.belly); px(10, 1, colors.belly);

  // Head
  for (let x = 5; x <= 10; x++) px(x, 2, colors.body);
  for (let x = 4; x <= 11; x++) px(x, 3, colors.body);
  for (let x = 4; x <= 11; x++) px(x, 4, colors.body);
  for (let x = 4; x <= 11; x++) px(x, 5, colors.body);
  for (let x = 5; x <= 10; x++) px(x, 6, colors.body);

  // Eyes
  px(6, 4, colors.eye); px(9, 4, colors.eye);

  // Nose
  px(7, 5, colors.nose); px(8, 5, colors.nose);

  // Cheeks
  px(5, 5, colors.cheek); px(10, 5, colors.cheek);

  // Red shirt (Winnie!)
  for (let x = 4; x <= 11; x++) px(x, 7, colors.shirt);
  for (let x = 3; x <= 12; x++) px(x, 8, colors.shirt);
  for (let x = 3; x <= 12; x++) px(x, 9, colors.shirt);
  for (let x = 4; x <= 11; x++) px(x, 10, colors.shirt);

  // Belly showing under shirt
  for (let x = 6; x <= 9; x++) px(x, 9, colors.belly);
  for (let x = 6; x <= 9; x++) px(x, 10, colors.belly);

  // Arms
  px(3, 8, colors.body); px(2, 9, colors.body);
  px(12, 8, colors.body); px(13, 9, colors.body);

  // Honey pot in hand
  px(1, 9, colors.honey); px(2, 10, colors.honey); px(1, 10, colors.honey);

  // Legs
  px(5, 11, colors.body); px(6, 11, colors.body);
  px(9, 11, colors.body); px(10, 11, colors.body);
  px(5, 12, colors.body); px(6, 12, colors.body);
  px(9, 12, colors.body); px(10, 12, colors.body);

  // Feet
  for (let x = 4; x <= 6; x++) px(x, 13, colors.nose);
  for (let x = 9; x <= 11; x++) px(x, 13, colors.nose);
}

function drawHappyBear(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const p = 4;

  const colors = {
    body: '#8B5E3C',
    belly: '#D2A679',
    nose: '#3B2314',
    eye: '#1a1a2e',
    cheek: '#FF9999',
    ear: '#6B3F23',
    mouth: '#3B2314',
    sparkle: '#FFD700',
  };

  ctx.clearRect(0, 0, 64, 64);

  const px = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * p, y * p, p, p);
  };

  // Ears
  [4,5].forEach(x => [1,2].forEach(y => px(x, y, colors.ear)));
  [10,11].forEach(x => [1,2].forEach(y => px(x, y, colors.ear)));
  px(5, 1, colors.belly); px(10, 1, colors.belly);

  // Head
  for (let x = 5; x <= 10; x++) px(x, 2, colors.body);
  for (let x = 4; x <= 11; x++) px(x, 3, colors.body);
  for (let x = 4; x <= 11; x++) px(x, 4, colors.body);
  for (let x = 4; x <= 11; x++) px(x, 5, colors.body);
  for (let x = 5; x <= 10; x++) px(x, 6, colors.body);

  // Happy eyes (^ ^) - closed happy eyes
  px(6, 4, colors.eye); px(5, 3, colors.eye); px(7, 3, colors.eye);
  px(9, 4, colors.eye); px(8, 3, colors.eye); px(10, 3, colors.eye);

  // Big smile
  px(6, 5, colors.mouth); px(7, 6, colors.mouth); px(8, 6, colors.mouth); px(9, 5, colors.mouth);

  // Nose
  px(7, 5, colors.nose); px(8, 5, colors.nose);

  // Cheeks
  px(5, 5, colors.cheek); px(10, 5, colors.cheek);

  // Sparkles around head
  px(3, 2, colors.sparkle); px(12, 2, colors.sparkle);
  px(2, 4, colors.sparkle); px(13, 4, colors.sparkle);

  // Body
  for (let x = 5; x <= 10; x++) px(x, 7, colors.body);
  for (let x = 4; x <= 11; x++) px(x, 8, colors.body);
  for (let x = 4; x <= 11; x++) px(x, 9, colors.body);
  for (let x = 4; x <= 11; x++) px(x, 10, colors.body);
  for (let x = 5; x <= 10; x++) px(x, 11, colors.body);

  // Belly
  for (let x = 6; x <= 9; x++) {
    px(x, 8, colors.belly);
    px(x, 9, colors.belly);
    px(x, 10, colors.belly);
  }

  // Arms raised (happy!)
  px(3, 7, colors.body); px(2, 6, colors.body); px(2, 5, colors.body);
  px(12, 7, colors.body); px(13, 6, colors.body); px(13, 5, colors.body);

  // Legs
  px(5, 12, colors.body); px(6, 12, colors.body);
  px(9, 12, colors.body); px(10, 12, colors.body);

  // Feet
  for (let x = 4; x <= 6; x++) px(x, 13, colors.nose);
  for (let x = 9; x <= 11; x++) px(x, 13, colors.nose);
}

// Draw bears when page loads
document.addEventListener('DOMContentLoaded', () => {
  drawWinnieBear('winnie-bear');
  drawHappyBear('happy-bear');
});
