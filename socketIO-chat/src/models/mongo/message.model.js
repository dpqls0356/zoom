import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },

    senderId: {
      type: String, // user.user_id (MariaDB)
      required: true,
    },
    profileUrl: {
      type: String, // user.user_id (MariaDB)
    },
    senderName: {
      type: String, // user.user_id (MariaDB)
      required: true,
    },
    type: {
      type: String,
      enum: ["TEXT", "SYSTEM"],
      default: "TEXT",
    },

    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  },
);

export default mongoose.model("Message", MessageSchema);
