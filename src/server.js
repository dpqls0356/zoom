import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
// app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

//http 서버와 ws 서버를 함께 돌림 - 2개가 같은 포트에 존재
// server는 http, ws 2개의 프로토콜을 이해할 수 있음
const server = http.createServer(app); //http 서버
const wss = new WebSocket.Server({ server }); //http서버 위에 ws 서버를 올림
server.listen(3000, handleListen);

const users = new Map(); // 연결된 소켓 정보
const nameToSocket = new Map(); // 이름으로 소켓 검색 시 사용

const sendMessage = (data, senderSocket) => {
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
const addUser = (data, socket) => {
  if (nameToSocket.has(data.name)) {
    socket.send(
      JSON.stringify({
        type: "addName_error",
        payload: "중복된 이름입니다.",
      })
    );
  }
  const prevName = users.get(socket)?.name;
  if (prevName) {
    nameToSocket.delete(prevName);
  }

  users.get(socket).name = data.name;
  nameToSocket.set(data.name, socket);

  socket.send(
    JSON.stringify({
      type: "addName_success",
      payload: users.get(socket).name,
    })
  );
};

//connection이 작동되면 함수가 실행되고 이 떄 sockect[백엔드에 연결된 사람의 정보를 담음]을 리턴받음
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
