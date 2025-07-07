const { createClient } = require("redis");
require("dotenv").config();

const redisClient = createClient({
  url: `redis://redis:${process.env.REDIS_PORT}`,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("Redis client connected successfully");
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = { connectRedis, redisClient };
