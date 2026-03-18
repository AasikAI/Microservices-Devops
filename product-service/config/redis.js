const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn("[Product Service] Redis unavailable – caching disabled.");
      return null; // Stop retrying
    }
    return Math.min(times * 200, 2000);
  },
});

redis.on("connect", () => {
  console.log("[Product Service] Redis connected successfully.");
});

redis.on("error", (err) => {
  console.warn(`[Product Service] Redis error: ${err.message}`);
});

module.exports = redis;
