import * as authService from "../services/auth.service.js";

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

    req.session.user = user;

    res.redirect("/list");
  } catch (err) {
    next(err);
  }
};
