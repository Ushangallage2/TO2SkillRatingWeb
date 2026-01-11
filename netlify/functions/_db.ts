import mysql from "mysql2/promise";

export const db = mysql.createPool({
    host: process.env.DB_HOST!,
    user: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    port: Number(process.env.DB_PORT),
    ssl: {
      // Accept self-signed certificate
      rejectUnauthorized: false
    },
  waitForConnections: true,
  connectionLimit: 5,
});


