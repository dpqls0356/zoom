import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import * as refreshTokenModel from "../models/mysql/refreshToken.model.js";
import * as userModel from "../models/mysql/user.model.js";
import prisma from "../../prisma/client.js";

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
  /**
   * update를 쓰지않은 이유
   *  - 리프레시토큰을 탈취했을 때 요청을 통해 동시에 update를 시키면 access token이 2개 발급된다.
   *  - 해당 엑세스 토큰이 만료되기 전에 공격자는 맘대로 사용이 가능
   * update+행락
   *  - 한 트랜잭션이 token 행을 잡고 있는 동안
   *    다른 트랜잭션은 대기(block)
   *    동시 update는 막을 수 있다
   *  - 그러나 구현 복잡도가 올라가고 만약 실수를 한다면 보안이 깨짐 -> 인증로직은 사람 실수에 관대해야함
   *
   * delete()는 레코드 없으면 throw
   * deleteMany()는 count로 제어 가능
   *
   */
  await prisma.$transaction(async (tx) => {
    const deleted = await tx.refresh_tokens.deleteMany({
      where: { token: refreshToken },
    });
    if (deleted.count === 0) {
      throw new Error("Refresh token already used or invalid");
    }
    await tx.refresh_tokens.create({
      data: {
        user_id: user.id,
        token: newRefreshToken,
        user_agent: meta.userAgent,
        ip_address: meta.ip,
        expires_at: new Date(Date.now() + 7 * 86400000),
      },
    });
  });

  return {
    type: "SUCCESS",
    accessToken,
    refreshToken: newRefreshToken,
  };
};
