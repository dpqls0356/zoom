import axios from "axios";
import * as userModel from "../models/mysql/user.model.js";
import * as tokenService from "../services/token.service.js";

export const kakaoLogin = async (code, meta) => {
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
    const { data: kakaoUser } = await axios.get(
      "https://kapi.kakao.com/v2/user/me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // 3. DB 조회
    let user = await userModel.findByKakaoId(kakaoUser.kakao_id);

    if (!user) {
      return {
        type: "NEED_JOIN",
        payload: kakaoUser,
      };
    }
    // 토큰 생성해서 반환하기
    const tokens = await tokenService.createToken(user, meta);
    return {
      type: "LOGIN_SUCCESS",
      payload: tokens,
    };
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const join = async (joinData, meta) => {
  const user = await userModel.create(joinData);
  const tokens = await tokenService.createToken(user, meta);
  return tokens;
};
