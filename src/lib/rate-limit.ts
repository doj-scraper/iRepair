/**
 * Rate Limiting with @upstash/ratelimit
 *
 * Provides pre-configured rate limiters for different use cases:
 *   - IP-based:   100 requests per 60-second sliding window
 *   - User-based: 1000 requests per 60-second sliding window
 *   - Strict:     10 requests per 60 seconds (for sensitive endpoints)
 *
 * Falls back gracefully when Redis is not configured.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ─── Redis Instance ──────────────────────────────────────────────────────────

function getRatelimitRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redisInstance = getRatelimitRedis();

// ─── Rate Limiters ───────────────────────────────────────────────────────────

/**
 * IP-based rate limiter: 100 requests per 60-second sliding window.
 */
export const ipRateLimiter = redisInstance
  ? new Ratelimit({
      redis: redisInstance,
      limiter: Ratelimit.slidingWindow(100, "60 s"),
      prefix: "ratelimit:ip",
      analytics: true,
    })
  : null;

/**
 * User-based rate limiter: 1000 requests per 60-second sliding window.
 */
export const userRateLimiter = redisInstance
  ? new Ratelimit({
      redis: redisInstance,
      limiter: Ratelimit.slidingWindow(1000, "60 s"),
      prefix: "ratelimit:user",
      analytics: true,
    })
  : null;

/**
 * Strict rate limiter for sensitive endpoints (login, register, password reset):
 * 10 requests per 60-second window.
 */
export const strictRateLimiter = redisInstance
  ? new Ratelimit({
      redis: redisInstance,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      prefix: "ratelimit:strict",
      analytics: true,
    })
  : null;

// ─── Helper ──────────────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for a given identifier using the specified limiter.
 * Returns a standardised result object. Falls through if Redis is unavailable.
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit | null = ipRateLimiter
): Promise<RateLimitResult> {
  if (!limiter) {
    return { allowed: true, limit: 0, remaining: 0, reset: 0 };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      allowed: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error("[RateLimit] Check failed:", error);
    // Fail open
    return { allowed: true, limit: 0, remaining: 0, reset: 0 };
  }
}
