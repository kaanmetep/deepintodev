import { Redis } from "@upstash/redis";

let redisClient;

export const createSecureRedisClient = async () => {
  if (!redisClient) {
    // Check if Upstash Redis credentials are configured
    if (
      !process.env.UPSTASH_REDIS_REST_URL ||
      !process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      console.warn("Upstash Redis credentials not configured");
      throw new Error(
        "UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not configured"
      );
    }

    try {
      // Upstash Redis doesn't require async connection - it's HTTP-based
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      // Test the connection with a simple ping
      await redisClient.ping();
      console.log("Upstash Redis connected successfully");
    } catch (error) {
      console.error("Failed to connect to Upstash Redis:", error);
      redisClient = null;
      throw error;
    }
  }
  return redisClient;
};

export default createSecureRedisClient;
