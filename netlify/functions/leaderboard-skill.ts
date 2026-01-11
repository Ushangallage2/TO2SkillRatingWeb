import type { Handler } from "@netlify/functions";
import { db } from "./_db";
import mysql from "mysql2/promise";

export const handler = async () => {
    console.log("=== leaderboard-skill invoked ===");
  
    try {
      console.log("ENV", {
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        db: process.env.DB_NAME,
        port: process.env.DB_PORT,
      });
  
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST!,
        user: process.env.DB_USERNAME!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_NAME!,
        port: Number(process.env.DB_PORT),
        ssl: {
          // Accept self-signed certificate
          rejectUnauthorized: false
        }
      });      
      
  
      console.log("DB connected");
  
      const [rows] = await connection.execute(
        `SELECT * FROM overall_player_skill_rating ORDER BY final_skill_rating DESC`
      );
  
      await connection.end();
  
      console.log("Rows:", rows);
  
      return {
        statusCode: 200,
        body: JSON.stringify(rows),
      };
    } catch (err: any) {
      console.error("FUNCTION ERROR:", err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err.message,
          stack: err.stack,
        }),
      };
    }
  };
  
