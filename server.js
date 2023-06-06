const http = require("http");
const WebSocket = require("ws");

// Create a HTTP server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

const clientsState = [];
function generateClientId() {
  return Math.random().toString(36).substr(2, 9);
}

wss.on("connection", (wss) => {
  const clientId = generateClientId();
  clientsState[clientId] = {
    id: clientId,
    snakeDir: { x: 10, y: 0 },
  };

  wss.send(JSON.stringify(clientsState[clientId]));

  wss.on("message", (message) => {
    const parsedMessage = JSON.parse(message);
    const { direction } = parsedMessage;

    if (direction === "ArrowDown") {
      if (clientsState[clientId].snakeDir.y === 0)
        clientsState[clientId].snakeDir = { x: 0, y: 10 };
      wss.send(JSON.stringify(clientsState[clientId]));
    } else if (direction === "ArrowRight") {
      if (clientsState[clientId].snakeDir.x === 0)
        clientsState[clientId].snakeDir = { x: 10, y: 0 };
      wss.send(JSON.stringify(clientsState[clientId]));
    } else if (direction === "ArrowUp") {
      if (clientsState[clientId].snakeDir.y === 0)
        clientsState[clientId].snakeDir = { x: 0, y: -10 };
      wss.send(JSON.stringify(clientsState[clientId]));
    } else if (direction === "ArrowLeft") {
      if (clientsState[clientId].snakeDir.x === 0)
        clientsState[clientId].snakeDir = { x: -10, y: 0 };
      wss.send(JSON.stringify(clientsState[clientId]));
    }
  });

  wss.on("close", () => {
    delete clientsState[clientId];
  });
});

// Start the HTTP server on port 8080
server.listen(8080, () => {
  console.log("WebSocket server is listening on port 8080");
});
