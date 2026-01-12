import axios from "axios";
import * as userModel from "../models/mysql/user.model.js";

export const kakaoLogin = async (code) => {
  try {
    // 1. 토큰 발급
    const tokenRes = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.KAKAO_REST_KEY,
          redirect_uri: process.env.KAKAO_REDIRECT_URI,
          code,
          client_secret: process.env.KAKAO_CLIENT_SECRET,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenRes.data.access_token;

    // 2. 유저 정보 조회
    const userRes = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const kakaoUser = userRes.data;

    const kakaoId = kakaoUser.id;
    const nickname = kakaoUser.kakao_account.profile.nickname;
    const profileUrl =
      kakaoUser.kakao_account?.profile?.profile_image_url ?? null;
    // 3. DB 조회
    let user = await userModel.findByKakaoId(kakaoId);

    // 4. 없으면 회원가입
    if (!user) {
      user = await userModel.create({
        kakaoId,
        nickname,
        profile_url: profileUrl,
      });
    }

    return {
      id: user.id,
      nickname: user.nickname,
      profile_url: user.profile_url,
    };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
