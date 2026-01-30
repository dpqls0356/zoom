class ConfirmModal {
  //모달을 한 번만 생성해서 계속 재사용하기 위함
  constructor() {
    this.modal = document.querySelector(".default-modal");
    this.content = this.modal.querySelector(".content");
    this.rightBtn = this.modal.querySelector(".right-btn");
    this.leftBtn = this.modal.querySelector(".left-btn");

    //인 버튼을 눌렀을 때 실행할 콜백 함수 저장소
    this.leftBtnHandler = null;
    this.rightBtnHandler = null;

    this.rightBtn.addEventListener("click", () => this.rightBtnHandler());

    this.leftBtn.addEventListener("click", () => {
      this.leftBtnHandler();
    });
  }

  open({ message, leftConfirm, rightConfirm, leftBtnText, rightBtnText }) {
    this.content.textContent = message;
    this.leftBtnHandler = leftConfirm;
    this.rightBtnHandler = rightConfirm;
    this.modal.classList.remove("none");
    this.leftBtn.textContent = leftBtnText;
    this.rightBtn.textContent = rightBtnText;
  }
  close() {
    this.modal.classList.add("none");
  }
}

export const confirmModal = new ConfirmModal();
