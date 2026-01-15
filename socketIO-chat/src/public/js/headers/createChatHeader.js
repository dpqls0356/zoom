const header = document.querySelector(".header__title");
header.innerHTML = "create Room";

const closeBtn = document.querySelector(".closeBtn");
closeBtn.addEventListener("click", () => {
  window.location.href = "/list";
});
