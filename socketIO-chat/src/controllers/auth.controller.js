import * as authService from "../services/auth.service.js";
import * as tokenService from "../services/token.service.js";
import jwt from "jsonwebtoken";
import * as userModel from "../models/mysql/user.model.js";
import { setAuthCookies } from "../utils/cookie.util.js";

export const loginPage = (req, res) => {
  res.render("auth/login");
};
export const joinPage = (req, res) => {
  const tempToken = req.cookies.kakao_temp;
  if (!tempToken) return res.redirect("/auth/login"); // 쿠키 없으면 로그인 유도

  let kakaoUser;
  try {
    kakaoUser = jwt.verify(tempToken, process.env.JWT_SECRET);
  } catch (err) {
    return res.redirect("/auth/login"); // 토큰 만료/위조 시
  }

  res.render("auth/join", {
    kakao: {
      kakaoId: kakaoUser.id,
      profileUrl: kakaoUser.properties.profile_image,
      nickname: kakaoUser.properties.nickname,
    },
  });
};

// 인가 코드 요청
export const kakaoLogin = (req, res) => {
  const kakaoAuthURL =
    `https://kauth.kakao.com/oauth/authorize?` +
    `client_id=${process.env.KAKAO_REST_KEY}` +
    `&redirect_uri=${process.env.KAKAO_REDIRECT_URI}` +
    `&response_type=code`;
  // 사용자를 카카오 로그인 페이지로 리다이렉트
  res.redirect(kakaoAuthURL);
};

//인거 코드를 받아온 후 실행될 함수
export const kakaoCallback = async (req, res, next) => {
  try {
    const code = req.query.code;
    // 토큰 요청해서 정보 받아오기
    const result = await authService.kakaoLogin(code, {
      userAgent: req.headers["user-agent"],
      ip: req.ip, //리프레시 토큰 저장할 때 필요
    });

    if (result.type === "LOGIN_SUCCESS") {
      setAuthCookies(res, result.payload);
      return res.redirect("/list");
    } else if (result.type === "NEED_JOIN") {
      const tempToken = jwt.sign(result.payload, process.env.JWT_SECRET, {
        expiresIn: "10m",
      });
      res.cookie("kakao_temp", tempToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/auth/join",
      });

      res.redirect("/auth/join");
    }
  } catch (err) {
    next(err);
  }
};

export const join = async (req, res, next) => {
  const { kakaoId, nickname, userId, profileUrl } = req.body;
  try {
    const result = await authService.join(
      { kakaoId, nickname, userId, profileUrl },
      {
        userAgent: req.headers["user-agent"],
        ip: req.ip, //리프레시 토큰 저장할 때 필요
      }
    );
    setAuthCookies(res, result);
    return res.redirect("/list");
  } catch (err) {
    console.log(err);
  }
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (refreshToken) {
    userModel.logout(refreshToken);
  }
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.redirect("/auth/login");
};

export const refresh = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.redirect("/auth/login");
  }
  // db에 리프레시 토큰이 있는지 확인
  const result = await tokenService.verifyAndRotateToken(refreshToken, {
    userAgent: req.headers["user-agent"],
    ip: req.ip, //리프레시 토큰 저장할 때 필요
  });
  if (result.type === "Fail") {
    console.log(result.message);
    return res.redirect("/auth/login");
  }
  // console.log("verifyAndRotateToken result : ", result.type);
  setAuthCookies(res, result);
  const redirectUrl = req.query.redirect?.startsWith("/")
    ? req.query.redirect
    : "/list";
  res.redirect(redirectUrl);
};
