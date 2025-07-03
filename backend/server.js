const app = require("./app");
const http = require("http");

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
