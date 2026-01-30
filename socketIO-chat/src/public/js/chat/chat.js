import { formatKoreanTime } from "../utils/date.js";
import { confirmModal } from "../modal.js";
const socket = io();

const sendBtn = document.querySelector(".send-btn");
const path = window.location.pathname.split("/");
const roomId = path[path.length - 1];
const chatForm = document.querySelector(".chat-form");
let isRoomDeleted = false;

const isAtBottom = (el) => {
  // scrollHeight : 전체 스크롤 가능한 높이 (보이지 않는 영역 포함)
  // scrollTop    : 현재 스크롤이 위에서 얼마나 내려와 있는지
  // clientHeight : 화면에 실제로 보이는 영역 높이

  // (전체 높이 - 현재 스크롤 위치) <= (보이는 영역 + 여유값)
  // → 현재 스크롤이 거의 맨 아래에 있다면 true
  return el.scrollHeight - el.scrollTop <= el.clientHeight + 20;
};
const lockChat = () => {
  isRoomDeleted = true;
  sendBtn.disabled = true;
  chatForm.disabled = true;
  document.querySelector(".text-input").disabled = true;
};

//소켓 연결
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
    //참가자 정보 다시 불러오기
  });
  socket.on("leave-room", (data) => {
    console.log("leave-user: ", data);
    renderMessage([data]);
    if (data.userId === currentUserId) window.location.href = "/chat/list";
  });
  socket.on("success-delete-room", (data) => {
    if (data.userId === currentUserId) window.location.href = "/chat/list";
    else if (window.location.pathname === `/chat/${data.roomId}`) {
      lockChat();

      confirmModal.open({
        message: "채팅방이 삭제되었습니다.",
        rightConfirm: () => {
          socket.emit("leave-room", { roomId });
        },
        leftConfirm: () => {
          chatForm.confirmModal.close();
        },
        leftBtnText: "닫기",
        rightBtnText: "나가기",
      });
    }
  });
};

//메세지 렌더
const renderMessage = (messages) => {
  const chatList = document.querySelector(".chatting-list");
  const shouldScroll = isAtBottom(chatList);
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
  if (shouldScroll) {
    chatList.scrollTop = chatList.scrollHeight;
  }
};

//메세지 전송
sendBtn.addEventListener("click", () => {
  if (isRoomDeleted) {
    e.preventDefault();
    return;
  }
  sendMessage();
});
chatForm.addEventListener("keydown", (e) => {
  if (isRoomDeleted) return;
  if (e.isComposing) return; // 한글 조합 중이면 무시

  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

//사이드바 열기
const closeSideBtn = document.querySelector(".close-side");
closeSideBtn.addEventListener("click", () => {
  console.log("click");
  document.querySelector(".chat-room").classList.remove("none");
  document.querySelector(".room-side").classList.add("none");
});

//채팅방 나가기 관련 이벤트
const exitBtn = document.querySelector(".exit-btn");
if (exitBtn) {
  exitBtn.addEventListener("click", () => {
    confirmModal.open({
      message: "채팅방을 나가시겠습니까?",
      rightConfirm: () => {
        socket.emit("leave-room", {
          roomId,
        });
      },
      leftConfirm: () => {
        confirmModal.close();
      },
      leftBtnText: "취소",
      rightBtnText: "확인",
    });
  });
}
const deleteBtn = document.querySelector(".delete-btn");
if (deleteBtn) {
  deleteBtn.addEventListener("click", () => {
    confirmModal.open({
      message: "채팅방을 삭제하겠습니까?",
      rightConfirm: () => {
        socket.emit("delete-room", {
          roomId,
        });
      },
      leftConfirm: () => {
        confirmModal.close();
      },
      leftBtnText: "취소",
      rightBtnText: "삭제",
    });
  });
}
console.log(window.STATUS);
const messages = window.MESSAGES;
const currentUserId = window.CURRENT_USER_ID;

//소켓연결 및 등록
connectSocket();
receiveMessage(); // 연결 후에 등록이 필요
renderMessage(messages);

if (window.STATUS === 410) {
  //모달 띄우기
  lockChat();

  confirmModal.open({
    message: "삭제된 채팅방입니다.",
    rightConfirm: () => {
      socket.emit("leave-room", { roomId });
    },
    leftConfirm: () => {
      confirmModal.close();
    },
    leftBtnText: "닫기",
    rightBtnText: "나가기",
  });
  //input disable하게 바꾸기
}
