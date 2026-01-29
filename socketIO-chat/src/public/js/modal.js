class ConfirmModal {
  //모달을 한 번만 생성해서 계속 재사용하기 위함
  constructor() {
    this.modal = document.querySelector(".checking-modal");
    this.content = this.modal.querySelector(".content");
    this.okBtn = this.modal.querySelector(".ok-btn");
    this.cancelBtn = this.modal.querySelector(".cancel-btn");

    //인 버튼을 눌렀을 때 실행할 콜백 함수 저장소
    this.okHandler = null;

    this.cancelBtn.addEventListener("click", () => this.close());

    this.okBtn.addEventListener("click", () => {
      if (this.okHandler) this.okHandler();
      this.close();
    });
  }

  open({ message, onConfirm }) {
    this.content.textContent = message;
    this.okHandler = onConfirm;
    this.modal.classList.remove("none");
  }

  close() {
    this.modal.classList.add("none");
    this.okHandler = null;
  }
}

export const confirmModal = new ConfirmModal();
