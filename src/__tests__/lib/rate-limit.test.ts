/**
 * Unit Tests — Rate Limiting
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted to create mock functions before vi.mock runs
const mockLimit = vi.hoisted(() => vi.fn());

vi.mock("@upstash/ratelimit", () => {
  const MockRatelimit = vi.fn(() => ({
    limit: mockLimit,
  }));
  // Add static methods
  (MockRatelimit as any).slidingWindow = vi.fn(() => "sliding-window-config");
  return { Ratelimit: MockRatelimit };
});

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(() => ({})),
}));

import { checkRateLimit } from "@/lib/rate-limit";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkRateLimit", () => {
  it("returns allowed=true when under limit", async () => {
    mockLimit.mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 95,
      reset: Date.now() + 60000,
    });

    // Create a mock limiter object
    const mockLimiter = { limit: mockLimit } as any;
    const result = await checkRateLimit("test-ip", mockLimiter);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(95);
  });

  it("returns allowed=false when over limit", async () => {
    mockLimit.mockResolvedValue({
      success: false,
      limit: 100,
      remaining: 0,
      reset: Date.now() + 60000,
    });

    const mockLimiter = { limit: mockLimit } as any;
    const result = await checkRateLimit("test-ip", mockLimiter);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("fails open when limiter is null", async () => {
    const result = await checkRateLimit("test-ip", null);
    expect(result.allowed).toBe(true);
  });

  it("fails open when limiter throws", async () => {
    mockLimit.mockRejectedValue(new Error("Redis down"));
    const mockLimiter = { limit: mockLimit } as any;
    const result = await checkRateLimit("test-ip", mockLimiter);
    expect(result.allowed).toBe(true);
  });
});
