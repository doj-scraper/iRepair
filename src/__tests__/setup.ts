/**
 * Vitest Global Setup
 *
 * Configures testing-library matchers and global mocks.
 */

import "@testing-library/jest-dom";

// ─── Mock environment variables ──────────────────────────────────────────────

process.env.UPSTASH_REDIS_REST_URL = "https://test-redis.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
process.env.DATABASE_URL = "file:./test.db";
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_mock";
process.env.CLERK_SECRET_KEY = "sk_test_mock";

// ─── Mock fetch for tests that don't explicitly mock it ──────────────────────

// Keep a reference to the original fetch
const originalFetch = globalThis.fetch;

// Restore after each test
afterEach(() => {
  globalThis.fetch = originalFetch;
});

// ─── Suppress console noise in tests ─────────────────────────────────────────

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Suppress React act() warnings and known test noise
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (
      msg.includes("act(") ||
      msg.includes("Not implemented") ||
      msg.includes("Error: Uncaught")
    ) {
      return;
    }
    originalConsoleError(...args);
  };
  console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("act(")) return;
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
