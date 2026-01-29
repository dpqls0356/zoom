import * as chatService from "../services/chat.service";
export default function registerRoomSocket(io, socket) {
  // 1️⃣ 채팅방에 처음 입장
  socket.on("chat:new-join", async ({ roomId }) => {
    try {
      socket.join(roomId);
      // 다른 참가자들에게 입장 알림
      socket.to(roomId).emit("chat:new-user", {
        content: `${socket.user.nickname}님이 입장했습니다.`,
        type: "SYSTEM",
      });
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

  //채팅방에서 아예 강제 퇴장/나간 경우
  socket.on("leave-room", async ({ roomId }) => {
    console.log("leave");
    try {
      // DB에서 참가자 상태 제거 가능
      const result = await chatService.leaveRoom({
        roomId,
        userId: socket.user.id,
        user: socket.user,
      });
      console.log(result);
      if (result.status === 200) {
        // 룸 전체에 퇴장 알림
        io.to(roomId).emit("leave-room", {
          nickname: socket.user.nickname,
          type: "SYSTEM",
          content: `${socket.user.nickname}님이 퇴장했습니다.`,
        });
      }
    } catch (err) {
      console.error("Error in getout-room:", err);
    }
  });
}
