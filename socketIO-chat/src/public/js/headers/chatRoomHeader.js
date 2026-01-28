const backBtn = document.querySelector(".header--chatroom-info .left");
//뒤로가기
backBtn.addEventListener("click", () => {
  const prevPage = sessionStorage.getItem("prevPage");
  alert(prevPage === "/chat/create");
  if (prevPage === "/chat/create") {
    window.location.href = `http://localhost:3000/chat/list`;
    return;
  }
  window.location.href = `http://localhost:3000${prevPage}`;
});
