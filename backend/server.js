const path = require("path");
const app = require("./app");
const http = require("http");
require("dotenv").config({ path: "./config/.env" });
const mongoose = require("mongoose");

const port = process.env.PORT || 3000;

//create server
const server = http.createServer(app);

// conect to mongodb
try {
  mongoose.connect("mongodb://localhost:27017/mydb");
  console.log("Connected to MongoDB");
} catch (e) {
  console.log(e);
}

//test route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

//start server
server.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
});
