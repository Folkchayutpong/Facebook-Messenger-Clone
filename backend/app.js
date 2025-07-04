const express = require("express");
const cors = require("cors");

//setup express
const app = express();

//setup cors middleware
const corsOptions = {
  origin: "http://localhost:8080",
};

//use middleware
app.use(express.urlencoded());
app.use(express.json());
app.use(cors(corsOptions));

module.exports = app;
