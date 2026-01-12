import { createRedis } from "./redis";
import { db } from "./_db";

export const handler = async () => {
  console.log("=== leaderboard-skill invoked ===");

  let redis = createRedis();
  if (redis) {
    // Handle unhandled Redis events
    redis.on("error", (err) => {
      console.log("Redis error (ignored):", err.message);
    });

    try {
      await redis.connect();
      console.log("Redis connected");
    } catch (err) {
      console.log("Redis connect failed, skipping cache:", console.error(err));
      redis = null; // fallback to DB only
    }
  }

  const cacheKey = "leaderboard_cache";

  try {
    // Try Redis cache first
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log("Redis cache hit");
          return { statusCode: 200, body: cached };
        }
      } catch (err) {
        console.log("Redis read failed, skipping cache:", console.error(err));
      }
    }

    // Fetch from MySQL
    const [rows] = await db.execute(
      `SELECT * FROM overall_player_skill_rating ORDER BY final_skill_rating DESC`
    );

    // Save to Redis
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(rows), "EX", 60); // 60 sec
        console.log("Redis cache updated");
      } catch (err) {
        console.log("Redis write failed:", console.error(err));
      }
    }

    return { statusCode: 200, body: JSON.stringify(rows) };
  } catch (err: any) {
    console.error("FUNCTION ERROR:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  } finally {
    if (redis) {
      try {
        await redis.quit();
      } catch {}
    }
  }
};
