const socket = io();

const chatTitle = document.querySelector("#chat_title");
const chatArea = document.querySelector("#room");
const chatList = chatArea.querySelector("#chat_list");
const chatForm = chatArea.querySelector("form");
const roomExitPopup = document.querySelector("#exit_popup");
const openPopup = document.querySelector("#exit_popup_open_btn");

const roomId = location.pathname.split("/").pop();
socket.emit("enter_room", { roomId }, ({ roomName }) => {
  chatTitle.innerHTML = roomName;
});

openPopup.addEventListener("click", () => {
  roomExitPopup.style.display = "block";
});

//나가기 취소
document.querySelector("#cancle_btn").addEventListener("click", () => {
  roomExitPopup.style.display = "none";
});
//나가기
document.querySelector("#exit_btn").addEventListener("click", () => {
  socket.emit("exit_pre", { roomId }, () => {
    socket.emit("exit", { roomId }, () => {
      window.location.href = "/";
    });
  });
});

// 메세지 전송
const addMessage = (msg) => {
  const li = document.createElement("li");
  li.innerHTML = msg;
  chatList.appendChild(li);
};
const sendMessage = (event) => {
  event.preventDefault();
  const message = chatForm.querySelector("input").value;
  chatForm.querySelector("input").value = "";
  if (!message) return;

  socket.emit("sendMessageToServer", { roomId, message }, () => {
    const li = document.createElement("li");
    li.innerHTML = "나: " + message;
    chatList.appendChild(li);
  });
};
chatForm.addEventListener("submit", sendMessage);

// 누군가 들어온 경우
socket.on("welcome", () => {
  const div = document.createElement("div");
  div.innerHTML = "입장하셨습니다.";
  chatList.appendChild(div);
});
socket.on("sendMessageToUser", ({ message }) => {
  addMessage(`상대방: ${message}`);
});
socket.on("bye", () => {
  addMessage("참가자가 떠났습니다.");
});
