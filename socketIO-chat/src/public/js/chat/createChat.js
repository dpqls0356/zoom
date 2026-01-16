///selector
const select = document.querySelector(".chatroom-select");
const trigger = select.querySelector(".chatroom-select__trigger");
const options = select.querySelectorAll(".chatroom-select__option");
const hiddenInput = document.getElementById("maxPerson");
const selectList = select.querySelector(".chatroom-select__list");

trigger.addEventListener("click", () => {
  selectList.classList.toggle("is-close");
});
options.forEach((option) => {
  option.addEventListener("click", () => {
    const value = option.dataset.value;

    trigger.textContent = value;
    hiddenInput.value = value;
    selectList.classList.add("is-close");
  });
});

document.addEventListener("click", (e) => {
  if (!select.contains(e.target)) {
    selectList.classList.add("is-close");
  }
});

//image 미리보기
// 이미지 미리보기는 File 객체를 Blob URL로 변환해
// 서버 업로드 없이 클라이언트에서 즉시 렌더링하도록 구현

//HTML이 전부 로드된 후 JS 실행
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("room_profile_url");
  const previewImage = document.querySelector(".preview-image");

  if (!fileInput || !previewImage) return;

  fileInput.addEventListener("change", (e) => {
    //파일 불러오기 -> 여러 파일을 골라도 첫번째 이미지만 가져온다.
    const file = e.target.files[0];

    if (!file) return;

    // 이미지 파일인지 체크 (안전)
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 선택할 수 있습니다.");
      fileInput.value = "";
      return;
    }

    // 브라우저가 메모리에 임시 URL 생성
    const imageUrl = URL.createObjectURL(file);

    // 미리보기 반영
    previewImage.src = imageUrl;

    // 메모리 누수 방지 -> Blob URL은 메모리 사용하기에 이미지 로딩이 끝나면 해제시킴
    previewImage.onload = () => {
      URL.revokeObjectURL(imageUrl);
    };
  });
});

// from 검증
const form = document.querySelector(".create-chatroom");
const maxInput = document.getElementById("maxPerson");
const fileInput = document.getElementById("room_profile_url");
form.addEventListener("submit", (e) => {
  const value = Number(maxInput.value);

  if (!Number.isInteger(value) || value < 2 || value > 50) {
    e.preventDefault();
    alert("참여 인원은 2~50 사이의 숫자를 선택해주세요.");
    return;
  }
  if (!fileInput.files || fileInput.files.length === 0) {
    // name 제거 → 서버로 안 감
    fileInput.removeAttribute("name");
  }
});
