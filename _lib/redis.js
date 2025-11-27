import { createClient } from "redis";

let redisClient;
let connectionFailed = false;

export const createSecureRedisClient = async () => {
  // If connection previously failed, don't retry immediately
  if (connectionFailed) {
    throw new Error("Redis connection previously failed");
  }

  if (!redisClient) {
    if (!process.env.REDIS_URL) {
      console.warn("REDIS_URL environment variable is not set");
      connectionFailed = true;
      throw new Error("REDIS_URL is not configured");
    }

    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 5000,
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    try {
      await redisClient.connect();
      connectionFailed = false;
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      redisClient = null;
      connectionFailed = true;
      throw error;
    }
  }
  return redisClient;
};

export default createSecureRedisClient;
