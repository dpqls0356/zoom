import axios from "axios";
import prisma from "../../prisma/client.js";
import crypto from "crypto";
import Message from "../models/mongo/message.model.js";
import { join } from "path";
export const createRoom = async (roomData) => {
  const id = crypto.randomBytes(64).toString("hex");
  const result = await prisma.$transaction(async (tx) => {
    //채팅방 만들기
    const room = await tx.chat_rooms.create({
      data: { id, ...roomData },
    });
    if (room) {
      //유저에게 연결
      await tx.user_chat_rooms.create({
        data: {
          user_id: room.owner_id,
          room_id: room.id,
          joined_at: new Date(),
        },
      });
    }
    return id;
  });
  return result; // 트랜잭션을 성공하면 id를 리턴하고 그게 result에 담김
};

export const enterRoom = async ({ userId, roomId }) => {
  // 1. 이 유저가 이 방에 들어올 권한이 있는가?
  // 2. 이 유저가 언제 들어왔는가? (joined_at)
  // 3. 그 시점 이후의 메시지를 "일부만" 가져오기
  const joinInfo = await prisma.user_chat_rooms.findUnique({
    where: {
      user_id_room_id: {
        user_id: userId,
        room_id: roomId,
      },
    },
  });
  if (!joinInfo) {
    return {
      status: 403,
      message: "Not a participant",
    };
  }

  const participants = await prisma.user_chat_rooms.findMany({
    where: { room_id: roomId },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          profile_url: true,
        },
      },
    },
  });

  const roomInfo = await prisma.chat_rooms.findUnique({
    where: {
      id: roomId,
    },
  });
  const messages = await Message.find({
    roomId,
    createdAt: { $gte: joinInfo.joined_at },
  })
    .sort({ createdAt: -1 }) //최신순
    .limit(30) // 30개만
    .lean(); //순수 JS 객체 -> 성능 향상

  console.log("messages ", messages);
  return {
    status: 200,
    participants: participants.map((p) => p.user),
    messages,
    roomInfo,
  };
};
export const searchRoomList = async ({ type, searchWord, userId }) => {
  switch (type) {
    case "joined": {
      // const rooms = await prisma.user_chat_rooms.findMany({
      //   where: {
      //     user_id: userId,
      //     chat_rooms: {
      //       name: { // 해당 컬럼에 검색어가 포함되어있는가
      //         contains: searchWord,
      //       },
      //     },
      //   },
      //   include: {
      //     chat_rooms: true,
      //   },
      // });
      const rooms = await prisma.chat_rooms.findMany({
        where: {
          room_name: { contains: searchWord },
          participants: { some: { user_id: userId } },
        },
      });
      return rooms;
    }
    case "available": {
      const rooms = await prisma.chat_rooms.findMany({
        where: {
          room_name: { contains: searchWord },
          participants: { none: { user_id: userId } },
        },
      });
      return rooms;
    }
  }
};
