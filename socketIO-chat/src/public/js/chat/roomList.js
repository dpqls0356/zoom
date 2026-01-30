const axios = window.axios;

const joinedBtn = document.querySelector(".joined");
const availableBtn = document.querySelector(".available");
const toggleDot = document.querySelector(".toggle-dot");
const searchInput = document.querySelector(".chatroom-serch input");
const JOINED = "joined";
const AVAILABLE = "available";

// 검색어가 바뀔 때 검색어에 맞는 방 리스트 보여주기
searchInput.addEventListener("change", () => {});

// tab을 클릭한 경우 탭의 종류에 맞게 데이터 로드
joinedBtn.addEventListener("click", async () => {
  availableBtn.classList.remove("focus");
  joinedBtn.classList.add("focus");
  moveDot(joinedBtn);
  try {
    const rooms = await getRoomList(JOINED);
  } catch (e) {
    console.log("error : ", e);
  }
});
availableBtn.addEventListener("click", async () => {
  availableBtn.classList.add("focus");
  joinedBtn.classList.remove("focus");
  moveDot(availableBtn);
  try {
    const rooms = await getRoomList(AVAILABLE);
  } catch (e) {
    console.log("error : ", e);
  }
});

// dot 움직이게 하는 함수
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
}

const getRoomList = async (type) => {
  const reponse = await axios.get(
    `/chat/search_room?searchWord=${searchInput.value}&type=${type}`,
  );
  renderRooms(reponse.data.rooms, type);
};

function renderRooms(rooms, type) {
  const emptybox = document.querySelector(".empty");
  const roomList = document.querySelector(".room-list");
  if (rooms.length === 0) {
    emptybox.classList.remove("none");
    roomList.classList.add("none");
    if (type === JOINED) {
      emptybox.innerHTML = "<div class='empty'>참여한 채팅방이 없습니다.</div>";
    } else {
      emptybox.innerHTML =
        "<div class='empty'>참여할 수 있는 채팅방이 없습니다.</div>";
    }
    return;
  }
  emptybox.classList.add("none");
  roomList.classList.remove("none");
  roomList.innerHTML = rooms.map((room) => roomTemplate(room, type)).join("");

  const els = document.querySelectorAll(".room-content");
  els.forEach((el) => {
    el.addEventListener("click", (event) => {
      // 클릭된 요소가 어디든 상관없이
      const roomContent = event.target.closest(".room-content");

      // room-content 바깥을 눌렀으면 무시
      if (!roomContent || !roomList.contains(roomContent)) return;

      const roomId = roomContent.dataset.id;
      if (!roomId) return;

      window.location.href = `/chat/${roomId}`;
    });
  });
}

function roomTemplate(room, type) {
  return `
      <div class="room-content" data-id="${room.id}" >
        <div class="img">
            <img src="${room.profile_url}" />
        </div>
        <div class="roomlist-roominfo header">
            <div class="name">${room.room_name}</div>
            <div class="person">
                <span>${room._count.participants} / ${room.max_users}</span>
            </div>
        </div>
        <div class="not-read-dot"></div>
        <div class="message bottom">안녕하세요</div>
        <div class="time bottom">12:53</div>
    </div>
  `;
}

// 초기 위치: Joined 글자 중앙
moveDot(joinedBtn);
try {
  getRoomList(JOINED);
} catch (e) {
  console.log("error: ", error);
}
