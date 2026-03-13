/**
 * Upstash Redis Client
 *
 * Singleton Redis client using @upstash/redis (HTTP-based, Edge-compatible).
 * Provides the base client plus domain-specific helpers for:
 *   - Session caching (Clerk sessions)
 *   - Rate limiting (IP + user)
 *   - Inventory locks (SET NX EX pattern)
 *   - Real-time presence (Pub/Sub-style via sorted sets)
 */

import { Redis } from "@upstash/redis";

// ─── Client Singleton ────────────────────────────────────────────────────────

function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      "[Redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. " +
        "Redis features will be disabled."
    );
    return null;
  }

  return new Redis({ url, token });
}

const globalForRedis = globalThis as unknown as {
  redis: Redis | null | undefined;
};

export const redis: Redis | null =
  globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// ─── Health Check ────────────────────────────────────────────────────────────

export async function pingRedis(): Promise<boolean> {
  if (!redis) return false;
  try {
    const result = await redis.ping();
    return result === "PONG";
  } catch (error) {
    console.error("[Redis] Ping failed:", error);
    return false;
  }
}

// ─── Session Cache ───────────────────────────────────────────────────────────

const SESSION_PREFIX = "session:";
const SESSION_TTL = 60 * 60; // 1 hour

/**
 * Cache a Clerk session payload in Redis.
 */
export async function cacheSession(
  sessionId: string,
  data: Record<string, unknown>,
  ttl: number = SESSION_TTL
): Promise<void> {
  if (!redis) return;
  await redis.set(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(data), {
    ex: ttl,
  });
}

/**
 * Retrieve a cached Clerk session.
 */
export async function getCachedSession(
  sessionId: string
): Promise<Record<string, unknown> | null> {
  if (!redis) return null;
  const raw = await redis.get<string>(`${SESSION_PREFIX}${sessionId}`);
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

/**
 * Invalidate a cached session.
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  if (!redis) return;
  await redis.del(`${SESSION_PREFIX}${sessionId}`);
}

// ─── Inventory Locks ─────────────────────────────────────────────────────────

const LOCK_PREFIX = "lock:";
const DEFAULT_LOCK_TTL = 30; // seconds

/**
 * Acquire an inventory lock using the SET NX EX pattern.
 *
 * @example
 *   const locked = await acquireInventoryLock("sku:IP15-LCD:lock");
 *   if (!locked) throw new Error("Item is being purchased by another user");
 *
 * @param sku      - Product SKU to lock
 * @param ttl      - Lock duration in seconds (default 30)
 * @param ownerId  - Unique identifier for the lock owner (e.g. session ID)
 * @returns true if the lock was acquired, false if already held
 */
export async function acquireInventoryLock(
  sku: string,
  ttl: number = DEFAULT_LOCK_TTL,
  ownerId: string = "1"
): Promise<boolean> {
  if (!redis) return true; // No Redis — allow operation
  const key = `${LOCK_PREFIX}${sku}`;
  const result = await redis.set(key, ownerId, { nx: true, ex: ttl });
  return result === "OK";
}

/**
 * Release an inventory lock. Only the owner can release it.
 */
export async function releaseInventoryLock(
  sku: string,
  ownerId: string = "1"
): Promise<boolean> {
  if (!redis) return true;
  const key = `${LOCK_PREFIX}${sku}`;
  const currentOwner = await redis.get<string>(key);
  if (currentOwner !== ownerId) return false;
  await redis.del(key);
  return true;
}

/**
 * Check whether an inventory lock is currently held.
 */
export async function isInventoryLocked(sku: string): Promise<boolean> {
  if (!redis) return false;
  const key = `${LOCK_PREFIX}${sku}`;
  const exists = await redis.exists(key);
  return exists === 1;
}

// ─── Real-Time Presence ──────────────────────────────────────────────────────

const PRESENCE_KEY = "presence:active_users";
const PRESENCE_TTL = 120; // Consider user inactive after 2 minutes

/**
 * Record a heartbeat for an active user. Uses a sorted set where the
 * score is the Unix timestamp of the last heartbeat.
 */
export async function recordPresence(userId: string): Promise<void> {
  if (!redis) return;
  const now = Math.floor(Date.now() / 1000);
  await redis.zadd(PRESENCE_KEY, { score: now, member: userId });
  // Clean up stale entries
  const cutoff = now - PRESENCE_TTL;
  await redis.zremrangebyscore(PRESENCE_KEY, 0, cutoff);
}

/**
 * Get the list of currently active user IDs.
 */
export async function getActiveUsers(): Promise<string[]> {
  if (!redis) return [];
  const cutoff = Math.floor(Date.now() / 1000) - PRESENCE_TTL;
  // Remove stale entries first
  await redis.zremrangebyscore(PRESENCE_KEY, 0, cutoff);
  // Return remaining members
  const members = await redis.zrange(PRESENCE_KEY, 0, -1);
  return members as string[];
}

/**
 * Get the count of currently active users.
 */
export async function getActiveUserCount(): Promise<number> {
  if (!redis) return 0;
  const cutoff = Math.floor(Date.now() / 1000) - PRESENCE_TTL;
  await redis.zremrangebyscore(PRESENCE_KEY, 0, cutoff);
  return await redis.zcard(PRESENCE_KEY);
}

/**
 * Remove a user from the presence set (e.g. on logout).
 */
export async function removePresence(userId: string): Promise<void> {
  if (!redis) return;
  await redis.zrem(PRESENCE_KEY, userId);
}

// ─── Generic Cache Helpers ───────────────────────────────────────────────────

/**
 * Get-or-set pattern: returns cached value or computes and caches it.
 */
export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  if (!redis) return fetcher();

  const cached = await redis.get<string>(key);
  if (cached !== null && cached !== undefined) {
    try {
      return typeof cached === "string" ? JSON.parse(cached) : cached;
    } catch {
      // Corrupted cache — re-fetch
    }
  }

  const fresh = await fetcher();
  await redis.set(key, JSON.stringify(fresh), { ex: ttl });
  return fresh;
}

/**
 * Invalidate one or more cache keys.
 */
export async function cacheInvalidate(...keys: string[]): Promise<void> {
  if (!redis || keys.length === 0) return;
  await redis.del(...keys);
}
