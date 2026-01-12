// redis.ts
import Redis from "ioredis";

export function createRedis() {
  if (!process.env.REDIS_HOST) return null; // Redis not configured

  return new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === "true" ? {} : undefined,
    db: 0,
    maxRetriesPerRequest: 0, // important to fail fast
    enableReadyCheck: false,
    lazyConnect: true,       // don't connect until needed
  });
}
