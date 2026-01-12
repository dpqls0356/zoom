import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/list");
  }
  res.redirect("/auth/login");
});

router.get("/list", (req, res) => {
  res.render("chat/list", {
    user: req.session.user,
  });
});

export default router;
