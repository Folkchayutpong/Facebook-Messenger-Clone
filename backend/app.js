const express = require("express");
const cors = require("cors");

//setup express
const app = express();

//setup cors middleware
const corsOptions = {
  origin: "http://localhost:3000",
};

//use middleware
app.use(cors(corsOptions));

module.exports = app;
