const canvas = document.getElementById('viewport');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext('2d');

const coordsLabel = document.getElementById('coords');
const zoomLabel = document.getElementById('zoom-level');

// --- Coordinate system ---
let SCALE = 4;
let panX = 0;
let panY = 0;
const GRID_SIZE = 10;
const MAJOR_EVERY = 5;
const MIN_SCALE = 0.5;
const MAX_SCALE = 30;

function worldToScreen(x, y) {
  return { x: x * SCALE + panX, y: y * SCALE + panY };
}

function screenToWorld(x, y) {
  return { x: (x - panX) / SCALE, y: (y - panY) / SCALE };
}

function snapToGrid(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

// --- Tools ---
let activeTool = 'rectangle';
let gridSnapEnabled = false;

const rectBtn = document.getElementById('rect-tool');
const circleBtn = document.getElementById('circle-tool');
const lineBtn = document.getElementById('line-tool');
const gridSnapBtn = document.getElementById('grid-snap-tool');

function setActiveTool(tool) {
  activeTool = tool;
  rectBtn.classList.toggle('active', tool === 'rectangle');
  circleBtn.classList.toggle('active', tool === 'circle');
  lineBtn.classList.toggle('active', tool === 'line');
}

rectBtn.addEventListener('click', () => setActiveTool('rectangle'));
circleBtn.addEventListener('click', () => setActiveTool('circle'));
lineBtn.addEventListener('click', () => setActiveTool('line'));

gridSnapBtn.addEventListener('click', () => {
  gridSnapEnabled = !gridSnapEnabled;
  gridSnapBtn.classList.toggle('active', gridSnapEnabled);
  gridSnapBtn.textContent = gridSnapEnabled ? 'Grid Snap: On' : 'Grid Snap: Off';
});

// --- State ---
let mouseIsDown = false;
let isDrawing = false;
let isMoving = false;
let startX, startY;
let currentX, currentY;
let moveOffsetX, moveOffsetY;
let mouseScreenX = 0;
let mouseScreenY = 0;
let mouseOnCanvas = false;

const DRAG_THRESHOLD = 2;

const shapes = [];
let selectedShape = null;

function shapeArea(shape) {
  if (shape.type === 'rectangle') {
    return Math.abs(shape.width * shape.height);
  } else if (shape.type === 'circle') {
    return Math.PI * shape.radius * shape.radius;
  } else if (shape.type === 'line') {
    return 0.01; // lines have no area — treat as always "smallest" so they're easy to pick
  }
  return Infinity;
}

// --- Drawing ---
function drawGrid() {
  const topLeftWorld = screenToWorld(0, 0);
  const bottomRightWorld = screenToWorld(canvas.width, canvas.height);

  const startXWorld = Math.floor(topLeftWorld.x / GRID_SIZE) * GRID_SIZE;
  const endXWorld = Math.ceil(bottomRightWorld.x / GRID_SIZE) * GRID_SIZE;
  const startYWorld = Math.floor(topLeftWorld.y / GRID_SIZE) * GRID_SIZE;
  const endYWorld = Math.ceil(bottomRightWorld.y / GRID_SIZE) * GRID_SIZE;

  let lineIndex = Math.round(startXWorld / GRID_SIZE);
  for (let x = startXWorld; x <= endXWorld; x += GRID_SIZE) {
    const sx = worldToScreen(x, 0).x;
    ctx.strokeStyle = (lineIndex % MAJOR_EVERY === 0) ? '#33363b' : '#242629';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, canvas.height);
    ctx.stroke();
    lineIndex++;
  }

  lineIndex = Math.round(startYWorld / GRID_SIZE);
  for (let y = startYWorld; y <= endYWorld; y += GRID_SIZE) {
    const sy = worldToScreen(0, y).y;
    ctx.strokeStyle = (lineIndex % MAJOR_EVERY === 0) ? '#33363b' : '#242629';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(canvas.width, sy);
    ctx.stroke();
    lineIndex++;
  }
}

