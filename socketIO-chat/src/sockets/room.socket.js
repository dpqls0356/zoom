import * as chatService from "../services/chat.service";
export default function registerRoomSocket(io, socket) {
  // 1️⃣ 채팅방에 처음 입장
  socket.on("new-join-room", async ({ roomId }) => {
    try {
      socket.join(roomId);

      // DB/서비스 레이어에서 참가자 상태 업데이트 가능

      // 다른 참가자들에게 입장 알림
      socket.to(roomId).emit("user-joined", {
        nickname: socket.user.nickname,
        createdAt: new Date(),
      });

      // 필요 시 서버 측 로그
      console.log(`${socket.user.nickname} joined room ${roomId}`);
    } catch (err) {
      console.error("Error in new-join-room:", err);
    }
  });

  // 2️⃣ 이미 참여한 채팅방 다시 들어오는 경우
  socket.on("chat:join", ({ roomId }) => {
    socket.join(roomId);
  });

  // 3️⃣ 채팅 메시지 전달
  socket.on("chat:send", async ({ roomId, message }) => {
    try {
      // DB에 메시지 저장 가능
      const messgageInfo = await chatService.saveMessage({
        senderId: socket.user.id,
        roomId: roomId,
        content: message,
        senderName: socket.user.nickname,
        type: "TEXT",
        profileUrl: socket.user.profile_url,
      });
      // 해당 룸 모든 참가자에게 메시지 브로드캐스트
      io.to(roomId).emit("chat:receive", {
        message: [messgageInfo],
      });
    } catch (err) {
      console.error("Error in chat:send:", err);
    }
  });

  // 4️⃣ 채팅방 화면에서 나간 경우 (탭 종료 등)
  socket.on("disconnect", () => {
    console.log(`${socket.user?.nickname || "Unknown user"} disconnected`);
  });

  // 5️⃣ 채팅방에서 아예 강제 퇴장/나간 경우
  socket.on("getout-room", async ({ roomId }) => {
    try {
      // DB에서 참가자 상태 제거 가능

      // 룸 전체에 퇴장 알림
      io.to(roomId).emit("getout-room", {
        nickname: socket.user.nickname,
        createdAt: new Date(),
      });

      console.log(`${socket.user.nickname} got out of room ${roomId}`);
    } catch (err) {
      console.error("Error in getout-room:", err);
    }
  });
}
