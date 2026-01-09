import http from "http";
import { randomUUID } from "crypto";
import { Server } from "socket.io";
import app from "./app.js";
import { cpSync } from "fs";
const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app); //http 서버
const io = new Server(httpServer);

const rooms = new Map();
io.on("connection", (socket) => {
  //이벤트명 출력
  socket.onAny((event) => {
    console.log(`Socket Event : ${event}`);
  });

  // 방 리스트 전달
  socket.on("get_roomlist", (done) => {
    const roomList = Array.from(rooms.values());
    done(roomList);
  });

  //방 생성 -> socket엔 들어가진않음
  socket.on("create_room", ({ roomName }, done) => {
    const roomId = randomUUID();
    rooms.set(roomId, {
      id: roomId,
      name: roomName,
    });
    done({ roomId });
  });
  // 방 입장
  socket.on("enter_room", async ({ roomId }, done) => {
    socket.join(roomId);
    const roomName = rooms.get(roomId).name;
    done({ roomName: roomName });
    io.to(roomId).emit("welcome");
    const sockets = await io.in(roomId).allSockets();
    console.log("방 인원:", sockets.size);
    console.log("socket ids:", [...sockets]);
  });

  socket.on("sendMessageToServer", ({ roomId, message }, done) => {
    socket.to(roomId).emit("sendMessageToUser", { message });
    done();
  });

  socket.on("exit_pre", ({ roomId }, done) => {
    socket.to(roomId).emit("bye");
    done();
  });
  socket.on("exit", async ({ roomId }, done) => {
    socket.leave(roomId);
    const sockets = await io.in(roomId).allSockets();
    console.log("방 인원:", sockets.size);
    console.log("socket ids:", [...sockets]);
    done();
  });
});

httpServer.listen(3000, handleListen);
