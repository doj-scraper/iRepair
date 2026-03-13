/**
 * Health Check API
 *
 * GET /api/health — Returns the status of all services
 */

import { NextResponse } from "next/server";
import { pingRedis } from "@/lib/redis";
import { db } from "@/lib/db";

export async function GET() {
  const checks: Record<string, { status: string; latency?: number }> = {};

  // Check Redis
  const redisStart = Date.now();
  try {
    const redisOk = await pingRedis();
    checks.redis = {
      status: redisOk ? "healthy" : "unavailable",
      latency: Date.now() - redisStart,
    };
  } catch {
    checks.redis = {
      status: "error",
      latency: Date.now() - redisStart,
    };
  }

  // Check Database (Prisma)
  const dbStart = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = {
      status: "healthy",
      latency: Date.now() - dbStart,
    };
  } catch {
    checks.database = {
      status: "error",
      latency: Date.now() - dbStart,
    };
  }

  const allHealthy = Object.values(checks).every(
    (c) => c.status === "healthy"
  );

  return NextResponse.json(
    {
      success: true,
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? "unknown",
      checks,
    },
    { status: allHealthy ? 200 : 503 }
  );
}
