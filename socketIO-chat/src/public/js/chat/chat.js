import { formatKoreanTime } from "../utils/date.js";
const socket = io();
const backBtn = document.querySelector(".header--chatroom-info .left");
const sendBtn = document.querySelector(".send-btn");
const path = window.location.pathname.split("/");
const roomId = path[path.length - 1];

const connectSocket = async () => {
  socket.on("connect", () => {
    console.log("socket connected:", socket.id);
    socket.emit("chat:join", { roomId });
  });
};
// 메세지 전달 함수
const sendMessage = async (event) => {
  event.preventDefault();

  const text = document.querySelector(".text-input");
  if (!text.value) return;

  socket.emit("chat:send", {
    roomId: roomId,
    message: text.value,
  });
  text.value = "";
};
// 메세지 수신 함수
const receiveMessage = async () => {
  socket.on("chat:receive", (data) => {
    const message = data.message;
    renderMessage(message);
  });
};

//메세지 렌더
const renderMessage = (messages) => {
  const chatList = document.querySelector(".chatting-list");
  const currentUserId = window.CURRENT_USER_ID;
  console.log(messages);
  messages.forEach((message) => {
    const isMe = currentUserId === message.senderId ? true : false;
    const chat = `
    <div class="chat ${isMe ? "chat-me" : "chat-other"}">
      ${
        !isMe
          ? `
            <div class="profile">
              <img src="${message.profileUrl === null ? "/img/user.png" : message.profileUrl}" />
            </div>
          `
          : ""
      }
      <div class="content">
        <div class="message">${message.content}</div>
        <div class="time">${formatKoreanTime(message.createdAt)}</div>
      </div>
    </div>
  `;
    chatList.insertAdjacentHTML("beforeend", chat);
  });
};

//뒤로가기
backBtn.addEventListener("click", () => {
  window.history.back();
});

//메세지 전송
sendBtn.addEventListener("click", sendMessage);

//소켓연결 및 등록
connectSocket();
receiveMessage(); // 연결 후에 등록이 필요
const messages = window.MESSAGES;
console.log("messages : ", messages);
renderMessage(messages);
