/**
 * Unit Tests — Redis Utilities
 *
 * Tests the Redis helper functions with mocked @upstash/redis client.
 * Verifies session cache, inventory locks, and presence logic.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock @upstash/redis before importing the module ─────────────────────────

// Use vi.hoisted so the mock object is available when vi.mock factory runs
const mockRedis = vi.hoisted(() => ({
  ping: vi.fn(),
  set: vi.fn(),
  get: vi.fn(),
  del: vi.fn(),
  exists: vi.fn(),
  zadd: vi.fn(),
  zrange: vi.fn(),
  zcard: vi.fn(),
  zremrangebyscore: vi.fn(),
  zrem: vi.fn(),
}));

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(() => mockRedis),
}));

// Now import the module under test
import {
  cacheSession,
  getCachedSession,
  invalidateSession,
  acquireInventoryLock,
  releaseInventoryLock,
  isInventoryLocked,
  recordPresence,
  getActiveUsers,
  getActiveUserCount,
  removePresence,
  pingRedis,
} from "@/lib/redis";

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Ping ────────────────────────────────────────────────────────────────────

describe("pingRedis", () => {
  it("returns true when Redis responds with PONG", async () => {
    mockRedis.ping.mockResolvedValue("PONG");
    const result = await pingRedis();
    expect(result).toBe(true);
  });

  it("returns false when Redis throws", async () => {
    mockRedis.ping.mockRejectedValue(new Error("Connection refused"));
    const result = await pingRedis();
    expect(result).toBe(false);
  });
});

// ─── Session Cache ───────────────────────────────────────────────────────────

describe("Session Cache", () => {
  it("caches a session with TTL", async () => {
    mockRedis.set.mockResolvedValue("OK");
    await cacheSession("sess_123", { userId: "user_1", role: "admin" });
    expect(mockRedis.set).toHaveBeenCalledWith(
      "session:sess_123",
      expect.any(String),
      { ex: 3600 }
    );
  });

  it("retrieves a cached session", async () => {
    const sessionData = { userId: "user_1", role: "admin" };
    mockRedis.get.mockResolvedValue(JSON.stringify(sessionData));
    const result = await getCachedSession("sess_123");
    expect(result).toEqual(sessionData);
  });

  it("returns null for missing session", async () => {
    mockRedis.get.mockResolvedValue(null);
    const result = await getCachedSession("sess_missing");
    expect(result).toBeNull();
  });

  it("invalidates a session", async () => {
    mockRedis.del.mockResolvedValue(1);
    await invalidateSession("sess_123");
    expect(mockRedis.del).toHaveBeenCalledWith("session:sess_123");
  });
});

// ─── Inventory Locks ─────────────────────────────────────────────────────────

describe("Inventory Locks", () => {
  it("acquires a lock with SET NX EX pattern", async () => {
    mockRedis.set.mockResolvedValue("OK");
    const acquired = await acquireInventoryLock("IP15-LCD", 30, "owner_1");
    expect(acquired).toBe(true);
    expect(mockRedis.set).toHaveBeenCalledWith(
      "lock:IP15-LCD",
      "owner_1",
      { nx: true, ex: 30 }
    );
  });

  it("returns false when lock is already held", async () => {
    mockRedis.set.mockResolvedValue(null);
    const acquired = await acquireInventoryLock("IP15-LCD", 30, "owner_2");
    expect(acquired).toBe(false);
  });

  it("releases a lock when owner matches", async () => {
    mockRedis.get.mockResolvedValue("owner_1");
    mockRedis.del.mockResolvedValue(1);
    const released = await releaseInventoryLock("IP15-LCD", "owner_1");
    expect(released).toBe(true);
    expect(mockRedis.del).toHaveBeenCalledWith("lock:IP15-LCD");
  });

  it("refuses to release a lock for wrong owner", async () => {
    mockRedis.get.mockResolvedValue("owner_1");
    const released = await releaseInventoryLock("IP15-LCD", "owner_2");
    expect(released).toBe(false);
    expect(mockRedis.del).not.toHaveBeenCalled();
  });

  it("checks if a SKU is locked", async () => {
    mockRedis.exists.mockResolvedValue(1);
    const locked = await isInventoryLocked("IP15-LCD");
    expect(locked).toBe(true);
  });

  it("returns false for unlocked SKU", async () => {
    mockRedis.exists.mockResolvedValue(0);
    const locked = await isInventoryLocked("IP15-LCD");
    expect(locked).toBe(false);
  });
});

// ─── Presence ────────────────────────────────────────────────────────────────

describe("Real-Time Presence", () => {
  it("records a heartbeat", async () => {
    mockRedis.zadd.mockResolvedValue(1);
    mockRedis.zremrangebyscore.mockResolvedValue(0);
    await recordPresence("user_1");
    expect(mockRedis.zadd).toHaveBeenCalledWith(
      "presence:active_users",
      expect.objectContaining({ member: "user_1" })
    );
  });

  it("gets active users", async () => {
    mockRedis.zremrangebyscore.mockResolvedValue(0);
    mockRedis.zrange.mockResolvedValue(["user_1", "user_2"]);
    const users = await getActiveUsers();
    expect(users).toEqual(["user_1", "user_2"]);
  });

  it("gets active user count", async () => {
    mockRedis.zremrangebyscore.mockResolvedValue(0);
    mockRedis.zcard.mockResolvedValue(5);
    const count = await getActiveUserCount();
    expect(count).toBe(5);
  });

  it("removes a user from presence", async () => {
    mockRedis.zrem.mockResolvedValue(1);
    await removePresence("user_1");
    expect(mockRedis.zrem).toHaveBeenCalledWith(
      "presence:active_users",
      "user_1"
    );
  });
});
