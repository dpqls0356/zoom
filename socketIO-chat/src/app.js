// app.js - express만 관리
import express from "express";
import session from "express-session";
import dotenv from "dotenv";

import indexRouter from "./routes/index.js";
import authRouter from "./routes/auth.routes.js";

import { isLoggedIn } from "./middlewares/auth.middleware.js";

// .env 파일에 정의된 환경변수를 process.env로 로드
dotenv.config();

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
// JSON 형식의 요청 본문을 파싱
// (예: axios/fetch에서 application/json으로 보낸 데이터)
app.use(express.json());
// HTML form (application/x-www-form-urlencoded) 데이터 파싱
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// 세선 설정
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
// 모든 요청에 대해 해당 함수 실행
app.use((req, res, next) => {
  const publicPaths = ["/auth"];
  if (publicPaths.some((path) => req.path.startsWith(path))) return next();

  return isLoggedIn(req, res, next);
});
app.use("/", indexRouter);
app.use("/auth", authRouter);
export default app;
