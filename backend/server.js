require("dotenv").config({ path: "./config/.env" });
const { app, initSocket } = require("./app");
const http = require("http");
const userRoute = require("./modules/user/user.route");
const friendRoute = require("./modules/friend/friend.route");
const chatRoute = require("./modules/chat/chat.route");
const messageRoute = require("./modules/message/message.route");
const conectDB = require("./config/db");
const { connectRedis } = require("./config/redis");

const port = process.env.PORT || 5000;

//create server
const server = http.createServer(app);

//route
app.use("/api/user", userRoute);
app.use("/api/friend", friendRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

//TODO: add other routes

//start server
server.listen(port, async () => {
  await conectDB();
  await connectRedis();
  initSocket(server);
  console.log(`Server is running on port ${port}`);
});

module.exports = server;
