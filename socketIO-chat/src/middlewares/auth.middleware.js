import jwt from "jsonwebtoken";
export const jwtAuth = (req, res, next) => {
  const token = req.cookies.access_token;
  console.log("JWTAUTH / access_token => " + token);
  if (!token) {
    return res.redirect("/auth/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 이후 라우트에서 사용
    next();
  } catch (err) {
    console.log(err);
    return res.redirect("/auth/login");
  }
};
