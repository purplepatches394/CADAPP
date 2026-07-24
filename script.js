const canvas = document.getElementById('viewport');
const ctx = canvas.getContext('2d');

const coordsLabel = document.getElementById('coords');
const zoomLabel = document.getElementById('zoom-level');
const treeList = document.getElementById('tree-list');

const SIDEBAR_WIDTH = 180;

function resizeCanvas() {
  canvas.width = window.innerWidth - SIDEBAR_WIDTH;
  canvas.height = window.innerHeight;
  drawShapes();
}
window.addEventListener('resize', resizeCanvas);

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
let constructionModeEnabled = false;

const rectBtn = document.getElementById('rect-tool');
const circleBtn = document.getElementById('circle-tool');
const lineBtn = document.getElementById('line-tool');
const dimensionBtn = document.getElementById('dimension-tool');
const gridSnapBtn = document.getElementById('grid-snap-tool');
const constructionBtn = document.getElementById('construction-tool');

let dimensionFirstEntity = null;
let hoverEntity = null;
let hoverDimensionShape = null;
let justFinishedDimensionDrag = false;

function setActiveTool(tool) {
  activeTool = tool;
  rectBtn.classList.toggle('active', tool === 'rectangle');
  circleBtn.classList.toggle('active', tool === 'circle');
  lineBtn.classList.toggle('active', tool === 'line');
  dimensionBtn.classList.toggle('active', tool === 'dimension');
  dimensionFirstEntity = null;
  hoverEntity = null;
  hoverDimensionShape = null;
}

rectBtn.addEventListener('click', () => setActiveTool('rectangle'));
circleBtn.addEventListener('click', () => setActiveTool('circle'));
lineBtn.addEventListener('click', () => setActiveTool('line'));
dimensionBtn.addEventListener('click', () => setActiveTool('dimension'));

gridSnapBtn.addEventListener('click', () => {
  gridSnapEnabled = !gridSnapEnabled;
  gridSnapBtn.classList.toggle('active', gridSnapEnabled);
  gridSnapBtn.textContent = gridSnapEnabled ? 'Grid Snap: On' : 'Grid Snap: Off';
});

constructionBtn.addEventListener('click', () => {
  constructionModeEnabled = !constructionModeEnabled;
  constructionBtn.classList.toggle('active', constructionModeEnabled);
  constructionBtn.textContent = constructionModeEnabled ? 'Construction: On' : 'Construction: Off';
});

// --- State ---
let mouseIsDown = false;
let isDrawing = false;
let isMoving = false;
let isMovingDimensionOffset = false;
let isPanning = false;
let panStartX, panStartY, panStartPanX, panStartPanY;
let startX, startY;
let currentX, currentY;
let moveOffsetX, moveOffsetY;
let mouseScreenX = 0;
let mouseScreenY = 0;
let mouseOnCanvas = false;

const DRAG_THRESHOLD = 2;
const ENTITY_TOLERANCE = 3;
const LINE_HIT_TOLERANCE = 2;

let nextShapeId = 1;
const typeCounters = { rectangle: 0, circle: 0, line: 0, dimension: 0 };
const shapes = [];
let selectedShape = null;
let clipboardShape = null;

function createShape(props) {
  props.id = nextShapeId++;
  if (props.hidden === undefined) props.hidden = false;
  if (props.isConstruction === undefined) props.isConstruction = false;
  if (!props.name) {
    typeCounters[props.type] = (typeCounters[props.type] || 0) + 1;
    const label = props.type.charAt(0).toUpperCase() + props.type.slice(1);
    props.name = `${label} ${typeCounters[props.type]}`;
  }
  shapes.push(props);
  renderModelTree();
  return props;
}

function getShapeById(id) {
  return shapes.find(s => s.id === id) || null;
}

function selectShape(shape) {
  selectedShape = shape;
  renderModelTree();
}

