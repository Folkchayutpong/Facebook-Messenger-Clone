const app = require("./app");
const http = require("http");
const userRoute = require("./modules/user/user.route");
const conectDB = require("./config/db");
require("dotenv").config({ path: "./config/.env" });

const port = process.env.PORT || 3000;

//create server
const server = http.createServer(app);

//route
app.use("/api/user", userRoute);

//TODO: add other routes

//start server
server.listen(port, async () => {
  await conectDB();
  console.log(`Server is running on port ${port}`);
});
