const view = document.querySelector(".main_layout");
const resizeAlarm = document.querySelector(".resize_alarm");
const layoutBlock = document.querySelector(".layout_block");

const MIN_WIDTH = 360;
const MAX_WIDTH = 510;

const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const width = entry.contentRect.width;
    if (width < MIN_WIDTH || width > MAX_WIDTH) {
      resizeAlarm.style.display = "flex";
      layoutBlock.style.display = "none";
      resizeAlarm.querySelector("span").innerHTML =
        width < MIN_WIDTH
          ? "화면 사이즈를 키워주세요"
          : "화면 사이즈를 줄여주세요";
    } else {
      resizeAlarm.style.display = "none";
      layoutBlock.style.display = "flex";
    }
  }
});

observer.observe(view);
