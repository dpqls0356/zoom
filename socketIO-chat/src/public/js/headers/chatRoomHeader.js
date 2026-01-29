const backBtn = document.querySelector(".header--chatroom-info .left");
const sideOpenBtn = document.querySelector(".header--chatroom-info .right");

//뒤로가기
backBtn.addEventListener("click", () => {
  const prevPage = sessionStorage.getItem("prevPage");
  if (prevPage === "/chat/create") {
    window.location.href = `http://localhost:3000/chat/list`;
    return;
  }
  window.history.back();
});
sideOpenBtn.addEventListener("click", () => {
  document.querySelector(".chat-room").classList.add("none");
  document.querySelector(".room-side").classList.remove("none");
});
