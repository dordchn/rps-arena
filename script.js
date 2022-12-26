
const CANVAS_SIZE = 680;
const ITEM_TYPES = {
  ROCK: 0,
  PAPER: 1,
  SCISSORS: 2
};
const ITEM_SPEED = 0.1;
const ITEM_RADIUS = 16;
const ITEMS_COUNT = 30; // Items count of each type

const canvas = document.querySelector('canvas');
let items = [];
let prevLoopTime = Date.now();

let ITEMS_IMG = [];

async function init() {
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

  // load images
  const loadedPromises = ['./assets/rock.png', './assets/paper.png', './assets/scissors.png'].map((path, i) => {
    const loadedPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.src = path;
      ITEMS_IMG[i] = img;
      img.onload = () => resolve();
    });
    return loadedPromise;
  });
  return Promise.all(loadedPromises);
}

function generateItems(count) {
  items = [];
  for (var type of Object.keys(ITEM_TYPES)) {
    for (let j = 0; j < count; j++) {
      const direction = Math.random() * 2 * Math.PI;
      items.push({
        x: ITEM_RADIUS + Math.random() * (CANVAS_SIZE - ITEM_RADIUS * 2),
        y: ITEM_RADIUS + Math.random() * (CANVAS_SIZE - ITEM_RADIUS * 2),
        vx: ITEM_SPEED * Math.sin(direction),
        vy: ITEM_SPEED * Math.cos(direction),
        type: ITEM_TYPES[type],
      });
    }
  }
}

function moveItems(dt) {
  if (dt > 200) return;
  items.forEach(item => {
    const predictedPos = {
      x: item.x + item.vx * dt,
      y: item.y + item.vy * dt,
    }
    if (predictedPos.x < ITEM_RADIUS || predictedPos.x > CANVAS_SIZE - ITEM_RADIUS) item.vx = -item.vx;
    if (predictedPos.y < ITEM_RADIUS || predictedPos.y > CANVAS_SIZE - ITEM_RADIUS) item.vy = -item.vy;

    item.x += item.vx * dt;
    item.y += item.vy * dt;
  });
}

function handleCollisions() {
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const itemA = items[i];
      const itemB = items[j];

      if (itemA.type == itemB.type || !doesCollide(itemA, itemB)) {
        continue;
      }
      if ( // A wins
        (itemA.type == ITEM_TYPES.ROCK && itemB.type == ITEM_TYPES.SCISSORS) ||
        (itemA.type == ITEM_TYPES.PAPER && itemB.type == ITEM_TYPES.ROCK) ||
        (itemA.type == ITEM_TYPES.SCISSORS && itemB.type == ITEM_TYPES.PAPER)
      ) {
        itemB.type = itemA.type;
      } else { // B wins
        itemA.type = itemB.type;
      }
    };
  }
}

function doesCollide(itemA, itemB) {
  return Math.hypot(itemA.x - itemB.x, itemA.y - itemB.y) < ITEM_RADIUS * 2;
}

function render() {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  items.forEach(item => {
    context.drawImage(ITEMS_IMG[item.type], item.x - ITEM_RADIUS, item.y - ITEM_RADIUS, ITEM_RADIUS * 2, ITEM_RADIUS * 2);
  });
}

function mainLoop() {
  const now = Date.now();
  moveItems(now - prevLoopTime);
  handleCollisions();
  render();
  prevLoopTime = now;
  window.requestAnimationFrame(() => mainLoop());
}

(async () => {
  await init();
  generateItems(ITEMS_COUNT);
  prevLoopTime = Date.now();
  mainLoop();
})();
