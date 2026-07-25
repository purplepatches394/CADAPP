import { solveLineLength, solveLineLengthAngle } from './solver.js';

const canvas = document.getElementById('viewport');
const ctx = canvas.getContext('2d');

const coordsLabel = document.getElementById('coords');
const zoomLabel = document.getElementById('zoom-level');
const treeList = document.getElementById('tree-list');
const propertyPanel = document.getElementById('property-panel');

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
let activeTool = 'select';
let gridSnapEnabled = false;
let constructionModeEnabled = false;

const selectBtn = document.getElementById('select-tool');
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

let drawStartPoint = null;
let typedLength = '';
let typedAngle = '';
let typedRadius = '';
let activeTypedField = 'length';
let lastMouseWorldX = 0;
let lastMouseWorldY = 0;

function setActiveTool(tool) {
  activeTool = tool;
  selectBtn.classList.toggle('active', tool === 'select');
  rectBtn.classList.toggle('active', tool === 'rectangle');
  circleBtn.classList.toggle('active', tool === 'circle');
  lineBtn.classList.toggle('active', tool === 'line');
  dimensionBtn.classList.toggle('active', tool === 'dimension');

  dimensionFirstEntity = null;
  hoverEntity = null;
  hoverDimensionShape = null;
  drawStartPoint = null;
  typedLength = '';
  typedAngle = '';
  typedRadius = '';
  drawShapes();
}

selectBtn.addEventListener('click', () => setActiveTool('select'));
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
let isMoving = false;
let isMovingDimensionOffset = false;
let isDraggingHandle = false;
let draggingHandleInfo = null;
let isPanning = false;
let panStartX, panStartY, panStartPanX, panStartPanY;
let startX, startY;
let currentX, currentY;
let moveOffsetX, moveOffsetY;
let mouseScreenX = 0;
let mouseScreenY = 0;
let mouseOnCanvas = false;

const ENTITY_TOLERANCE = 3;
const LINE_HIT_TOLERANCE = 2;
const HANDLE_HIT_PIXELS = 8;

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

function commitShape(endX, endY) {
  if (activeTool === 'rectangle') {
    const width = endX - drawStartPoint.x;
    const height = endY - drawStartPoint.y;
    createShape({ type: 'rectangle', x: drawStartPoint.x, y: drawStartPoint.y, width, height, isConstruction: constructionModeEnabled });
  } else if (activeTool === 'circle') {
    const radius = Math.hypot(endX - drawStartPoint.x, endY - drawStartPoint.y);
    createShape({ type: 'circle', x: drawStartPoint.x, y: drawStartPoint.y, radius, isConstruction: constructionModeEnabled });
  } else if (activeTool === 'line') {
    createShape({ type: 'line', x1: drawStartPoint.x, y1: drawStartPoint.y, x2: endX, y2: endY, isConstruction: constructionModeEnabled });
  }
  drawStartPoint = null;
  typedLength = '';
  typedAngle = '';
  typedRadius = '';
}

function finalizeDrawFromTyped() {
  if (!drawStartPoint) return;
  let endX, endY;

  if (activeTool === 'line') {
    const length = typedLength !== '' ? parseFloat(typedLength) : Math.hypot(lastMouseWorldX - drawStartPoint.x, lastMouseWorldY - drawStartPoint.y);
    const angleDeg = typedAngle !== '' ? parseFloat(typedAngle) : Math.atan2(lastMouseWorldY - drawStartPoint.y, lastMouseWorldX - drawStartPoint.x) * 180 / Math.PI;
    if (isNaN(length) || isNaN(angleDeg)) return;
    const angleRad = angleDeg * Math.PI / 180;
    endX = drawStartPoint.x + Math.cos(angleRad) * length;
    endY = drawStartPoint.y + Math.sin(angleRad) * length;
  } else if (activeTool === 'circle') {
    if (typedRadius === '') return;
    const radius = parseFloat(typedRadius);
    if (isNaN(radius)) return;
    const angle = Math.atan2(lastMouseWorldY - drawStartPoint.y, lastMouseWorldX - drawStartPoint.x);
    endX = drawStartPoint.x + Math.cos(angle) * radius;
    endY = drawStartPoint.y + Math.sin(angle) * radius;
  } else {
    return;
  }

  commitShape(endX, endY);
  drawShapes();
}