// --- Model tree panel ---
function renderModelTree() {
  treeList.innerHTML = '';

  for (const shape of shapes) {
    const item = document.createElement('div');
    item.className = 'tree-item';
    if (shape === selectedShape) item.classList.add('selected');
    if (shape.hidden) item.classList.add('hidden-item');
    if (shape.isConstruction) item.classList.add('construction-item');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'tree-item-name';
    nameSpan.textContent = shape.name;
    item.appendChild(nameSpan);

    const actions = document.createElement('span');
    actions.className = 'tree-item-actions';

    if (shape.type !== 'dimension') {
      const constrBtn = document.createElement('span');
      constrBtn.className = 'tree-btn' + (shape.isConstruction ? ' on' : '');
      constrBtn.textContent = 'Constr';
      constrBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        shape.isConstruction = !shape.isConstruction;
        renderModelTree();
        drawShapes();
      });
      actions.appendChild(constrBtn);
    }

    const eyeBtn = document.createElement('span');
    eyeBtn.className = 'tree-btn';
    eyeBtn.textContent = shape.hidden ? 'Show' : 'Hide';
    eyeBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      shape.hidden = !shape.hidden;
      if (shape.hidden && selectedShape === shape) selectedShape = null;
      renderModelTree();
      drawShapes();
    });
    actions.appendChild(eyeBtn);

    item.appendChild(actions);

    item.addEventListener('click', () => {
      if (shape.hidden) return;
      selectShape(shape);
      drawShapes();
    });

    treeList.appendChild(item);
  }
}

function shapeArea(shape) {
  if (shape.type === 'rectangle') return Math.abs(shape.width * shape.height);
  if (shape.type === 'circle') return Math.PI * shape.radius * shape.radius;
  if (shape.type === 'line') return 0.01;
  if (shape.type === 'dimension') return 0.01;
  return Infinity;
}

// --- Entity system (edges/circles you can dimension against) ---
function resolveEntity(shapeId, edgeIndex) {
  const shape = getShapeById(shapeId);
  if (!shape || shape.hidden) return null;

  if (edgeIndex === 'circle') {
    return { kind: 'circle', cx: shape.x, cy: shape.y, radius: shape.radius };
  }

  if (shape.type === 'line') {
    return { kind: 'edge', x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2 };
  }

  if (shape.type === 'rectangle') {
    const corners = [
      { x: shape.x, y: shape.y },
      { x: shape.x + shape.width, y: shape.y },
      { x: shape.x + shape.width, y: shape.y + shape.height },
      { x: shape.x, y: shape.y + shape.height }
    ];
    const a = corners[edgeIndex];
    const b = corners[(edgeIndex + 1) % 4];
    return { kind: 'edge', x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  }

  return null;
}

function getAllEntityRefs() {
  const refs = [];
  for (const shape of shapes) {
    if (shape.hidden) continue;
    if (shape.type === 'line') {
      refs.push({ shapeId: shape.id, edgeIndex: 0 });
    } else if (shape.type === 'rectangle') {
      for (let i = 0; i < 4; i++) refs.push({ shapeId: shape.id, edgeIndex: i });
    } else if (shape.type === 'circle') {
      refs.push({ shapeId: shape.id, edgeIndex: 'circle' });
    }
  }
  return refs;
}

function getEntityAt(x, y) {
  let best = null;
  let bestDist = ENTITY_TOLERANCE;

  for (const ref of getAllEntityRefs()) {
    const r = resolveEntity(ref.shapeId, ref.edgeIndex);
    if (!r) continue;

    const d = (r.kind === 'circle')
      ? Math.abs(Math.hypot(x - r.cx, y - r.cy) - r.radius)
      : distanceToSegment(x, y, r.x1, r.y1, r.x2, r.y2);

    if (d < bestDist) {
      bestDist = d;
      best = ref;
    }
  }

  return best;
}

function getDimensionAt(x, y) {
  let best = null;
  let bestDist = LINE_HIT_TOLERANCE;

  for (const shape of shapes) {
    if (shape.hidden || shape.type !== 'dimension') continue;

    const geo = computeDimensionGeometry(shape);
    if (!geo) continue;

    const d = distanceToSegment(x, y, geo.dp1.x, geo.dp1.y, geo.dp2.x, geo.dp2.y);
    if (d < bestDist) {
      bestDist = d;
      best = shape;
    }
  }

  return best;
}

function closestPointOnSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return { x: x1, y: y1, dist: Math.hypot(px - x1, py - y1) };

  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const cx = x1 + t * dx;
  const cy = y1 + t * dy;

  return { x: cx, y: cy, dist: Math.hypot(px - cx, py - cy) };
}

