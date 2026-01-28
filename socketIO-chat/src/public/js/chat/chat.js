import { formatKoreanTime } from "../utils/date.js";
const socket = io();

const sendBtn = document.querySelector(".send-btn");
const path = window.location.pathname.split("/");
const roomId = path[path.length - 1];

const connectSocket = async () => {
  socket.on("connect", () => {
    console.log("enter type: ", window.NEW_JOIN ? "new" : "not new");
    if (window.NEW_JOIN) {
      socket.emit("chat:new-join", { roomId });
    }
    socket.emit("chat:join", { roomId });
  });
};
// 메세지 전달 함수
const sendMessage = async () => {
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
  socket.on("chat:new-user", (data) => {
    console.log("new-user:", data);
    renderMessage([data]);
  });
};

//메세지 렌더
const renderMessage = (messages) => {
  const chatList = document.querySelector(".chatting-list");
  const currentUserId = window.CURRENT_USER_ID;
  messages.forEach((message) => {
    if (message.type === "SYSTEM") {
      const chat = `
        <div class="enterAlarm">
          <div class="message">${message.content}</div>
        </div>
    `;
      chatList.insertAdjacentHTML("beforeend", chat);
    } else {
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
    }
  });
};

//메세지 전송
sendBtn.addEventListener("click", sendMessage);
document.querySelector(".chat-form").addEventListener("keydown", (e) => {
  if (e.isComposing) return; // 한글 조합 중이면 무시

  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

//소켓연결 및 등록
connectSocket();
receiveMessage(); // 연결 후에 등록이 필요
const messages = window.MESSAGES;
renderMessage(messages);
