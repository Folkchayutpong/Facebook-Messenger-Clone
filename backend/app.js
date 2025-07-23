const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const { socketAuthMiddleware } = require("./middleware/auth");

//setup express
const app = express();

//setup cors middleware
const corsOptions = {
  origin: "http://localhost:8080",
  credentials: true,   
};

//use middleware
app.use(express.urlencoded());
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));

module.exports = app
