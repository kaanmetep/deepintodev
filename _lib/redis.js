import { createClient } from "redis";

let redisClient;

export const createSecureRedisClient = async () => {
  if (!redisClient) {
    redisClient = createClient({
      socket: {
        connectTimeout: 5000,
        disconnectTimeout: 5000,
      },
      retry_strategy: (options) => {
        if (options.attempt > 5) {
          return new Error("Retry attempts exhausted");
        }
        return Math.min(options.attempt * 100, 3000);
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
