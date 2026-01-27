import registerRoomSocket from "./room.socket.js";

export default function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("connection");
    registerRoomSocket(io, socket); // 채팅방 이벤트 처리
  });
}
