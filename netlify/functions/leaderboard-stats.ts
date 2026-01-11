import type{ Handler } from "@netlify/functions";
import { db } from "./_db";

const ALLOWED_SORT_FIELDS = [
  "XPG",
  "KPG",
  "FPG",
  "final_skill_rating",
  "overall_win_ratio",
];

export const handler: Handler = async (event) => {
  try {
    const sort =
      event.queryStringParameters?.sort ?? "overall_win_ratio";

    if (!ALLOWED_SORT_FIELDS.includes(sort)) {
      return { statusCode: 400, body: "Invalid sort field" };
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

    return {
      statusCode: 200,
      body: JSON.stringify(rows),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
