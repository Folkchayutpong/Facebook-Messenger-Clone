const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const Message = require("../message/message.model");
const Chat = require("../chat/chat.model");
const User = require("../user/user.model");
const { socketAuthMiddleware } = require("../../middleware/auth");

function initSocket(server) {
  const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log("✅ New socket connected:", socket.user.name);

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
    });
  

    // รับข้อความแล้วบันทึก
  socket.on("send_message", async (msg) => {
      try {
        const newMessage = await Message.create({
          chatId: msg.chatId,
          content: msg.content,
          messageType: msg.messageType || "text",
          sender: socket.user._id,
        });

        const populated = await newMessage.populate("sender", "name");

        // ส่งให้คนในห้องทุกคน
        io.to(msg.chatId).emit("receive_message", {
          _id: newMessage._id,
          chatId: msg.chatId,
          content: msg.content,
          sender: {
            _id: populated.sender._id,
            name: populated.sender.name,
          },
          createdAt: newMessage.createdAt,
        });
      } catch (err) {
        console.error("❌ Error sending message:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected:", socket.user.name);
    });
  });
  return io;
}

module.exports = initSocket;
