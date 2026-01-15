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
