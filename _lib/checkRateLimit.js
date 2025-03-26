export async function checkRateLimit(redis, key, options = {}) {
  const {
    limit = 10,
    duration = 60,
    blockDuration = 300, // 5 minutes block
  } = options;

  try {
    const currentAttempts = await redis.incr(key);

    if (currentAttempts === 1) {
      await redis.expire(key, duration);
    }

    if (currentAttempts > limit) {
      // Block the key for an extended period
      await redis.set(`${key}:blocked`, "1", "EX", blockDuration);
      throw new Error("RateLimitExceeded");
    }
  } catch (error) {
    console.error("Rate limit check failed", error);
    throw error;
  }
}
