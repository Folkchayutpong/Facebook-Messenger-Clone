const { createClient } = require("redis");

// Create Redis for message here

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
// add another connection for caching message
const redisCache = redisClient.duplicate();

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      await redisCache.connect();
      console.log("Redis client connected successfully");
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = { connectRedis, redisCache, redisClient };
