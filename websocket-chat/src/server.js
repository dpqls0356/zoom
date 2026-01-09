import http from "http";
import app from "./app.js";
import setupWebSocket from "./ws/index.js";
const handleListen = () => console.log(`Listening on http://localhost:3000`);

//http 서버와 ws 서버를 함께 돌림 - 2개가 같은 포트에 존재
// server는 http, ws 2개의 프로토콜을 이해할 수 있음
const server = http.createServer(app); //http 서버
setupWebSocket(server);
server.listen(3000, handleListen);
