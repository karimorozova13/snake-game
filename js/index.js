const ws = new WebSocket("ws://localhost:8080");

let canvas;
let ctx;
let newPos;
const width = 500;
const height = 500;
const scale = 10;

let squareY;
let squareX;
let arePlaying = true;
let speed = 100;

let deltaTime;
let oldTimeStamp = 0;
let fps;
let accTime = 0;

let snakes = {};
let snake = {
  snakeDir: { x: 10, y: 0 },
  snakeCoord: [
    { x: 30, y: 10 },
    { x: 20, y: 10 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ],
};

ws.onmessage = (event) => {
  const state = JSON.parse(event.data);
  if (state.type === "setup") {
    snake.id = state.id;
    snakes = state.clients;
  } else if (state.type === "sync") {
    snakes = state.clients;
    snake = state.clients[snake.id];
  }
};
document.addEventListener("keydown", (e) => {
  const message = JSON.stringify({ type: "changeDir", direction: e.key });
  ws.send(message);
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
  if (!snake) return;
  accTime -= speed;
  newPos = {
    ...snake.snakeCoord[0],
  };

  newPos.x += snake.snakeDir.x;
  newPos.y += snake.snakeDir.y;
  if (newPos.y >= height) newPos.y = 0;
  if (newPos.x >= width) newPos.x = 0;
  if (newPos.y < 0) newPos.y = height - scale;
  if (newPos.x < 0) newPos.x = width - scale;

  for (let i = snake.snakeCoord.length - 1; i >= 0; i--) {
    if (i !== 0) {
      snake.snakeCoord[i] = { ...snake.snakeCoord[i - 1] };
    } else {
      snake.snakeCoord[0] = newPos;
    }
  }
  ws.send(
    JSON.stringify({
      type: "syncSnake",
      snakeCoord: snake.snakeCoord,
    })
  );
}

function drawSnake() {
  for (const snakeId in snakes) {
    snakes[snakeId].snakeCoord.forEach((el) => {
      ctx.fillRect(el.x, el.y, scale, scale);
    });
  }
}

function makeSquarePos() {
  squareY = Math.floor((Math.random() * width) / scale) * 10 + 10;
  squareX = Math.floor((Math.random() * height) / scale) * 10 + 10;
}

function drawSquare() {
  ctx.fillRect(squareX, squareY, scale, scale);
}

function catchTheSquare() {
  if (snake.snakeCoord[0].x === squareX && snake.snakeCoord[0].y === squareY) {
    snake.snakeCoord.push({
      x: snake.snakeCoord[snake.snakeCoord.length - 1].x - 10,
      y: snake.snakeCoord[snake.snakeCoord.length - 1].y - 10,
    });
    ws.send(
      JSON.stringify({
        type: "syncSnake",
        snakeCoord: snake.snakeCoord,
      })
    );
    makeSquarePos();

    speed -= 1;
    return;
  }
}

function makeDeath() {
  if (
    snake.snakeCoord
      .slice(1)
      .some(
        ({ x, y }) => x === snake.snakeCoord[0].x && y === snake.snakeCoord[0].y
      )
  ) {
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
  // connectWebSocket();
};
