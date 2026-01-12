import * as authService from "../services/auth.service.js";
import jwt from "jsonwebtoken";
import * as userModel from "../models/mysql/user.model.js";
import { compileString } from "sass";

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

  res.render("auth/join", { kakao: kakaoUser });
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
    const [isUser, info] = await authService.kakaoLogin(code);

    // jwt으로 변경 후 미사용
    // req.session.user = user;
    if (isUser) {
      const token = jwt.sign(
        {
          id: info.id,
          user_id: info.user_id,
          nickname: info.nickname,
          profile_url: info.profile_url,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.redirect("/list");
    } else {
      // 임시 JWT 생성 (짧은 만료)
      const tempToken = jwt.sign(
        {
          kakao_id: info.kakao_id,
          profile_url: info.profile_url,
          nickname: info.nickname,
        },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      );

      // 임시 쿠키에 저장
      res.cookie("kakao_temp", tempToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/auth/join",
      });

      return res.redirect("/auth/join"); // 주소도 바뀌고 새로고침 안전
    }
  } catch (err) {
    next(err);
  }
};

export const join = async (req, res, next) => {
  const { kakao_id, nickname, user_id, profile_url } = req.body;
  try {
    const user = await userModel.create({
      userId: user_id,
      kakaoId: kakao_id,
      nickname,
      profile_url,
    });
    if (user) {
      const token = jwt.sign(
        {
          id: user.id,
          user_id: user.user_id,
          nickname: user.nickname,
          profile_url: user.profile_url,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return res.redirect("/list");
    }
  } catch (err) {
    console.log(err);
  }
};
