/**
 * Unit Tests — Environment Variable Loading
 *
 * Verifies that all required environment variables are defined
 * and have the expected format.
 */

import { describe, it, expect } from "vitest";

describe("Environment Variables", () => {
  it("has DATABASE_URL set", () => {
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(process.env.DATABASE_URL!.length).toBeGreaterThan(0);
  });

  it("has UPSTASH_REDIS_REST_URL set", () => {
    expect(process.env.UPSTASH_REDIS_REST_URL).toBeDefined();
    expect(process.env.UPSTASH_REDIS_REST_URL).toContain("https://");
  });

  it("has UPSTASH_REDIS_REST_TOKEN set", () => {
    expect(process.env.UPSTASH_REDIS_REST_TOKEN).toBeDefined();
    expect(process.env.UPSTASH_REDIS_REST_TOKEN!.length).toBeGreaterThan(0);
  });

  it("has NODE_ENV set", () => {
    expect(process.env.NODE_ENV).toBeDefined();
    expect(["development", "test", "production"]).toContain(
      process.env.NODE_ENV
    );
  });

  it("has Clerk keys set", () => {
    expect(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBeDefined();
    expect(process.env.CLERK_SECRET_KEY).toBeDefined();
  });
});
