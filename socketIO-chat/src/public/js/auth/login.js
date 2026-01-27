const loginBtn = document.querySelector("#login-btn");

const login = () => {
  window.location.href = "/auth/kakao";
};
loginBtn.addEventListener("click", login);

///////
const testerLoginBtn = document.querySelector("#login-tester");
const testerLogin = () => {
  window.location.href = "/auth/tester";
};
testerLoginBtn.addEventListener("click", testerLogin);