function drawCrosshair() {
  if (!mouseOnCanvas) return;

  ctx.strokeStyle = '#6a6d72';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(mouseScreenX, 0);
  ctx.lineTo(mouseScreenX, canvas.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, mouseScreenY);
  ctx.lineTo(canvas.width, mouseScreenY);
  ctx.stroke();

  ctx.fillStyle = '#e8b04b';
  ctx.beginPath();
  ctx.arc(mouseScreenX, mouseScreenY, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawShapes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  for (const shape of shapes) {
    ctx.strokeStyle = (shape === selectedShape) ? '#e8b04b' : '#5b9bd5';
    ctx.lineWidth = 2;

    if (shape.type === 'rectangle') {
      const topLeft = worldToScreen(shape.x, shape.y);
      const size = { x: shape.width * SCALE, y: shape.height * SCALE };
      ctx.strokeRect(topLeft.x, topLeft.y, size.x, size.y);
    } else if (shape.type === 'circle') {
      const center = worldToScreen(shape.x, shape.y);
      ctx.beginPath();
      ctx.arc(center.x, center.y, shape.radius * SCALE, 0, Math.PI * 2);
      ctx.stroke();
    } else if (shape.type === 'line') {
      const p1 = worldToScreen(shape.x1, shape.y1);
      const p2 = worldToScreen(shape.x2, shape.y2);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }

  drawCrosshair();
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) return Math.hypot(px - x1, py - y1);

  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;

  return Math.hypot(px - closestX, py - closestY);
}

function getShapeAt(x, y) {
  let bestMatch = null;
  let bestArea = Infinity;

  const LINE_HIT_TOLERANCE = 2; // world units (mm) — how close you need to click to a line

  for (const shape of shapes) {
    let hit = false;

    if (shape.type === 'rectangle') {
      const left = Math.min(shape.x, shape.x + shape.width);
      const right = Math.max(shape.x, shape.x + shape.width);
      const top = Math.min(shape.y, shape.y + shape.height);
      const bottom = Math.max(shape.y, shape.y + shape.height);
      hit = (x >= left && x <= right && y >= top && y <= bottom);
    } else if (shape.type === 'circle') {
      const distance = Math.hypot(x - shape.x, y - shape.y);
      hit = distance <= shape.radius;
    } else if (shape.type === 'line') {
      const distance = distanceToSegment(x, y, shape.x1, shape.y1, shape.x2, shape.y2);
      hit = distance <= LINE_HIT_TOLERANCE;
    }

    if (hit) {
      const area = shapeArea(shape);
      if (area < bestArea) {
        bestArea = area;
        bestMatch = shape;
      }
    }
  }

  return bestMatch;
}

function getWorldMouse(e) {
  const world = screenToWorld(e.offsetX, e.offsetY);
  if (gridSnapEnabled) {
    return { x: snapToGrid(world.x), y: snapToGrid(world.y) };
  }
  return world;
}

// --- Events ---
canvas.addEventListener('mousedown', (e) => {
  mouseIsDown = true;
  isDrawing = false;
  isMoving = false;

  const world = getWorldMouse(e);
  startX = world.x;
  startY = world.y;

  if (selectedShape) {
    const hit = getShapeAt(startX, startY);
    if (hit === selectedShape) {
      isMoving = true;
      moveOffsetX = startX - (selectedShape.x ?? selectedShape.x1);
      moveOffsetY = startY - (selectedShape.y ?? selectedShape.y1);
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  mouseScreenX = e.offsetX;
  mouseScreenY = e.offsetY;
  mouseOnCanvas = true;

  const worldPos = screenToWorld(e.offsetX, e.offsetY);
  coordsLabel.textContent = `X: ${worldPos.x.toFixed(1)}  Y: ${worldPos.y.toFixed(1)}`;

  if (!mouseIsDown) {
    drawShapes();
    return;
  }

  const world = getWorldMouse(e);
  currentX = world.x;
  currentY = world.y;

  const dragDistance = Math.hypot(currentX - startX, currentY - startY);

  if (isMoving) {
    if (selectedShape.type === 'line') {
      const dx = currentX - moveOffsetX - selectedShape.x1;
      const dy = currentY - moveOffsetY - selectedShape.y1;
      selectedShape.x1 += dx;
      selectedShape.y1 += dy;
      selectedShape.x2 += dx;
      selectedShape.y2 += dy;
    } else {
      selectedShape.x = currentX - moveOffsetX;
      selectedShape.y = currentY - moveOffsetY;
    }
    drawShapes();
    return;
  }

  if (!isDrawing && dragDistance > DRAG_THRESHOLD) {
    isDrawing = true;
    selectedShape = null;
  }

  if (!isDrawing) {
    drawShapes();
    return;
  }

  drawShapes();

  ctx.strokeStyle = '#5b9bd5';
  ctx.lineWidth = 2;

  if (activeTool === 'rectangle') {
    const topLeft = worldToScreen(startX, startY);
    const size = { x: (currentX - startX) * SCALE, y: (currentY - startY) * SCALE };
    ctx.strokeRect(topLeft.x, topLeft.y, size.x, size.y);
  } else if (activeTool === 'circle') {
    const radius = Math.hypot(currentX - startX, currentY - startY);
    const center = worldToScreen(startX, startY);
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius * SCALE, 0, Math.PI * 2);
    ctx.stroke();
  } else if (activeTool === 'line') {
    const p1 = worldToScreen(startX, startY);
    const p2 = worldToScreen(currentX, currentY);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
});

canvas.addEventListener('mouseleave', () => {
  mouseOnCanvas = false;
  drawShapes();
});

canvas.addEventListener('mouseup', (e) => {
  mouseIsDown = false;

  if (isMoving) {
    isMoving = false;
    drawShapes();
    return;
  }

  if (isDrawing) {
    if (activeTool === 'rectangle') {
      const width = currentX - startX;
      const height = currentY - startY;
      shapes.push({ type: 'rectangle', x: startX, y: startY, width, height });
    } else if (activeTool === 'circle') {
      const radius = Math.hypot(currentX - startX, currentY - startY);
      shapes.push({ type: 'circle', x: startX, y: startY, radius });
    } else if (activeTool === 'line') {
      shapes.push({ type: 'line', x1: startX, y1: startY, x2: currentX, y2: currentY });
    }

    isDrawing = false;
    drawShapes();
    return;
  }

  selectedShape = getShapeAt(startX, startY);
  drawShapes();
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();

  const worldBefore = screenToWorld(e.offsetX, e.offsetY);

  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  SCALE = Math.min(MAX_SCALE, Math.max(MIN_SCALE, SCALE * zoomFactor));

  panX = e.offsetX - worldBefore.x * SCALE;
  panY = e.offsetY - worldBefore.y * SCALE;

  zoomLabel.textContent = `Zoom: ${Math.round((SCALE / 4) * 100)}%`;

  drawShapes();
}, { passive: false });

document.addEventListener('keydown', (e) => {
  if (e.key === 'Delete' && selectedShape) {
    const index = shapes.indexOf(selectedShape);
    shapes.splice(index, 1);
    selectedShape = null;
    drawShapes();
  }
});

drawShapes();