import jwt from "jsonwebtoken";

export default function registerAuthSocket(io, socket) {
  const token = socket.handshake.auth?.token; //브라우저가 io() 연결 시 전달한 토큰

  if (!token) {
    return socket.disconnect(true);
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
  } catch {
    socket.disconnect(true);
  }
}
