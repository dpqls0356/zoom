const socket = io();
const welcome = document.querySelector("#createRoom");
const form = welcome.querySelector("form");
const roomList = document.querySelector("#roomList");
const refreshBtn = document.querySelector("#refreshBtn");
const getRoomList = () => {
  socket.emit("get_roomlist", (rooms) => {
    rooms.forEach((room) => {
      const roomDiv = document.createElement("div");
      roomDiv.innerText = room.name;
      roomDiv.id = room.id;
      const enterBtn = document.createElement("button");
      enterBtn.innerText = "입장";
      enterBtn.addEventListener("click", () => {
        window.location.href = `/room/${room.id}`;
      });
      roomDiv.appendChild(enterBtn);
      roomList.innerHTML = "";
      roomList.appendChild(roomDiv);
    });
  });
};

const handlerRoomSubmit = (event) => {
  event.preventDefault();
  const roomName = form.querySelector("input").value;
  form.querySelector("input").value = "";
  if (!roomName) return;
  socket.emit("create_room", { roomName }, ({ roomId }) => {
    window.location.href = `/room/${roomId}`;
  });
};
form.addEventListener("submit", handlerRoomSubmit);
refreshBtn.addEventListener("click", getRoomList);
getRoomList();
