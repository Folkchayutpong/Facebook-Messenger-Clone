const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const Message = require("../message/message.model");
const Chat = require("../chat/chat.model");
const User = require("../user/user.model");
const { socketAuthMiddleware } = require("../../middleware/auth");
const { timeStr } = require("../../utils/utils");

function initSocket(io) {
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log("New socket connected:", socket.user.username);

    const userId = socket.user._id.toString();
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined room: user:${userId}`);

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.user.username} joined chat ${chatId}`);
    });

    socket.on("send_message", async (msg) => {
      try {
        const now = new Date();
        console.log("Sending message at:", now);

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
        console.error("Error sending message:", err.message);
        socket.emit("message_error", {
          error: "Failed to send message",
          details: err.message,
        });
      }
    });
    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected:", socket.user.username);
    });
  });

  return io;
}

module.exports = initSocket;
