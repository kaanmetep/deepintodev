import { createClient } from "redis";

let redisClient;

export const createSecureRedisClient = async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 5000,
        disconnectTimeout: 5000,
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error", err);
    });

    await redisClient.connect();
  }
  return redisClient;
};

export default createSecureRedisClient;
