const canvas = document.getElementById('viewport');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext('2d');

let activeTool = 'rectangle';

const rectBtn = document.getElementById('rect-tool');
const circleBtn = document.getElementById('circle-tool');

rectBtn.addEventListener('click', () => {
  activeTool = 'rectangle';
  rectBtn.classList.add('active');
  circleBtn.classList.remove('active');
});

circleBtn.addEventListener('click', () => {
  activeTool = 'circle';
  circleBtn.classList.add('active');
  rectBtn.classList.remove('active');
});

let mouseIsDown = false;
let isDrawing = false;
let isMoving = false;
let startX, startY;
let currentX, currentY;
let moveOffsetX, moveOffsetY;

const DRAG_THRESHOLD = 4;

const shapes = [];
let selectedShape = null;

function drawShapes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const shape of shapes) {
    ctx.strokeStyle = (shape === selectedShape) ? '#e8b04b' : '#5b9bd5';
    ctx.lineWidth = 2;

    if (shape.type === 'rectangle') {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === 'circle') {
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function getShapeAt(x, y) {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];

    if (shape.type === 'rectangle') {
      const left = Math.min(shape.x, shape.x + shape.width);
      const right = Math.max(shape.x, shape.x + shape.width);
      const top = Math.min(shape.y, shape.y + shape.height);
      const bottom = Math.max(shape.y, shape.y + shape.height);

      if (x >= left && x <= right && y >= top && y <= bottom) {
        return shape;
      }
    } else if (shape.type === 'circle') {
      const distance = Math.hypot(x - shape.x, y - shape.y);
      if (distance <= shape.radius) {
        return shape;
      }
    }
  }
  return null;
}

canvas.addEventListener('mousedown', (e) => {
  mouseIsDown = true;
  isDrawing = false;
  isMoving = false;
  startX = e.offsetX;
  startY = e.offsetY;

  if (selectedShape) {
    const hit = getShapeAt(startX, startY);
    if (hit === selectedShape) {
      isMoving = true;
      moveOffsetX = startX - selectedShape.x;
      moveOffsetY = startY - selectedShape.y;
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!mouseIsDown) return;

  currentX = e.offsetX;
  currentY = e.offsetY;

  const dragDistance = Math.hypot(currentX - startX, currentY - startY);

  if (isMoving) {
    selectedShape.x = currentX - moveOffsetX;
    selectedShape.y = currentY - moveOffsetY;
    drawShapes();
    return;
  }

  if (!isDrawing && dragDistance > DRAG_THRESHOLD) {
    isDrawing = true;
    selectedShape = null;
  }

  if (!isDrawing) return;

  drawShapes();

  ctx.strokeStyle = '#5b9bd5';
  ctx.lineWidth = 2;

  if (activeTool === 'rectangle') {
    const width = currentX - startX;
    const height = currentY - startY;
    ctx.strokeRect(startX, startY, width, height);
  } else if (activeTool === 'circle') {
    const radius = Math.hypot(currentX - startX, currentY - startY);
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
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
    }

    isDrawing = false;
    drawShapes();
    return;
  }

  selectedShape = getShapeAt(startX, startY);
  drawShapes();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Delete' && selectedShape) {
    const index = shapes.indexOf(selectedShape);
    shapes.splice(index, 1);
    selectedShape = null;
    drawShapes();
  }
});

