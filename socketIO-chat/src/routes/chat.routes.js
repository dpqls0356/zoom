import { Router } from "express";
import * as chatController from "../controllers/chat.controller.js";
import { upload } from "../middlewares/upload.js";
const router = Router();

router.get("/create", chatController.createPage);
router.post(
  "/create",
  upload("chat_rooms").single("roomProfileUrl"),
  chatController.createRoom
);
router.get("/:id", chatController.enterRoom);
export default router;
