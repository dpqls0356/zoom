import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.get("/join", authController.joinPage);
router.post("/join", authController.join);
router.get("/login", authController.loginPage);
router.get("/refresh", authController.refresh);
router.get("/kakao", authController.kakaoLogin);
router.get("/kakao/callback", authController.kakaoCallback);
router.get("/tester", authController.testerLogin);
router.get("/logout", authController.logout);
export default router;
