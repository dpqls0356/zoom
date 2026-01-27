import { getUserInfo } from "../utils/jwt";
import * as chatService from "../services/chat.service";
export const createPage = (req, res) => {
  res.render("chat/create");
};

export const createRoom = async (req, res) => {
  const roomData = req.body;
  const user = getUserInfo(req.cookies.access_token);

  let profileUrl = null;
  if (req.file) {
    profileUrl = req.file.location;
  }

  const param = {
    room_name: roomData.roomName,
    owner_id: user.id,
    max_users: Number(roomData.maxPerson),
    tag: roomData.roomTag,
    profile_url: profileUrl,
    created_at: new Date(),
  };

  const roomId = await chatService.createRoom(param);

  return res.redirect(`/chat/${roomId}`);
};

export const enterRoom = async (req, res) => {
  const roomId = req.params.id;
  const user = getUserInfo(req.cookies.access_token);
  const message = await chatService.enterRoom({
    userId: user.id,
    roomId: roomId,
  });
  // console.log("enter room", message);
  switch (message.status) {
    case 403:
      return res.redirect("/chat/list");
    case 200:
      // 방에 입장한다는 알림 보내기 + 해당 메세지 mongodb에 저장
      return res.render(`chat/room`, {
        messages: message.messages,
        participants: message.participants,
        room: message.roomInfo,
        currentUserId: user.id,
      });
  }
};

export const getRoomList = async (req, res) => {
  const user = getUserInfo(req.cookies.access_token);
  const rooms = await chatService.searchRoomList({
    type: "joined",
    userId: user.id,
  });
  return res.render("chat/list", {
    rooms,
    type: "joined",
    user: req.user,
    headerTitle: "Message",
  });
};

export const searchRoomList = async (req, res) => {
  const { type, searchWord } = req.query;
  const user = getUserInfo(req.cookies.access_token);

  const rooms = await chatService.searchRoomList({
    type,
    searchWord,
    userId: user.id,
  });

  return res.status(200).send({ success: true, type, rooms });
};

export const sendMessage = async (req, res) => {};
