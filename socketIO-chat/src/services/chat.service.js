import prisma from "../../prisma/client.js";
import crypto from "crypto";
import Message from "../models/mongo/message.model";

export const createRoom = async (roomData) => {
  const id = crypto.randomBytes(64).toString("hex");
  const result = await prisma.$transaction(async (tx) => {
    //채팅방 만들기
    const room = await tx.chat_rooms.create({
      data: { id, ...roomData, number_of_participant: 1 },
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

export const enterRoom = async ({ userId, roomId, user }) => {
  //1. 존재하는 방인가
  //2. 기존 구성원인가
  // 참가자들 + 메세지 일부를 받아 리턴
  //3. 기존 구성원이 아님
  // -> 입장 가능 여부 따지기 (인원 수)
  // -> 가능하면 참가자 정보만 받아서 리턴
  return await prisma.$transaction(async (tx) => {
    let newJoin = false;
    //1
    const room = await prisma.chat_rooms.findUnique({
      where: { id: roomId },
      select: {
        max_users: true,
        number_of_participant: true,
      },
    });

    if (!room) {
      throw new Error("ROOM_NOT_FOUND");
    }
    //2
    let joinInfo = await prisma.user_chat_rooms.findUnique({
      where: {
        user_id_room_id: {
          user_id: userId,
          room_id: roomId,
        },
      },
    });
    //3
    if (!joinInfo) {
      newJoin = true;
      if (room.number_of_participant >= room.max_users) {
        throw new Error("ROOM_FULL");
      }
      await tx.chat_rooms.update({
        where: { id: roomId },
        data: {
          number_of_participant: {
            increment: 1,
          },
        },
      });
      joinInfo = await tx.user_chat_rooms.create({
        data: {
          user_id: userId,
          room_id: roomId,
        },
      });
      //입장 안내메세지 넣기
      Message.insertOne({
        roomId,
        senderId: userId,
        profileUrl: user.profile_url,
        senderName: user.nickname,
        type: "SYSTEM",
        content: `${user.nickname}님이 입장했습니다.`,
      });
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
      .sort({ createdAt: -1, _id: -1 }) //최신순
      .limit(50) // 30개만
      .lean();

    return {
      status: 200,
      participants: participants.map((p) => p.user),
      messages: messages.reverse(),
      roomInfo,
      newJoin,
    };
  });
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

export const saveMessage = async (message) => {
  return Message.create(message);
};
