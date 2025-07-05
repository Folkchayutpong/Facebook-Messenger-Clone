require("dotenv").config({ path: "./config/.env" });
const jwt = require("jsonwebtoken");
const { redisClient } = require("../config/redis");

//authentication middleware
const socketAuthMiddleware = async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Missing token"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const redisKey = `token:${decoded.id}`;
    const stored = await redisClient.get(redisKey);

    if (!stored || stored !== token) {
      return next(new Error("Invalid or expired token"));
    }

    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
};

module.exports = socketAuthMiddleware;
