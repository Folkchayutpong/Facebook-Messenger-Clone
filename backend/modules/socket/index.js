const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const Message = require("../message/message.model");
const Chat = require("../chat/chat.model");
const User = require("../user/user.model");
const { socketAuthMiddleware } = require("../../middleware/auth");
const { timeStr } = require("../../utils/utils");
const now = new Date();

function initSocket(server) {
  const io = new Server(server);

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log("✅ New socket connected:", socket.user.username);

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("send_message", async (msg) => {
      try {
        console.log(now);

        const newMessage = await Message.create({
          chatId: msg.chatId,
          content: msg.content,
          sender: socket.user._id,
          senderName: socket.user.username,
          messageType: msg.messageType || "text",
          sentAt: timeStr(now),
        });

        const populated = await newMessage.populate("sender", "username");

        io.to(msg.chatId).emit("receive_message", {
          _id: newMessage._id,
          chatId: msg.chatId,
          content: newMessage.content,
          sender: populated.sender._id,
          senderName: populated.sender.username,
          messageType: newMessage.messageType,
          sentAt: newMessage.sentAt,
        });
      } catch (err) {
        console.error("❌ Error sending message:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected:", socket.user.username);
    });
  });
  return io;
}

module.exports = initSocket;
