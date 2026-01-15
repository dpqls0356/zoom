const joinedBtn = document.querySelector(".joined");
const availableBtn = document.querySelector(".available");
const toggleDot = document.querySelector(".toggle-dot");
joinedBtn.addEventListener("click", () => {
  availableBtn.classList.remove("focus");
  joinedBtn.classList.add("focus");
  moveDot(joinedBtn);
});
availableBtn.addEventListener("click", () => {
  availableBtn.classList.add("focus");
  joinedBtn.classList.remove("focus");
  moveDot(availableBtn);
});

function moveDot(target) {
  //화면상 위치와 크기 정보를 가진 객체
  //rect.left → 브라우저 창 왼쪽에서 버튼 왼쪽까지 거리
  const rect = target.getBoundingClientRect();
  //부모 요소(.toggle-text) 위치와 크기
  const parentRect = target.parentElement.getBoundingClientRect();

  // 글자 중앙 위치 계산
  // gpt는 역시 연산은 못하는 듯 ... 내가 하는게 빠르다 ..
  // const leftPos = rect.left - parentRect.left + rect.width / 2 - toggleDot.offsetWidth / 2;
  const leftPos = rect.left + rect.width / 2 - toggleDot.offsetWidth / 2;

  toggleDot.style.left = `${leftPos}px`;
  // console.log(
  //   "rect.left",
  //   rect.left,
  //   " parentRect.left:",
  //   parentRect.left,
  //   " rect.width :",
  //   rect.width,
  //   " toggleDot.offsetWidth :",
  //   toggleDot.offsetWidth
  // );
  // console.log(leftPos);
}

// 초기 위치: Joined 글자 중앙
moveDot(joinedBtn);