function segmentMinDistance(segA, segB) {
  const candidates = [];

  let c = closestPointOnSegment(segA.x1, segA.y1, segB.x1, segB.y1, segB.x2, segB.y2);
  candidates.push({ p1: { x: segA.x1, y: segA.y1 }, p2: { x: c.x, y: c.y }, distance: c.dist });

  c = closestPointOnSegment(segA.x2, segA.y2, segB.x1, segB.y1, segB.x2, segB.y2);
  candidates.push({ p1: { x: segA.x2, y: segA.y2 }, p2: { x: c.x, y: c.y }, distance: c.dist });

  c = closestPointOnSegment(segB.x1, segB.y1, segA.x1, segA.y1, segA.x2, segA.y2);
  candidates.push({ p1: { x: c.x, y: c.y }, p2: { x: segB.x1, y: segB.y1 }, distance: c.dist });

  c = closestPointOnSegment(segB.x2, segB.y2, segA.x1, segA.y1, segA.x2, segA.y2);
  candidates.push({ p1: { x: c.x, y: c.y }, p2: { x: segB.x2, y: segB.y2 }, distance: c.dist });

  candidates.sort((a, b) => a.distance - b.distance);
  return candidates[0];
}

function computeDimensionGeometry(dim) {
  const A = resolveEntity(dim.entityA.shapeId, dim.entityA.edgeIndex);
  const B = resolveEntity(dim.entityB.shapeId, dim.entityB.edgeIndex);
  if (!A || !B) return null;

  const segA = A.kind === 'edge' ? A : { x1: A.cx, y1: A.cy, x2: A.cx, y2: A.cy };
  const segB = B.kind === 'edge' ? B : { x1: B.cx, y1: B.cy, x2: B.cx, y2: B.cy };

  const { p1, p2, distance } = segmentMinDistance(segA, segB);

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;
  const perp = { x: -dy / len, y: dx / len };

  const offset = dim.offset ?? 15;
  const dp1 = { x: p1.x + perp.x * offset, y: p1.y + perp.y * offset };
  const dp2 = { x: p2.x + perp.x * offset, y: p2.y + perp.y * offset };

  return { p1, p2, dp1, dp2, distance, perp };
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

function drawEntityHighlight(ref, color) {
  const resolved = resolveEntity(ref.shapeId, ref.edgeIndex);
  if (!resolved) return;

  ctx.setLineDash([]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;

  if (resolved.kind === 'circle') {
    const c = worldToScreen(resolved.cx, resolved.cy);
    ctx.beginPath();
    ctx.arc(c.x, c.y, resolved.radius * SCALE, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    const a = worldToScreen(resolved.x1, resolved.y1);
    const b = worldToScreen(resolved.x2, resolved.y2);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

function drawShapes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  for (const shape of shapes) {
    if (shape.hidden) continue;
    if (shape.type === 'dimension') continue;

    const isSelected = shape === selectedShape;

    if (shape.isConstruction) {
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = isSelected ? '#e8b04b' : '#7a8a99';
    } else {
      ctx.setLineDash([]);
      ctx.strokeStyle = isSelected ? '#e8b04b' : '#5b9bd5';
    }
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

    ctx.setLineDash([]);
  }

  for (const shape of shapes) {
    if (shape.hidden) continue;
    if (shape.type !== 'dimension') continue;

    const geo = computeDimensionGeometry(shape);
    if (!geo) continue;

    const p1s = worldToScreen(geo.p1.x, geo.p1.y);
    const p2s = worldToScreen(geo.p2.x, geo.p2.y);
    const dp1s = worldToScreen(geo.dp1.x, geo.dp1.y);
    const dp2s = worldToScreen(geo.dp2.x, geo.dp2.y);

    const isSelected = shape === selectedShape;
    const isHovered = shape === hoverDimensionShape;

    ctx.setLineDash([]);
    ctx.strokeStyle = '#5c5f63';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(p1s.x, p1s.y); ctx.lineTo(dp1s.x, dp1s.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p2s.x, p2s.y); ctx.lineTo(dp2s.x, dp2s.y); ctx.stroke();

    const lineColor = isSelected ? '#ffce6b' : (isHovered ? '#f7c877' : '#e8b04b');
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = (isSelected || isHovered) ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(dp1s.x, dp1s.y);
    ctx.lineTo(dp2s.x, dp2s.y);
    ctx.stroke();

    const midX = (dp1s.x + dp2s.x) / 2;
    const midY = (dp1s.y + dp2s.y) / 2;

    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    const label = geo.distance.toFixed(1) + ' mm';
    const textWidth = ctx.measureText(label).width;

    ctx.fillStyle = '#1c1e21';
    ctx.fillRect(midX - textWidth / 2 - 4, midY - 16, textWidth + 8, 16);

    ctx.fillStyle = lineColor;
    ctx.fillText(label, midX, midY - 4);
  }

  if (activeTool === 'dimension') {
    if (hoverEntity) drawEntityHighlight(hoverEntity, '#6fc9e8');
    if (dimensionFirstEntity) drawEntityHighlight(dimensionFirstEntity, '#7fc97f');
  }

  ctx.setLineDash([]);
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

  for (const shape of shapes) {
    if (shape.hidden) continue;

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
    } else if (shape.type === 'dimension') {
      const geo = computeDimensionGeometry(shape);
      if (geo) {
        const distance = distanceToSegment(x, y, geo.dp1.x, geo.dp1.y, geo.dp2.x, geo.dp2.y);
        hit = distance <= LINE_HIT_TOLERANCE;
      }
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
  if (e.button === 1) {
    e.preventDefault();
    isPanning = true;
    panStartX = e.offsetX;
    panStartY = e.offsetY;
    panStartPanX = panX;
    panStartPanY = panY;
    return;
  }

  if (activeTool === 'dimension') {
    const world = screenToWorld(e.offsetX, e.offsetY);
    const dimHit = getDimensionAt(world.x, world.y);

    if (dimHit) {
      mouseIsDown = true;
      selectShape(dimHit);
      isMovingDimensionOffset = true;
      drawShapes();
    }
    return;
  }

  mouseIsDown = true;
  isDrawing = false;
  isMoving = false;
  isMovingDimensionOffset = false;

  const world = getWorldMouse(e);
  startX = world.x;
  startY = world.y;

  if (selectedShape) {
    const hit = getShapeAt(startX, startY);
    if (hit === selectedShape) {
      if (selectedShape.type === 'dimension') {
        isMovingDimensionOffset = true;
      } else {
        isMoving = true;
        moveOffsetX = startX - (selectedShape.x ?? selectedShape.x1);
        moveOffsetY = startY - (selectedShape.y ?? selectedShape.y1);
      }
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  mouseScreenX = e.offsetX;
  mouseScreenY = e.offsetY;
  mouseOnCanvas = true;

  if (isPanning) {
    panX = panStartPanX + (e.offsetX - panStartX);
    panY = panStartPanY + (e.offsetY - panStartY);
    drawShapes();
    return;
  }

  const worldPos = screenToWorld(e.offsetX, e.offsetY);
  coordsLabel.textContent = `X: ${worldPos.x.toFixed(1)}  Y: ${worldPos.y.toFixed(1)}`;

  if (isMovingDimensionOffset) {
    const geo = computeDimensionGeometry(selectedShape);
    if (geo) {
      const relX = worldPos.x - geo.p1.x;
      const relY = worldPos.y - geo.p1.y;
      selectedShape.offset = relX * geo.perp.x + relY * geo.perp.y;
    }
    drawShapes();
    return;
  }

  if (activeTool === 'dimension') {
    hoverDimensionShape = getDimensionAt(worldPos.x, worldPos.y);
    hoverEntity = hoverDimensionShape ? null : getEntityAt(worldPos.x, worldPos.y);
    drawShapes();
    return;
  }

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
    selectShape(null);
  }

  if (!isDrawing) {
    drawShapes();
    return;
  }

  drawShapes();

  if (constructionModeEnabled) {
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#7a8a99';
  } else {
    ctx.setLineDash([]);
    ctx.strokeStyle = '#5b9bd5';
  }
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

  ctx.setLineDash([]);
});

canvas.addEventListener('mouseleave', () => {
  mouseOnCanvas = false;
  drawShapes();
});

canvas.addEventListener('click', (e) => {
  if (justFinishedDimensionDrag) {
    justFinishedDimensionDrag = false;
    return;
  }

  if (activeTool !== 'dimension') return;

  const world = screenToWorld(e.offsetX, e.offsetY);

  if (getDimensionAt(world.x, world.y)) return;

  const entity = getEntityAt(world.x, world.y);
  if (!entity) return;

  if (!dimensionFirstEntity) {
    dimensionFirstEntity = entity;
  } else {
    const isSameEntity = entity.shapeId === dimensionFirstEntity.shapeId && entity.edgeIndex === dimensionFirstEntity.edgeIndex;
    if (!isSameEntity) {
      createShape({
        type: 'dimension',
        entityA: dimensionFirstEntity,
        entityB: entity,
        offset: 15
      });
      dimensionFirstEntity = null;
    }
  }

  drawShapes();
});

document.addEventListener('mouseup', (e) => {
  if (isPanning) {
    isPanning = false;
    return;
  }

  if (!mouseIsDown) return;
  mouseIsDown = false;

  if (isMovingDimensionOffset) {
    isMovingDimensionOffset = false;
    justFinishedDimensionDrag = true;
    drawShapes();
    return;
  }

  if (isMoving) {
    isMoving = false;
    drawShapes();
    return;
  }

  if (isDrawing) {
    if (activeTool === 'rectangle') {
      const width = currentX - startX;
      const height = currentY - startY;
      createShape({ type: 'rectangle', x: startX, y: startY, width, height, isConstruction: constructionModeEnabled });
    } else if (activeTool === 'circle') {
      const radius = Math.hypot(currentX - startX, currentY - startY);
      createShape({ type: 'circle', x: startX, y: startY, radius, isConstruction: constructionModeEnabled });
    } else if (activeTool === 'line') {
      createShape({ type: 'line', x1: startX, y1: startY, x2: currentX, y2: currentY, isConstruction: constructionModeEnabled });
    }

    isDrawing = false;
    drawShapes();
    return;
  }

  selectShape(getShapeAt(startX, startY));
  drawShapes();
});

canvas.addEventListener('auxclick', (e) => e.preventDefault());

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
  if (e.key === 'Escape') {
    dimensionFirstEntity = null;
    drawShapes();
    return;
  }

  if (e.key === 'Delete' && selectedShape) {
    const index = shapes.indexOf(selectedShape);
    shapes.splice(index, 1);
    selectedShape = null;
    renderModelTree();
    drawShapes();
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
    if (selectedShape) {
      e.preventDefault();
      clipboardShape = JSON.parse(JSON.stringify(selectedShape));
    }
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
    if (clipboardShape) {
      e.preventDefault();
      const clone = JSON.parse(JSON.stringify(clipboardShape));
      delete clone.id;
      delete clone.name;

      const OFFSET = 10;
      if (clone.type === 'rectangle' || clone.type === 'circle') {
        clone.x += OFFSET;
        clone.y += OFFSET;
      } else if (clone.type === 'line') {
        clone.x1 += OFFSET;
        clone.y1 += OFFSET;
        clone.x2 += OFFSET;
        clone.y2 += OFFSET;
      }

      const newShape = createShape(clone);
      selectShape(newShape);
      drawShapes();
    }
    return;
  }
});

resizeCanvas();