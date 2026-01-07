const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
  console.log("Connected to Server✅");
});
socket.addEventListener("message", (message) => {
  console.log("New Message : ", message.data);
});
socket.addEventListener("close", () => {
  consoel.log("Disconnected from Server😭");
});

setTimeout(() => {
  socket.send("Hello Server!");
}, 1000);
