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
    owner_id: user.id,
    max_users: Number(roomData.maxPerson),
    tag: roomData.roomTag,
    profile_url: profileUrl,
    created_at: new Date(),
  };

  const roomId = await chatService.createRoom(param);
  console.log("result roomid", roomId);

  return res.redirect(`/chat/${roomId}`);
};

export const enterRoom = async (req, res) => {
  const roomId = req.params.id;
  const user = getUserInfo(req.cookies.access_token);
  const message = await chatService.enterRoom({
    userId: user.id,
    roomId: roomId,
  });
  switch (message.status) {
    case 403:
      alert(message.message);
      return res.render("/list");
    case 200:
      return res.render(`/chat/room`, { messages: message.messages });
  }
};
