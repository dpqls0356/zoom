import http from "http";
import dotenv from "dotenv";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import app from "./app.js";
import { connectMongoDB } from "./config/mongodb";
import { Server } from "socket.io";
import registerSocketHandlers from "./sockets/index.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const URL = "http://localhost:";
const httpServer = http.createServer(app);
const io = new Server(httpServer);

// Socket 인증 미들웨어
io.use((socket, next) => {
  try {
    const rawCookie = socket.request.headers.cookie;
    if (!rawCookie) throw new Error("not cookie");

    const cookies = cookie.parse(rawCookie);
    const token = cookies.access_token;

    if (!token) throw new Error("not token");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    console.log(err.name, err.message);
    next(new Error("Socket 인증 실패"));
  }
});

const startServer = async () => {
  try {
    // ✅ 1. MongoDB 연결
    await connectMongoDB();

    // ✅ 2. 모든 준비가 끝난 후 서버 listen
    httpServer.listen(PORT, () => {
      registerSocketHandlers(io);
      console.log(`Listening on ${URL}${PORT}`);
    });
  } catch (err) {
    console.error("Server startup failed:", err);
    process.exit(1);
  }
};

startServer();
