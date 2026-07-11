import Redis from 'ioredis';
import { config } from '../config';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(config.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
  }
  return redis;
}

export function setRedis(client: Redis): void {
  redis = client;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedis();
  try {
    await client.connect().catch(() => undefined);
    const value = await client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  const client = getRedis();
  try {
    await client.connect().catch(() => undefined);
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // Cache is best-effort
  }
}

export async function cacheDel(key: string): Promise<void> {
  const client = getRedis();
  try {
    await client.connect().catch(() => undefined);
    await client.del(key);
  } catch {
    // Cache is best-effort
  }
}

export async function destroyRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
