const header = document.querySelector(".header__title");
header.innerHTML = "Create Room";

const closeBtn = document.querySelector(".closeBtn");
closeBtn.addEventListener("click", () => {
  window.location.href = "/chat/list";
});

const createChatRoomBtn = document.querySelector(".right div");
const createChatRoomForm = document.querySelector(".create-chatroom");
createChatRoomBtn.addEventListener("click", () => {
  createChatRoomForm.requestSubmit();
});
