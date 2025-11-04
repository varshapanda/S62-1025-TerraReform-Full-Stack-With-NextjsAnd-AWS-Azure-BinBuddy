import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config({ path: ".env.local" });

interface RedisConfig {
  url: string;
}

export function defineRedisConfig(): RedisConfig {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("❌ Missing REDIS_URL");
  return { url };
}

// Create the actual client
const config = defineRedisConfig();
export const redis = new Redis(config.url);
