require("dotenv").config({ path: "./config/.env" });
const jwt = require("jsonwebtoken");
const { redisClient } = require("../config/redis");
const { parseTokenFromCookie } = require("../utils/utils");
const User = require("../modules/user/user.model");

//authentication middleware
const socketAuthMiddleware = async (socket, next) => {
  const token = parseTokenFromCookie(socket.handshake.headers?.cookie);
  if (!token) return next(new Error("Missing token"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const redisKey = `token:${decoded.id}`;
    const stored = await redisClient.get(redisKey);

    if (!stored || stored !== token) {
      return next(new Error("Invalid or expired token"));
    }

    const user = await User.findById(decoded.id).select("name email");
    if (!user) return next(new Error("User not found"));

    socket.user = user; // <-- assign User document, ไม่ใช่แค่ decoded token
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
};
const expressAuthMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const redisKey = `token:${decoded.id}`;
    const stored = await redisClient.get(redisKey);

    if (!stored || stored !== token) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = {
  socketAuthMiddleware,
  expressAuthMiddleware,
};
