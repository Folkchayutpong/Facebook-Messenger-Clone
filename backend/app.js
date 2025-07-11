const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const socketAuthMiddleware = require("./middleware/auth");

//setup express
const app = express();

//setup cors middleware
const corsOptions = {
  origin: "http://localhost:8080",
};

//use middleware
app.use(express.urlencoded());
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));

function initSocket(server) {
  const io = new Server(server, {
    cors: corsOptions,
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.email}`);

    socket.on("disconnect", () => {
      console.log(` Socket disconnected: ${socket.user.email}`);
    });
  });
}

module.exports = { app, initSocket };
