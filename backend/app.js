const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

//setup express
const app = express();

//setup cors middleware
const corsOptions = {
  origin: "http://localhost:8080",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

//use middleware
app.use(express.urlencoded());
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));

module.exports = app;