function redrawPreview() {
  if (!drawStartPoint) return;
  drawShapes();
  drawLivePreviewAndTooltip(lastMouseWorldX, lastMouseWorldY);
}

function getShapeById(id) {
  return shapes.find(s => s.id === id) || null;
}

function selectShape(shape) {
  selectedShape = shape;
  renderModelTree();
  updatePropertyPanel();
}

// --- Vertex helpers ---
function getVertexPosition(shapeId, vertexIndex) {
  const shape = getShapeById(shapeId);
  if (!shape) return null;

  if (shape.type === 'line') {
    return vertexIndex === 0 ? { x: shape.x1, y: shape.y1 } : { x: shape.x2, y: shape.y2 };
  }
  if (shape.type === 'circle') {
    return { x: shape.x, y: shape.y };
  }
  if (shape.type === 'rectangle') {
    const corners = [
      { x: shape.x, y: shape.y },
      { x: shape.x + shape.width, y: shape.y },
      { x: shape.x + shape.width, y: shape.y + shape.height },
      { x: shape.x, y: shape.y + shape.height }
    ];
    return corners[vertexIndex];
  }
  return null;
}

function moveVertex(shapeId, vertexIndex, x, y) {
  const shape = getShapeById(shapeId);
  if (!shape) return;

  if (shape.type === 'line') {
    if (vertexIndex === 0) { shape.x1 = x; shape.y1 = y; }
    else { shape.x2 = x; shape.y2 = y; }
  } else if (shape.type === 'circle') {
    shape.x = x; shape.y = y;
  } else if (shape.type === 'rectangle') {
    const corners = [
      { x: shape.x, y: shape.y },
      { x: shape.x + shape.width, y: shape.y },
      { x: shape.x + shape.width, y: shape.y + shape.height },
      { x: shape.x, y: shape.y + shape.height }
    ];
    const oppositeIndex = (vertexIndex + 2) % 4;
    const anchor = corners[oppositeIndex];
    shape.x = Math.min(anchor.x, x);
    shape.y = Math.min(anchor.y, y);
    shape.width = Math.abs(x - anchor.x);
    shape.height = Math.abs(y - anchor.y);
  }
}

// --- Selection handles ---
function getHandlesForShape(shape) {
  if (!shape) return [];

  if (shape.type === 'line') {
    return [
      { vertexIndex: 0, pos: { x: shape.x1, y: shape.y1 } },
      { vertexIndex: 1, pos: { x: shape.x2, y: shape.y2 } }
    ];
  }
  if (shape.type === 'rectangle') {
    const corners = [
      { x: shape.x, y: shape.y },
      { x: shape.x + shape.width, y: shape.y },
      { x: shape.x + shape.width, y: shape.y + shape.height },
      { x: shape.x, y: shape.y + shape.height }
    ];
    return corners.map((c, i) => ({ vertexIndex: i, pos: c }));
  }
  if (shape.type === 'circle') {
    return [
      { vertexIndex: 'center', pos: { x: shape.x, y: shape.y } },
      { vertexIndex: 'radius', pos: { x: shape.x + shape.radius, y: shape.y } }
    ];
  }
  return [];
}

function getHandleAt(screenX, screenY) {
  if (!selectedShape || selectedShape.hidden) return null;

  for (const h of getHandlesForShape(selectedShape)) {
    const s = worldToScreen(h.pos.x, h.pos.y);
    const d = Math.hypot(screenX - s.x, screenY - s.y);
    if (d <= HANDLE_HIT_PIXELS) return h;
  }
  return null;
}

