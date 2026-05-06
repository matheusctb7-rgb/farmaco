const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const selectedLabel = document.getElementById('selectedLabel');

const WORLD_W = 160;
const WORLD_H = 90;
const TILE = 24;

const blocks = [
  { name: 'Grama', color: '#22c55e' },
  { name: 'Terra', color: '#92400e' },
  { name: 'Pedra', color: '#64748b' },
  { name: 'Areia', color: '#fde68a' },
  { name: 'Água', color: '#38bdf8' },
  { name: 'Madeira', color: '#b45309' }
];

let selected = 0;
const world = Array.from({ length: WORLD_H }, (_, y) =>
  Array.from({ length: WORLD_W }, () => (y > WORLD_H / 2 ? 1 : -1))
);

for (let x = 0; x < WORLD_W; x++) {
  const groundY = Math.floor(WORLD_H / 2 + Math.sin(x * 0.17) * 3);
  for (let y = groundY; y < WORLD_H; y++) {
    world[y][x] = y === groundY ? 0 : 1;
  }
}

const camera = { x: 0, y: 0 };
const keys = new Set();

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function screenToWorld(mx, my) {
  const tx = Math.floor((mx + camera.x) / TILE);
  const ty = Math.floor((my + camera.y) / TILE);
  return { x: tx, y: ty };
}

function setBlock(tx, ty, value) {
  if (tx < 0 || ty < 0 || tx >= WORLD_W || ty >= WORLD_H) return;
  world[ty][tx] = value;
}

canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;
  const { x, y } = screenToWorld(mx, my);

  if (e.button === 0) setBlock(x, y, selected);
  if (e.button === 2) setBlock(x, y, -1);
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  selected = (selected + (e.deltaY > 0 ? 1 : -1) + blocks.length) % blocks.length;
  selectedLabel.textContent = `Bloco: ${blocks[selected].name}`;
});

window.addEventListener('keydown', (e) => keys.add(e.key.toLowerCase()));
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

function update(dt) {
  const speed = 320 * dt;
  if (keys.has('a')) camera.x -= speed;
  if (keys.has('d')) camera.x += speed;
  if (keys.has('w')) camera.y -= speed;
  if (keys.has('s')) camera.y += speed;

  const maxX = WORLD_W * TILE - canvas.width;
  const maxY = WORLD_H * TILE - canvas.height;
  camera.x = clamp(camera.x, 0, Math.max(0, maxX));
  camera.y = clamp(camera.y, 0, Math.max(0, maxY));
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const startX = Math.floor(camera.x / TILE);
  const startY = Math.floor(camera.y / TILE);
  const endX = Math.ceil((camera.x + canvas.width) / TILE);
  const endY = Math.ceil((camera.y + canvas.height) / TILE);

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      if (y < 0 || x < 0 || y >= WORLD_H || x >= WORLD_W) continue;
      const b = world[y][x];
      if (b < 0) continue;

      const sx = x * TILE - camera.x;
      const sy = y * TILE - camera.y;

      ctx.fillStyle = blocks[b].color;
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.strokeRect(sx + 0.5, sy + 0.5, TILE - 1, TILE - 1);
    }
  }
}

let last = performance.now();
function frame(now) {
  const dt = (now - last) / 1000;
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
