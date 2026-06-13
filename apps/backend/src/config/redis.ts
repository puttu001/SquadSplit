import { createClient } from 'redis';
import { env } from './env';

export const redis = createClient({ url: env.REDIS_URL });

redis.on('error', (err) => console.error('Redis client error:', err));
redis.on('connect', () => console.log('Redis connected'));

export async function connectRedis() {
  await redis.connect();
}

export async function disconnectRedis() {
  await redis.disconnect();
}
