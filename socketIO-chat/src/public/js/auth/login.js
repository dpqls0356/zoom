const loginBtn = document.querySelector("#login-btn");

const login = () => {
  window.location.href = "/auth/kakao";
};
loginBtn.addEventListener("click", login);
