import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  if (req.user) {
    return res.redirect("/list");
  }
  res.redirect("/auth/login");
});

router.get("/list", (req, res) => {
  res.render("chat/list", {
    user: req.user,
    headerTitle: "Message",
  });
});

export default router;
