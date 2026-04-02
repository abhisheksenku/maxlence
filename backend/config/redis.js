const { createClient } = require("redis");
let redisClient = null;
const connectRedis = async () => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
      },
    });
    redisClient.on("error", (err) => {
      console.error("Redis Client Error", err);
      redisClient = null;
    });
    redisClient.on("connect", () => {
      console.log("Connected to Redis");
    });
    await redisClient.connect();
  } catch (error) {
    console.warn("Could not connect to Redis:", error);
    redisClient = null;
  }
};
const getCache = async (key) => {
  if (!redisClient) return null;
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Error getting cache from Redis:", error);
    return null;
  }
};
const setCache = async (key, value, ttl = 3600) => {
  if (!redisClient) return;
  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttl,
    });
  } catch (error) {
    console.error("Error setting cache in Redis:", error);
  }
};
const deleteCache = async (key) => {
  if (!redisClient) return;
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error("Error deleting cache from Redis:", error);
  }
};
const deleteCachePattern = async (pattern) => {
  if (!redisClient) return;

  try {
    const keys = [];

    for await (const key of redisClient.scanIterator({ MATCH: pattern })) {
      keys.push(key);
    }

    if (keys.length > 0) {
      await redisClient.del(...keys); 
    }
  } catch (error) {
    console.error("Error flushing cache pattern:", error);
  }
};
module.exports = {
  connectRedis,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
};
