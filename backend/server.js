require("dotenv").config({ path: "./config/.env" });
const app = require("./app");
const http = require("http");
const userRoute = require("./modules/user/user.route");
const friendRoute = require("./modules/friend/friend.route");
const chatRoute = require("./modules/chat/chat.route");
const messageRoute = require("./modules/message/message.route");
const conectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const initSocket  = require("./modules/socket/index")
const { Server } = require("socket.io");

const port = process.env.PORT || 5000;

//create server
const server = http.createServer(app);

//route
app.use("/api/user", userRoute);
app.use("/api/friend", friendRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

//TODO: add other routes
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

app.set("io", io);

//start server
server.listen(port, async () => {
  await conectDB();
  await connectRedis();
  initSocket(io);
  console.log(`Server is running on port ${port}`);
});

module.exports = server;
