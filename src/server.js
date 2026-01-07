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

//connection이 작동되면 함수가 실행되고 이 떄 sockect[백엔드에 연결된 사람의 정보를 담음]을 리턴받음
wss.on("connection", (socket) => {
  console.log("Connected from the browser");
  socket.send("Hi User!");
  socket.on("close", () => {
    console.log("Disconnected from the browser😭");
  });
  socket.on("message", (message) => {
    console.log("New Message : ", message.toString("utf8"));
  });
});
