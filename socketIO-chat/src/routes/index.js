import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  if (req.user) {
    return res.redirect("/chat/list");
  }
  res.redirect("/auth/login");
});

export default router;
