import registerRoomSocket from "./room.socket.js";
import registerAuthSocket from "./auth.socket.js";

export default function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    registerAuthSocket(io, socket); // 인증처리
    registerRoomSocket(io, socket); // 채팅방 이벤트 처리
  });
}
