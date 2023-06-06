const http = require("http");
const WebSocket = require("ws");

// Create a HTTP server
const server = http.createServer();
const wss = new WebSocket.Server({ server });
const clients = new Set();

const clientsState = {};
function generateClientId() {
  return Math.random().toString(36).substr(2, 9);
}
wss.on("connection", (wss) => {
  const clientId = generateClientId();
  clientsState[clientId] = {
    id: clientId,
    snakeDir: { x: 10, y: 0 },
    snakeCoord: [
      { x: 30, y: 10 },
      { x: 20, y: 10 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ],
  };
  clients.add(wss);
  const message = JSON.stringify({
    type: "setup",
    id: clientId,
    clients: clientsState,
  });
  wss.send(message);
  wss.on("message", (message) => {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === "changeDir") {
      const { direction } = parsedMessage;
      if (direction === "ArrowDown") {
        clientsState[clientId].snakeDir = { x: 0, y: 10 };
      } else if (direction === "ArrowRight") {
        clientsState[clientId].snakeDir = { x: 10, y: 0 };
      } else if (direction === "ArrowUp") {
        clientsState[clientId].snakeDir = { x: 0, y: -10 };
      } else if (direction === "ArrowLeft") {
        clientsState[clientId].snakeDir = { x: -10, y: 0 };
      }
    } else if (parsedMessage.type === "syncSnake") {
      const { snakeCoord } = parsedMessage;
      clientsState[clientId].snakeCoord = snakeCoord;
    }
    broadcastState();
  });

  wss.on("close", () => {
    delete clientsState[clientId];
    clients.delete(wss);
    broadcastState();
  });
  function broadcastState() {
    clients.forEach((client) => {
      client.send(
        JSON.stringify({
          type: "sync",
          clients: clientsState,
        })
      );
    });
  }
});

function updateSnake() {
  accTime += deltaTime;
  if (accTime < speed) return;
  accTime -= speed;
  newPos = { ...snake.snakeDir[0] };

  newPos.x += snake.snakeDir.x;
  newPos.y += snake.snakeDir.y;
  if (newPos.y >= height) newPos.y = 0;
  if (newPos.x >= width) newPos.x = 0;
  if (newPos.y < 0) newPos.y = height - scale;
  if (newPos.x < 0) newPos.x = width - scale;

  for (let i = snake.snakeDir.length - 1; i >= 0; i--) {
    if (i !== 0) {
      snake.snakeDir[i] = { ...snake.snakeDir[i - 1] };
    } else {
      snake.snakeDir[0] = newPos;
    }
  }
}

// Start the HTTP server on port 8080
server.listen(8080, () => {
  console.log("WebSocket server is listening on port 8080");
});
