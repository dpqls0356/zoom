import prisma from "../../prisma/client.js";
import crypto from "crypto";
import Message from "../models/mongo/message.model";

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
        _count: {
          select: {
            participants: true, // ✅ 현재 인원 수
          },
        },
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
      const enteredAt = new Date(); // 서버 기준
      if (room._count.user_chat_rooms >= room.max_users) {
        throw new Error("ROOM_FULL");
      }

      joinInfo = await tx.user_chat_rooms.create({
        data: {
          user_id: userId,
          room_id: roomId,
          joined_at: enteredAt,
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
        createdAt: enteredAt,
        updatedAt: enteredAt,
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
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
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
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
        },
      });
      return rooms;
    }
  }
};
export const saveMessage = async (message) => {
  return Message.create(message);
};
export const leaveRoom = async ({ roomId, userId, user }) => {
  const result = await prisma.$transaction(async (tx) => {
    //해당 유저가 해당 방을 가지고 있는지 확인
    const participant = await tx.user_chat_rooms.findUnique({
      where: { user_id_room_id: { user_id: userId, room_id: roomId } },
    });
    // 위에 조건이 맞다면 user_chat_rooms에서 지우기
    if (!participant) throw new Error("Not a participant");
    await tx.user_chat_rooms.delete({
      where: { user_id_room_id: { user_id: userId, room_id: roomId } },
    });
    // mongo에 퇴장메세지 보내기
    Message.insertOne({
      roomId,
      senderId: userId,
      profileUrl: user.profile_url,
      senderName: user.nickname,
      type: "SYSTEM",
      content: `${user.nickname}님이 퇴장했습니다.`,
    });
    return {
      status: 200,
    };
  });
  return result;
};
