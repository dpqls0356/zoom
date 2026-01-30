const chatRoomList = document.querySelector(".chatroom-list");
const sideBar = document.querySelector(".side-bar");
const createChatRoomBtn = document.querySelector(".create-chat-room");
createChatRoomBtn.addEventListener("click", () => {
  window.location.href = "/chat/create";
});
const openSidebarBtn = document.querySelector(".open-sidebar-btn");
openSidebarBtn.addEventListener("click", () => {
  sideBar.classList.remove("none");
  chatRoomList.classList.add("none");
});
const closeSidebarBtn = document.querySelector(".close-sidebar-btn");
closeSidebarBtn.addEventListener("click", () => {
  sideBar.classList.add("none");
  chatRoomList.classList.remove("none");
});
