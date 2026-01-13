import jwt from "jsonwebtoken";
import * as userModel from "../models/mysql/user.model.js";
export const jwtAuth = async (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.redirect("/auth/login");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      res.clearCookie("access_token");
      res.clearCookie("refresh_token");
      return res.redirect("/auth/login");
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("auth error : " + err.name);
    if (err.name === "TokenExpiredError") {
      return res.redirect("/auth/refresh");
    }
    if (err.name === "JsonWebTokenError") {
      res.clearCookie("access_token");
      return res.redirect("/auth/login");
    }
    return next(err);
  }
};
