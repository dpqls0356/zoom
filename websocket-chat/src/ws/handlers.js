// ws/handlers.js
import { users, nameToSocket } from "./store.js";

export const sendMessage = (data, senderSocket) => {
  const senderName = users.get(senderSocket)?.name;

  for (const socket of users.keys()) {
    if (socket === senderSocket) continue;

    socket.send(
      JSON.stringify({
        type: "message",
        payload: {
          message: data.message,
          name: senderName,
        },
      })
    );
  }
};

export const addUser = (data, socket) => {
  if (nameToSocket.has(data.name)) {
    socket.send(
      JSON.stringify({
        type: "addName_error",
        payload: "중복된 이름입니다.",
      })
    );
    return;
  }

  const prevName = users.get(socket)?.name;
  if (prevName) nameToSocket.delete(prevName);

  users.get(socket).name = data.name;
  nameToSocket.set(data.name, socket);

  socket.send(
    JSON.stringify({
      type: "addName_success",
      payload: data.name,
    })
  );
};