// --- Property panel ---
function makeField(labelText, value) {
  const label = document.createElement('label');
  label.textContent = labelText;
  const input = document.createElement('input');
  input.type = 'number';
  input.step = '0.1';
  input.value = value.toFixed(1);
  label.appendChild(input);
  return { label, input };
}

function makeButton(text) {
  const btn = document.createElement('button');
  btn.className = 'tool-btn';
  btn.textContent = text;
  return btn;
}

function makeDivider() {
  const div = document.createElement('div');
  div.className = 'property-divider';
  return div;
}

function updatePropertyPanel() {
  propertyPanel.innerHTML = '';

  if (!selectedShape || selectedShape.hidden) {
    propertyPanel.classList.add('hidden');
    return;
  }

  propertyPanel.classList.remove('hidden');

  const header = document.createElement('div');
  header.className = 'property-panel-header';
  header.textContent = selectedShape.name;
  propertyPanel.appendChild(header);

  if (selectedShape.type === 'line') {
    const length = Math.hypot(selectedShape.x2 - selectedShape.x1, selectedShape.y2 - selectedShape.y1);
    const angle = Math.atan2(selectedShape.y2 - selectedShape.y1, selectedShape.x2 - selectedShape.x1) * 180 / Math.PI;

    const lenField = makeField('Length (mm)', length);
    propertyPanel.appendChild(lenField.label);
    const lenBtn = makeButton('Update Length');
    lenBtn.addEventListener('click', async () => {
      const newLength = parseFloat(lenField.input.value);
      if (isNaN(newLength) || newLength <= 0) return;
      const result = await solveLineLengthAngle(selectedShape.x1, selectedShape.y1, selectedShape.x2, selectedShape.y2, { length: newLength });
      selectedShape.x2 = result.x;
      selectedShape.y2 = result.y;
      updatePropertyPanel();
      drawShapes();
    });
    propertyPanel.appendChild(lenBtn);

    const angleField = makeField('Angle (deg)', angle);
    propertyPanel.appendChild(angleField.label);
    const angleBtn = makeButton('Update Angle');
    angleBtn.addEventListener('click', async () => {
      const newAngle = parseFloat(angleField.input.value);
      if (isNaN(newAngle)) return;
      const result = await solveLineLengthAngle(selectedShape.x1, selectedShape.y1, selectedShape.x2, selectedShape.y2, { angle: newAngle });
      selectedShape.x2 = result.x;
      selectedShape.y2 = result.y;
      updatePropertyPanel();
      drawShapes();
    });
    propertyPanel.appendChild(angleBtn);
    propertyPanel.appendChild(makeDivider());

    const x1 = makeField('Start X', selectedShape.x1);
    const y1 = makeField('Start Y', selectedShape.y1);
    const x2 = makeField('End X', selectedShape.x2);
    const y2 = makeField('End Y', selectedShape.y2);
    [x1, y1, x2, y2].forEach(f => propertyPanel.appendChild(f.label));

    const ptsBtn = makeButton('Update Points');
    ptsBtn.addEventListener('click', () => {
      const vals = [x1, y1, x2, y2].map(f => parseFloat(f.input.value));
      if (vals.some(v => isNaN(v))) return;
      [selectedShape.x1, selectedShape.y1, selectedShape.x2, selectedShape.y2] = vals;
      updatePropertyPanel();
      drawShapes();
    });
    propertyPanel.appendChild(ptsBtn);

  } else if (selectedShape.type === 'rectangle') {
    const xF = makeField('X', selectedShape.x);
    const yF = makeField('Y', selectedShape.y);
    const wF = makeField('Width', selectedShape.width);
    const hF = makeField('Height', selectedShape.height);
    [xF, yF, wF, hF].forEach(f => propertyPanel.appendChild(f.label));

    const btn = makeButton('Update Rectangle');
    btn.addEventListener('click', () => {
      const vals = [xF, yF, wF, hF].map(f => parseFloat(f.input.value));
      if (vals.some(v => isNaN(v))) return;
      [selectedShape.x, selectedShape.y, selectedShape.width, selectedShape.height] = vals;
      updatePropertyPanel();
      drawShapes();
    });
    propertyPanel.appendChild(btn);

  } else if (selectedShape.type === 'circle') {
    const xF = makeField('Center X', selectedShape.x);
    const yF = makeField('Center Y', selectedShape.y);
    const rF = makeField('Radius', selectedShape.radius);
    [xF, yF, rF].forEach(f => propertyPanel.appendChild(f.label));

    const btn = makeButton('Update Circle');
    btn.addEventListener('click', () => {
      const vals = [xF, yF, rF].map(f => parseFloat(f.input.value));
      if (vals.some(v => isNaN(v))) return;
      [selectedShape.x, selectedShape.y, selectedShape.radius] = vals;
      updatePropertyPanel();
      drawShapes();
    });
    propertyPanel.appendChild(btn);

  } else if (selectedShape.type === 'dimension') {
    const geo = computeDimensionGeometry(selectedShape);
    const isEditable = selectedShape.entityA.kind === 'vertex' && selectedShape.entityB.kind === 'vertex';

    const distField = makeField('Distance (mm)', geo ? geo.distance : 0);
    distField.input.disabled = !isEditable;
    propertyPanel.appendChild(distField.label);

    if (isEditable) {
      const btn = makeButton('Update Distance');
      btn.addEventListener('click', async () => {
        const newDist = parseFloat(distField.input.value);
        if (isNaN(newDist) || newDist <= 0) return;

        const pA = getVertexPosition(selectedShape.entityA.shapeId, selectedShape.entityA.vertexIndex);
        const pB = getVertexPosition(selectedShape.entityB.shapeId, selectedShape.entityB.vertexIndex);
        if (!pA || !pB) return;

        const result = await solveLineLength(pA.x, pA.y, pB.x, pB.y, newDist);
        moveVertex(selectedShape.entityB.shapeId, selectedShape.entityB.vertexIndex, result.x, result.y);

        updatePropertyPanel();
        drawShapes();
      });
      propertyPanel.appendChild(btn);
    } else {
      const note = document.createElement('div');
      note.style.fontSize = '10px';
      note.style.color = '#7d7f82';
      note.style.lineHeight = '1.4';
      note.textContent = 'Only point-to-point dimensions can be edited directly.';
      propertyPanel.appendChild(note);
    }
  }
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
      if (shape.hidden && selectedShape === shape) {
        selectedShape = null;
        updatePropertyPanel();
      }
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

// --- Entity system ---
function resolveEntity(ref) {
  const shape = getShapeById(ref.shapeId);
  if (!shape || shape.hidden) return null;

  if (ref.kind === 'vertex') {
    const p = getVertexPosition(ref.shapeId, ref.vertexIndex);
    if (!p) return null;
    return { x1: p.x, y1: p.y, x2: p.x, y2: p.y };
  }

  if (ref.edgeIndex === 'circle') {
    return { x1: shape.x, y1: shape.y, x2: shape.x, y2: shape.y };
  }
  if (shape.type === 'line') {
    return { x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2 };
  }
  if (shape.type === 'rectangle') {
    const corners = [
      { x: shape.x, y: shape.y },
      { x: shape.x + shape.width, y: shape.y },
      { x: shape.x + shape.width, y: shape.y + shape.height },
      { x: shape.x, y: shape.y + shape.height }
    ];
    const a = corners[ref.edgeIndex];
    const b = corners[(ref.edgeIndex + 1) % 4];
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  }
  return null;
}

function getAllEntityRefs() {
  const refs = [];
  for (const shape of shapes) {
    if (shape.hidden) continue;

    if (shape.type === 'line') {
      refs.push({ shapeId: shape.id, kind: 'edge', edgeIndex: 0 });
      refs.push({ shapeId: shape.id, kind: 'vertex', vertexIndex: 0 });
      refs.push({ shapeId: shape.id, kind: 'vertex', vertexIndex: 1 });
    } else if (shape.type === 'rectangle') {
      for (let i = 0; i < 4; i++) refs.push({ shapeId: shape.id, kind: 'edge', edgeIndex: i });
      for (let i = 0; i < 4; i++) refs.push({ shapeId: shape.id, kind: 'vertex', vertexIndex: i });
    } else if (shape.type === 'circle') {
      refs.push({ shapeId: shape.id, kind: 'edge', edgeIndex: 'circle' });
      refs.push({ shapeId: shape.id, kind: 'vertex', vertexIndex: 'center' });
    }
  }
  return refs;
}

function getEntityAt(x, y) {
  let bestVertex = null, bestVertexDist = ENTITY_TOLERANCE;
  let bestEdge = null, bestEdgeDist = ENTITY_TOLERANCE;

  for (const ref of getAllEntityRefs()) {
    const r = resolveEntity(ref);
    if (!r) continue;

    const isPoint = (r.x1 === r.x2 && r.y1 === r.y2);
    const d = isPoint ? Math.hypot(x - r.x1, y - r.y1) : distanceToSegment(x, y, r.x1, r.y1, r.x2, r.y2);

    if (ref.kind === 'vertex') {
      if (d < bestVertexDist) { bestVertexDist = d; bestVertex = ref; }
    } else {
      if (d < bestEdgeDist) { bestEdgeDist = d; bestEdge = ref; }
    }
  }

  return bestVertex || bestEdge;
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
  const A = resolveEntity(dim.entityA);
  const B = resolveEntity(dim.entityB);
  if (!A || !B) return null;

  const { p1, p2, distance } = segmentMinDistance(A, B);

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
  const resolved = resolveEntity(ref);
  if (!resolved) return;

  ctx.setLineDash([]);

  if (ref.kind === 'vertex') {
    const p = worldToScreen(resolved.x1, resolved.y1);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    const a = worldToScreen(resolved.x1, resolved.y1);
    const b = worldToScreen(resolved.x2, resolved.y2);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

function drawHandles() {
  if (activeTool !== 'select') return;
  if (!selectedShape || selectedShape.hidden) return;

  for (const h of getHandlesForShape(selectedShape)) {
    const s = worldToScreen(h.pos.x, h.pos.y);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#e8b04b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawTooltip(x, y, rows) {
  ctx.font = '11px monospace';
  const lineHeight = 15;
  const padding = 6;

  const texts = rows.map(r => `${r.label}${r.value}`);
  let maxWidth = 0;
  for (const t of texts) maxWidth = Math.max(maxWidth, ctx.measureText(t).width);

  const boxWidth = maxWidth + padding * 2;
  const boxHeight = rows.length * lineHeight + padding * 2 - 3;

  ctx.fillStyle = '#26282c';
  ctx.strokeStyle = '#46484c';
  ctx.lineWidth = 1;
  ctx.fillRect(x, y, boxWidth, boxHeight);
  ctx.strokeRect(x, y, boxWidth, boxHeight);

  ctx.textAlign = 'left';
  rows.forEach((r, i) => {
    ctx.fillStyle = r.active ? '#e8b04b' : '#c7c9cc';
    ctx.fillText(`${r.label}${r.value}`, x + padding, y + padding + (i + 1) * lineHeight - 4);
  });
}

function drawLivePreviewAndTooltip(mouseWorldXRaw, mouseWorldYRaw) {
  const mouseWorldX = gridSnapEnabled ? snapToGrid(mouseWorldXRaw) : mouseWorldXRaw;
  const mouseWorldY = gridSnapEnabled ? snapToGrid(mouseWorldYRaw) : mouseWorldYRaw;

  if (activeTool === 'line') {
    let length = Math.hypot(mouseWorldX - drawStartPoint.x, mouseWorldY - drawStartPoint.y);
    let angleDeg = Math.atan2(mouseWorldY - drawStartPoint.y, mouseWorldX - drawStartPoint.x) * 180 / Math.PI;

    if (typedLength !== '') length = parseFloat(typedLength) || 0;
    if (typedAngle !== '') angleDeg = parseFloat(typedAngle) || 0;

    const angleRad = angleDeg * Math.PI / 180;
    const endX = drawStartPoint.x + Math.cos(angleRad) * length;
    const endY = drawStartPoint.y + Math.sin(angleRad) * length;

    ctx.setLineDash(constructionModeEnabled ? [6, 4] : []);
    ctx.strokeStyle = constructionModeEnabled ? '#7a8a99' : '#5b9bd5';
    ctx.lineWidth = 2;
    const p1 = worldToScreen(drawStartPoint.x, drawStartPoint.y);
    const p2 = worldToScreen(endX, endY);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const lengthText = (typedLength !== '' ? typedLength : length.toFixed(1)) + ' mm';
    const angleText = (typedAngle !== '' ? typedAngle : angleDeg.toFixed(1)) + '\u00b0';
    drawTooltip(p2.x + 14, p2.y - 30, [
      { label: 'L: ', value: lengthText, active: activeTypedField === 'length' },
      { label: 'A: ', value: angleText, active: activeTypedField === 'angle' }
    ]);

  } else if (activeTool === 'circle') {
    let radius = Math.hypot(mouseWorldX - drawStartPoint.x, mouseWorldY - drawStartPoint.y);
    if (typedRadius !== '') radius = parseFloat(typedRadius) || 0;

    ctx.setLineDash(constructionModeEnabled ? [6, 4] : []);
    ctx.strokeStyle = constructionModeEnabled ? '#7a8a99' : '#5b9bd5';
    ctx.lineWidth = 2;
    const center = worldToScreen(drawStartPoint.x, drawStartPoint.y);
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius * SCALE, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const radiusText = (typedRadius !== '' ? typedRadius : radius.toFixed(1)) + ' mm';
    drawTooltip(center.x + radius * SCALE + 10, center.y - 18, [
      { label: 'R: ', value: radiusText, active: true }
    ]);

  } else if (activeTool === 'rectangle') {
    const width = mouseWorldX - drawStartPoint.x;
    const height = mouseWorldY - drawStartPoint.y;

    ctx.setLineDash(constructionModeEnabled ? [6, 4] : []);
    ctx.strokeStyle = constructionModeEnabled ? '#7a8a99' : '#5b9bd5';
    ctx.lineWidth = 2;
    const topLeft = worldToScreen(drawStartPoint.x, drawStartPoint.y);
    ctx.strokeRect(topLeft.x, topLeft.y, width * SCALE, height * SCALE);
    ctx.setLineDash([]);

    const p2 = worldToScreen(mouseWorldX, mouseWorldY);
    drawTooltip(p2.x + 12, p2.y - 30, [
      { label: 'W: ', value: Math.abs(width).toFixed(1) + ' mm', active: false },
      { label: 'H: ', value: Math.abs(height).toFixed(1) + ' mm', active: false }
    ]);
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

  drawHandles();

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

  if (activeTool !== 'select') return;

  mouseIsDown = true;
  isMoving = false;
  isMovingDimensionOffset = false;
  isDraggingHandle = false;
  draggingHandleInfo = null;

  const world = getWorldMouse(e);
  startX = world.x;
  startY = world.y;

  const handle = getHandleAt(e.offsetX, e.offsetY);
  if (handle) {
    isDraggingHandle = true;
    draggingHandleInfo = handle;
    return;
  }

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
  lastMouseWorldX = worldPos.x;
  lastMouseWorldY = worldPos.y;
  coordsLabel.textContent = `X: ${worldPos.x.toFixed(1)}  Y: ${worldPos.y.toFixed(1)}`;

  if (isDraggingHandle && draggingHandleInfo) {
    const world = getWorldMouse(e);
    if (selectedShape.type === 'circle' && draggingHandleInfo.vertexIndex === 'radius') {
      selectedShape.radius = Math.hypot(world.x - selectedShape.x, world.y - selectedShape.y);
    } else {
      moveVertex(selectedShape.id, draggingHandleInfo.vertexIndex, world.x, world.y);
    }
    updatePropertyPanel();
    drawShapes();
    return;
  }

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

  if ((activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'line') && drawStartPoint) {
    drawShapes();
    drawLivePreviewAndTooltip(worldPos.x, worldPos.y);
    return;
  }

  if (activeTool !== 'select') {
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
    updatePropertyPanel();
    drawShapes();
  }
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

  if (activeTool === 'dimension') {
    const world = screenToWorld(e.offsetX, e.offsetY);
    if (getDimensionAt(world.x, world.y)) return;

    const entity = getEntityAt(world.x, world.y);
    if (!entity) return;

    if (!dimensionFirstEntity) {
      dimensionFirstEntity = entity;
    } else {
      const isSame = entity.shapeId === dimensionFirstEntity.shapeId
        && entity.kind === dimensionFirstEntity.kind
        && entity.edgeIndex === dimensionFirstEntity.edgeIndex
        && entity.vertexIndex === dimensionFirstEntity.vertexIndex;

      if (!isSame) {
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
    return;
  }

  if (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'line') {
    const raw = screenToWorld(e.offsetX, e.offsetY);
    const world = gridSnapEnabled ? { x: snapToGrid(raw.x), y: snapToGrid(raw.y) } : raw;

    if (!drawStartPoint) {
      drawStartPoint = { x: world.x, y: world.y };
      typedLength = '';
      typedAngle = '';
      typedRadius = '';
      activeTypedField = 'length';
    } else {
      commitShape(world.x, world.y);
    }
    drawShapes();
    return;
  }
});

document.addEventListener('mouseup', (e) => {
  if (isPanning) {
    isPanning = false;
    return;
  }

  if (!mouseIsDown) return;
  mouseIsDown = false;

  if (isDraggingHandle) {
    isDraggingHandle = false;
    draggingHandleInfo = null;
    drawShapes();
    return;
  }

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
    drawStartPoint = null;
    typedLength = '';
    typedAngle = '';
    typedRadius = '';
    drawShapes();
    return;
  }

  if (drawStartPoint && activeTool === 'line') {
    if (e.key === 'Tab') {
      e.preventDefault();
      activeTypedField = activeTypedField === 'length' ? 'angle' : 'length';
      redrawPreview();
      return;
    }
    if (e.key === 'Enter') {
      finalizeDrawFromTyped();
      return;
    }
    if (e.key === 'Backspace') {
      if (activeTypedField === 'length') typedLength = typedLength.slice(0, -1);
      else typedAngle = typedAngle.slice(0, -1);
      redrawPreview();
      return;
    }
    if (/^[0-9.-]$/.test(e.key)) {
      if (activeTypedField === 'length') typedLength += e.key;
      else typedAngle += e.key;
      redrawPreview();
      return;
    }
  }

  if (drawStartPoint && activeTool === 'circle') {
    if (e.key === 'Enter') {
      finalizeDrawFromTyped();
      return;
    }
    if (e.key === 'Backspace') {
      typedRadius = typedRadius.slice(0, -1);
      redrawPreview();
      return;
    }
    if (/^[0-9.-]$/.test(e.key)) {
      typedRadius += e.key;
      redrawPreview();
      return;
    }
  }

  if (e.key === 'Delete' && selectedShape) {
    const index = shapes.indexOf(selectedShape);
    shapes.splice(index, 1);
    selectedShape = null;
    renderModelTree();
    updatePropertyPanel();
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