import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import { connectMongoDB } from "./config/mongodb";

dotenv.config();

const PORT = process.env.PORT || 3000;
const URL = "http://localhost:";
const httpServer = http.createServer(app);
const startServer = async () => {
  try {
    // ✅ 1. MongoDB 연결
    await connectMongoDB();

    // ✅ 2. 모든 준비가 끝난 후 서버 listen
    httpServer.listen(PORT, () => {
      console.log(`Listening on ${URL}${PORT}`);
    });
  } catch (err) {
    console.error("Server startup failed:", err);
    process.exit(1);
  }
};

startServer();
