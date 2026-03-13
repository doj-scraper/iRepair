/**
 * Unit Tests — API Validation Middleware
 */

import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { z } from "zod";
import { withValidation, validateBody, validateQuery } from "@/lib/api-validation";

// ─── Helper to create mock NextRequest ───────────────────────────────────────

function createMockRequest(
  url: string,
  options?: { method?: string; body?: unknown }
): NextRequest {
  const init: RequestInit = {
    method: options?.method ?? "POST",
  };
  if (options?.body) {
    init.body = JSON.stringify(options.body);
    init.headers = { "Content-Type": "application/json" };
  }
  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

// ─── Schemas for testing ─────────────────────────────────────────────────────

const testBodySchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(0),
});

const testQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

// ─── withValidation ──────────────────────────────────────────────────────────

describe("withValidation", () => {
  it("passes validated body to handler", async () => {
    const handler = vi.fn().mockImplementation(async (_req, { body }) => {
      return new Response(JSON.stringify({ success: true, data: body }), {
        status: 200,
      });
    });

    const wrappedHandler = withValidation(
      { body: testBodySchema },
      handler
    );

    const req = createMockRequest("http://localhost:3000/api/test", {
      body: { name: "John", age: 25 },
    });

    const res = await wrappedHandler(req);
    expect(handler).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("returns 400 for invalid body", async () => {
    const handler = vi.fn();
    const wrappedHandler = withValidation(
      { body: testBodySchema },
      handler
    );

    const req = createMockRequest("http://localhost:3000/api/test", {
      body: { name: "", age: -1 },
    });

    const res = await wrappedHandler(req);
    expect(res.status).toBe(400);
    expect(handler).not.toHaveBeenCalled();

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for invalid JSON", async () => {
    const handler = vi.fn();
    const wrappedHandler = withValidation(
      { body: testBodySchema },
      handler
    );

    // Create a request with non-JSON body
    const req = new NextRequest(
      new URL("http://localhost:3000/api/test"),
      {
        method: "POST",
        body: "not json",
        headers: { "Content-Type": "text/plain" },
      }
    );

    const res = await wrappedHandler(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("INVALID_JSON");
  });

  it("validates query parameters", async () => {
    const handler = vi.fn().mockImplementation(async (_req, { query }) => {
      return new Response(JSON.stringify({ success: true, data: query }), {
        status: 200,
      });
    });

    const wrappedHandler = withValidation(
      { query: testQuerySchema },
      handler
    );

    const req = createMockRequest(
      "http://localhost:3000/api/test?page=1&limit=20",
      { method: "GET" }
    );

    const res = await wrappedHandler(req);
    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalled();
  });
});

// ─── validateBody ────────────────────────────────────────────────────────────

describe("validateBody", () => {
  it("returns parsed data for valid body", async () => {
    const req = createMockRequest("http://localhost:3000/api/test", {
      body: { name: "Jane", age: 30 },
    });

    const result = await validateBody(req, testBodySchema);
    expect(result).toEqual({ name: "Jane", age: 30 });
  });

  it("returns NextResponse for invalid body", async () => {
    const req = createMockRequest("http://localhost:3000/api/test", {
      body: { name: "", age: "not a number" },
    });

    const result = await validateBody(req, testBodySchema);
    // Should be a Response object
    expect(result).toHaveProperty("status");
  });
});

// ─── validateQuery ───────────────────────────────────────────────────────────

describe("validateQuery", () => {
  it("returns parsed query params", () => {
    const req = createMockRequest(
      "http://localhost:3000/api/test?page=2&limit=10",
      { method: "GET" }
    );

    const result = validateQuery(req, testQuerySchema);
    expect(result).toEqual({ page: "2", limit: "10" });
  });
});
