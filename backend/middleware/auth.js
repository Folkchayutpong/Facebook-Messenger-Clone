const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "./config/.env" });

//authentication middleware
function authenticationToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401).json({ message: "Unauthorized" });
  }

  //TODO: implements redis
  jwt.verify(token, process.env.JWT_TOKEN, (err, user) => {
    if (err) {
      return res.sendStatus(403).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticationToken;
