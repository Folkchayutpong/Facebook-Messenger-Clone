const path = require("path");
const app = require("./app");
const http = require("http");
const userRoute = require("./modules/user/user.route");
require("dotenv").config({ path: "./config/.env" });
require("./config/db");

const port = process.env.PORT || 3000;

//create server
const server = http.createServer(app);

//route
app.use("api/user", userRoute);

//TODO: add other routes








//start server
server.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
});
