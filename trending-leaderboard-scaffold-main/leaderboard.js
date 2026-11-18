
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);

// Record one upvote for a post
export async function upvote(postId) {
  return redis.zincrby("trending:posts", 1, postId);
}

// Fetch top N posts with their metadata
export async function getTop(n) {
  // 1. Fetch ranked post IDs and scores
  const flat = await redis.zrevrange(
    "trending:posts", 0, n - 1, "WITHSCORES"
  );

  // 2. Create an array to store post information
  const rows = [];

  // 3. Create a Redis pipeline
  const pipeline = redis.pipeline();

  // 4. Queue metadata requests
  for (let i = 0; i < flat.length; i += 2) {
    const id = flat[i];

    rows.push({
      id,
      score: Number(flat[i + 1])
    });

    pipeline.hgetall(id + ":meta");
  }

  // 5. Execute all queued commands
  const results = await pipeline.exec();

  // 6. Merge scores and metadata
  return rows.map((row, k) => ({
    ...row,
    ...results[k][1]
  }));
}

export { redis };
