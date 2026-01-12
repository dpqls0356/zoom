import * as authService from "../services/auth.service.js";
import jwt from "jsonwebtoken";

export const loginPage = (req, res) => {
  res.render("auth/login");
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
    const user = await authService.kakaoLogin(code);

    // jwt으로 변경 후 미사용
    // req.session.user = user;

    const token = jwt.sign(
      {
        id: user.id,
        nickname: user.nickname,
        profile_url: user.profile_url,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.redirect("/list");
  } catch (err) {
    next(err);
  }
};
