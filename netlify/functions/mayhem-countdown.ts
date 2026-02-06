import { createRedis } from "./redis";
import { db } from "./_db";

const DUMMY_NO_MAYHEM = "1900-07-01 00:00:00";

export const handler = async () => {
  console.log("=== mayhem-countdown invoked ===");

  let redis = createRedis();
  if (redis) {
    redis.on("error", (err) => {
      console.log("Redis error (ignored):", err.message);
    });

    try {
      await redis.connect();
      console.log("Redis connected");
    } catch (err) {
      console.log("Redis connect failed, skipping cache:", err);
      redis = null;
    }
  }

  const cacheKey = "mayhem_countdown_target";

  try {
    // 1️⃣ Try Redis first
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log("Redis cache hit");
          return {
            statusCode: 200,
            body: cached,
          };
        }
      } catch (err) {
        console.log("Redis read failed:", err);
      }
    }

    // 2️⃣ Fetch from DB
    const [rows]: any = await db.execute(
      `
      SELECT countdown_to
      FROM countdown
      ORDER BY id DESC
      LIMIT 1
      `
    );

    let countdownTo = null;

    if (rows?.length && rows[0].countdown_to) {
      const value = rows[0].countdown_to;

      if (
        value !== DUMMY_NO_MAYHEM &&
        value !== null
      ) {
        countdownTo = value;
      }
    }

    const response = JSON.stringify({
      countdown_to: countdownTo ?? DUMMY_NO_MAYHEM,
    });

    // 3️⃣ Save to Redis (short TTL, live feel)
    if (redis) {
      try {
        await redis.set(cacheKey, response, "EX", 30); // 30 sec cache
        console.log("Redis cache updated");
      } catch (err) {
        console.log("Redis write failed:", err);
      }
    }

    return {
      statusCode: 200,
      body: response,
    };
  } catch (err: any) {
    console.error("FUNCTION ERROR:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    if (redis) {
      try {
        await redis.quit();
      } catch {}
    }
  }
};
