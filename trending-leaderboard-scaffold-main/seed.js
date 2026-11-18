
import { redis } from "./leaderboard.js";

async function seed() {
  // Clear previous leaderboard data
  await redis.del("trending:posts");

  // Create a pipeline
  const pipeline = redis.pipeline();

  // Create 100 posts
  for (let i = 1; i <= 100; i++) {
    const id = "post:" + i;

    // Store post metadata in a hash
    pipeline.hset(
      id + ":meta",
      "title", "Post number " + i,
      "author", "@user" + i
    );

    // Add post to leaderboard with a random score
    pipeline.zadd(
      "trending:posts",
      Math.floor(Math.random() * 50),
      id
    );
  }

  // Execute all 200 commands together
  await pipeline.exec();

  console.log("Seeded 100 posts.");
  redis.disconnect();
}

seed();
