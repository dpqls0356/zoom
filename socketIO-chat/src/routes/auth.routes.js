import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.get("/join", authController.joinPage);
router.post("/join", authController.join);
router.get("/login", authController.loginPage);
router.get("/kakao", authController.kakaoLogin);
router.get("/kakao/callback", authController.kakaoCallback);

export default router;
