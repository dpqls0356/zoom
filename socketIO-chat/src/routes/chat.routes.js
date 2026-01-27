import { Router } from "express";
import * as chatController from "../controllers/chat.controller.js";
import { upload } from "../middlewares/upload.js";
const router = Router();

// 생성
router.get("/create", chatController.createPage);
router.post(
  "/create",
  upload("chat_rooms").single("roomProfileUrl"),
  chatController.createRoom,
);
// 채팅방 리스트
router.get("/list", chatController.getRoomList);
router.get("/search_room", chatController.searchRoomList);
// 채팅방 입장
router.get("/:id", chatController.enterRoom);
router.get("/chat/send", chatController.sendMessage);
export default router;
