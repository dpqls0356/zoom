import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import * as refreshTokenModel from "../models/mysql/refreshToken.model.js";
import * as userModel from "../models/mysql/user.model.js";

export const createToken = async (user, meta) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  await refreshTokenModel.refreshSave({
    user_id: user.id,
    token: refreshToken,
    user_agent: meta.userAgent,
    ip_address: meta.ip,
    expires_at: new Date(Date.now() + 7 * 86400000),
  });

  return { accessToken, refreshToken };
};
export const verifyAndRotateToken = async (refreshToken, meta) => {
  //db에 리프레시 토큰 있는지 확인
  const result = await refreshTokenModel.getRefreshToken(refreshToken);
  if (!result) {
    return {
      type: "Fail",
      message: "Token that does not exist",
    };
  }
  // 있으면 유저 아이디로 정보를 받아오기 -> 엑세스/리프레시 새로 받기고 리프레시는 디비에 저장 -> 기존 값 지우기
  const user = await userModel.findById(result.user_id);
  if (!user) {
    return {
      type: "Fail",
      message: "User that does not exist",
    };
  }
  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken();
  await refreshTokenModel.refreshSave({
    user_id: user.id,
    token: newRefreshToken,
    user_agent: meta.userAgent,
    ip_address: meta.ip,
    expires_at: new Date(Date.now() + 7 * 86400000),
  });
  await refreshTokenModel.deleteByToken(refreshToken);
  return {
    type: "SUCCESS",
    accessToken,
    refreshToken: newRefreshToken,
  };
};
