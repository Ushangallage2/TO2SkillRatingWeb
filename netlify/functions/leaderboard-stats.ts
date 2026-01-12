import type { Handler } from "@netlify/functions";
import { db } from "./_db";
import { createRedis } from "./redis";

const ALLOWED_SORT_FIELDS = [
  "XPG",
  "KPG",
  "FPG",
  "final_skill_rating",
  "overall_win_ratio",
];

export const handler: Handler = async (event) => {
  const sort =
    event.queryStringParameters?.sort ?? "overall_win_ratio";

  if (!ALLOWED_SORT_FIELDS.includes(sort)) {
    return { statusCode: 400, body: "Invalid sort field" };
  }

  const cacheKey = `leaderboard:${sort}`;
  const redis = createRedis();

  try {
    if (redis) {
      try {
        await redis.connect();
        const cached = await redis.get(cacheKey);
        if (cached) {
          return { statusCode: 200, body: cached };
        }
      } catch {
        // silently fall through
      }
    }

    const [rows] = await db.query(`
      SELECT
        player_name,
        total_matches,
        xp,
        KPG,
        FPG,
        final_skill_rating,
        overall_win_ratio,
        last_updated_player_level,
        country_flag,
        XPG,
        red_team_win_rate,
        blue_team_win_rate
      FROM overall_player_skill_rating
      ORDER BY ${sort} DESC
    `);

    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(rows), "EX", 60);
        console.log("Redis cache hit");
      } catch {}
    }

    return { statusCode: 200, body: JSON.stringify(rows) };
  } catch (err: any) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  } finally {
    if (redis) {
      try {
        await redis.quit();
      } catch {}
    }
  }
};
