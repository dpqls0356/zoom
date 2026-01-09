import WebSocket from "ws";
import { users, nameToSocket } from "./store.js";
import { addUser, sendMessage } from "./handlers.js";

export default function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (socket) => {
    users.set(socket, { name: null });
    console.log("Connected from the browser");

    socket.on("close", () => {
      const name = users.get(socket)?.name;
      if (name) nameToSocket.delete(name);
      users.delete(socket);
      console.log("Disconnected from the browser😭");
    });

    socket.on("message", (data) => {
      const parsedData = JSON.parse(data.toString("utf8"));

      switch (parsedData.type) {
        case "name":
          addUser(parsedData, socket);
          break;
        case "message":
          sendMessage(parsedData, socket);
          break;
      }
    });
  });
}
