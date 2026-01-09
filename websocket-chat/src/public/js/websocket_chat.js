const messageList = document.querySelector("#messageList");
const messageForm = document.querySelector("#mesaageForm");
const nameForm = document.querySelector("#saveNameForm");
const saveNameArea = document.querySelector("#saveName");
const chatArea = document.querySelector("#chat");
let name;

const socket = new WebSocket(`ws://${window.location.host}`);
/**
 * message type1
 * {
 *  type:"message",
 *  message:"~~",
 *  name: name
 * }
 *
 * message type2
 * {
 *  type:"name"
 *   name:"~~~"
 * }
 */
const makeMessageObj = (type, message, name) => {
  return JSON.stringify({ type, message, name });
};
const makeNameObj = (type, name) => {
  return JSON.stringify({ type, name });
};

socket.addEventListener("open", () => {
  console.log("Connected to Server✅");
});

socket.addEventListener("close", () => {
  console.log("Disconnected from Server😭");
});

socket.addEventListener("message", (event) => {
  const { type, payload } = JSON.parse(event.data);
  if (type === "message") {
    const li = document.createElement("li");
    li.innerHTML = payload.name + " : " + payload.message;
    messageList.appendChild(li);
  } else if (type === "addName_error") {
    alert(payload);
  } else if (type === "addName_success") {
    alert("채팅가능");
    nameForm.querySelector("input").value = "";
    saveNameArea.style.display = "none";
    chatArea.style.display = "block";
  }
});

const handleSubmit = (evnet) => {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessageObj("message", input.value, name));
  const li = document.createElement("li");
  li.innerHTML = "You : " + input.value;
  messageList.appendChild(li);
  input.value = "";
};
const handleName = (event) => {
  event.preventDefault();
  name = nameForm.querySelector("input").value;
  socket.send(makeNameObj("name", name));
};

messageForm.addEventListener("submit", handleSubmit);
nameForm.addEventListener("submit", handleName);
