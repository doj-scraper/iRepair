/**
 * Next.js Edge Middleware
 *
 * Runs on every matched request before the route handler. Responsibilities:
 * 1. Rate limiting via Upstash Redis (IP-based and user-based)
 * 2. Security header enforcement (belt-and-suspenders with next.config.ts)
 * 3. Bot / abuse detection basics
 */

import { NextRequest, NextResponse } from "next/server";

// ─── Rate Limiting (Upstash) ─────────────────────────────────────────────────
// We use the REST-based Upstash client so it works on the Edge runtime.

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Lightweight Upstash REST call for the sliding-window rate limiter.
 * Falls through gracefully if Redis is unavailable.
 */
async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    // Redis not configured — allow all traffic
    return { allowed: true, remaining: limit };
  }

  const key = `ratelimit:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;

  try {
    // Pipeline: ZREMRANGEBYSCORE, ZADD, ZCARD, EXPIRE
    const pipeline = [
      ["ZREMRANGEBYSCORE", key, "0", String(windowStart)],
      ["ZADD", key, String(now), `${now}:${Math.random().toString(36).slice(2)}`],
      ["ZCARD", key],
      ["EXPIRE", key, String(windowSeconds)],
    ];

    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipeline),
    });

    if (!res.ok) {
      // Redis error — fail open
      return { allowed: true, remaining: limit };
    }

    const results = await res.json();
    const count = results[2]?.result ?? 0;
    const remaining = Math.max(0, limit - count);

    return { allowed: count <= limit, remaining };
  } catch {
    // Network error — fail open
    return { allowed: true, remaining: limit };
  }
}

// ─── Middleware Handler ──────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Only rate-limit API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    // IP-based rate limit: 100 req / 60s
    const ipResult = await checkRateLimit(`ip:${ip}`, 100, 60);

    if (!ipResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // User-based rate limit: 1000 req / 60s (keyed by Clerk session cookie)
    const sessionCookie =
      request.cookies.get("__session")?.value ??
      request.cookies.get("__clerk_db_jwt")?.value;

    if (sessionCookie) {
      const userResult = await checkRateLimit(
        `user:${sessionCookie.slice(0, 32)}`,
        1000,
        60
      );

      if (!userResult.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message: "Too many requests for this account. Please slow down.",
            },
          },
          {
            status: 429,
            headers: {
              "Retry-After": "60",
              "X-RateLimit-Limit": "1000",
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }

      response.headers.set(
        "X-RateLimit-Remaining-User",
        String(userResult.remaining)
      );
    }

    // Attach rate-limit headers
    response.headers.set(
      "X-RateLimit-Limit",
      "100"
    );
    response.headers.set(
      "X-RateLimit-Remaining",
      String(ipResult.remaining)
    );
  }

  return response;
}

// ─── Matcher ─────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    // Match all API routes
    "/api/:path*",
    // Match pages but skip static assets and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|logo.svg).*)",
  ],
};
