import type { Handler } from "@netlify/functions";
import * as mysql from "mysql2/promise";
import { createRedis } from "./redis";

export const handler: Handler = async () => {
  console.log("=== commentary-game-video invoked ===");

  const cacheKey = "commentary:latest_video";
  const redis = createRedis();

  try {
    /* ---------------- REDIS READ ---------------- */
    if (redis) {
      try {
        await redis.connect();
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log("Redis cache hit (commentary video)");
          return {
            statusCode: 200,
            body: cached,
          };
        }
      } catch {
        console.log("Redis read failed, falling back to DB");
      }
    }

    /* ---------------- MYSQL QUERY ---------------- */
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST!,
      user: process.env.DB_USERNAME!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,
      port: Number(process.env.DB_PORT),
      ssl: { rejectUnauthorized: false },
    });

    console.log("DB connected");

    const [rows] = await connection.execute(
      `SELECT video_id, thumbnail_path
       FROM commentary_games_video
       ORDER BY id DESC
       LIMIT 1`
    );

    await connection.end();

    console.log("Rows:", rows);

    const body = JSON.stringify(rows);

    /* ---------------- REDIS WRITE ---------------- */
    if (redis) {
      try {
        await redis.set(cacheKey, body, "EX", 60); // cache for 60s
        console.log("Redis cache updated (commentary video)");
      } catch {
        console.log("Redis write failed (ignored)");
      }
    }

    return {
      statusCode: 200,
      body,
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
