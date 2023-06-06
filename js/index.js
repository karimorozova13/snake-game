const ws = new WebSocket("ws://localhost:8080");

let canvas;
let ctx;
let newPos;
const width = 500;
const height = 500;
const scale = 10;
const snake = [
  { x: 30, y: 10 },
  { x: 20, y: 10 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];
let snakeDir = { x: 10, y: 0 };
let squareY;
let squareX;
let arePlaying = true;
let speed = 100;

let deltaTime;
let oldTimeStamp = 0;
let fps;
let accTime = 0;

ws.onmessage = (event) => {
  const state = JSON.parse(event.data);
  console.log(state);
  snakeDir = state.snakeDir;
};
document.addEventListener("keydown", (e) => {
  const message = JSON.stringify({ direction: e.key });
  ws.send(message);

  ws.onmessage = (event) => {
    ws.send(message);

    const state = JSON.parse(event.data);
    snakeDir = state.snakeDir;
  };
});

function canvasCreation() {
  const _canvas = document.createElement("canvas");
  _canvas.width = width;
  _canvas.height = height;
  _canvas.style.border = "1px solid black";

  document.body.appendChild(_canvas);

  canvas = _canvas;
  ctx = _canvas.getContext("2d");
}

function updateSnake() {
  accTime += deltaTime;
  if (accTime < speed) return;
  accTime -= speed;
  newPos = { ...snake[0] };

  newPos.x += snakeDir.x;
  newPos.y += snakeDir.y;
  if (newPos.y >= height) newPos.y = 0;
  if (newPos.x >= width) newPos.x = 0;
  if (newPos.y < 0) newPos.y = height - scale;
  if (newPos.x < 0) newPos.x = width - scale;

  for (let i = snake.length - 1; i >= 0; i--) {
    if (i !== 0) {
      snake[i] = { ...snake[i - 1] };
    } else {
      snake[0] = newPos;
    }
  }
}

function drawSnake() {
  snake.forEach((el) => {
    ctx.fillRect(el.x, el.y, scale, scale);
  });
}

function makeSquarePos() {
  squareY = Math.floor((Math.random() * width) / scale) * 10 + 10;
  squareX = Math.floor((Math.random() * height) / scale) * 10 + 10;
  // if (snake.some(({ x, y }) => x === squareX && y === squareY)) {
  //   console.log(33);
  //   makeSquarePos();
  // }
}

function drawSquare() {
  ctx.fillRect(squareX, squareY, scale, scale);
}

function catchTheSquare() {
  if (snake[0].x === squareX && snake[0].y === squareY) {
    snake.push({
      x: snake[snake.length - 1].x - 10,
      y: snake[snake.length - 1].y - 10,
    });
    makeSquarePos();
    console.log("where is square");

    speed -= 1;
    return;
  }
}

function makeDeath() {
  if (snake.slice(1).some(({ x, y }) => x === snake[0].x && y === snake[0].y)) {
    arePlaying = false;
    const title = document.createElement("h1");
    title.style.color = "red";
    title.textContent = "YOU LOST!!!";

    document.body.appendChild(title);
  }
}
function main(timeStamp) {
  deltaTime = timeStamp - oldTimeStamp;

  oldTimeStamp = timeStamp;
  fps = Math.round(1 / (deltaTime / 1000));

  if (!arePlaying) return;
  // clear before draw
  ctx.clearRect(0, 0, width, height);
  // Game logic
  updateSnake();
  // Game draw
  drawSnake();
  //   Draw the square
  drawSquare();
  //   Catch the square
  catchTheSquare();
  //   Make the end of a game
  makeDeath();
  //   ctx.font = "12px Arial";
  //   ctx.fillStyle = "black";
  //   ctx.fillText("FPS: " + fps, 10, 15);

  window.requestAnimationFrame(main);
}

window.onload = () => {
  makeSquarePos();
  canvasCreation();
  window.requestAnimationFrame(main);
};
