/**
 * Inventory Lock API
 *
 * POST   /api/inventory/lock — Acquire a lock on a SKU
 * DELETE /api/inventory/lock — Release a lock on a SKU
 * GET    /api/inventory/lock?sku=... — Check if a SKU is locked
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  acquireInventoryLock,
  releaseInventoryLock,
  isInventoryLocked,
} from "@/lib/redis";

const lockSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  ownerId: z.string().min(1, "Owner ID is required"),
  ttl: z.number().int().min(5).max(300).optional().default(30),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sku, ownerId, ttl } = lockSchema.parse(body);

    const acquired = await acquireInventoryLock(sku, ttl, ownerId);

    if (!acquired) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "LOCK_HELD",
            message: `SKU ${sku} is currently locked by another user`,
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { sku, locked: true, ttl },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", details: error.flatten() },
        },
        { status: 400 }
      );
    }
    console.error("[InventoryLock] Acquire error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to acquire lock" },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { sku, ownerId } = lockSchema.pick({ sku: true, ownerId: true }).parse(body);

    const released = await releaseInventoryLock(sku, ownerId);

    if (!released) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_OWNER",
            message: "You do not own this lock",
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { sku, locked: false },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", details: error.flatten() },
        },
        { status: 400 }
      );
    }
    console.error("[InventoryLock] Release error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to release lock" },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get("sku");

    if (!sku) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "MISSING_SKU", message: "sku query parameter is required" },
        },
        { status: 400 }
      );
    }

    const locked = await isInventoryLocked(sku);

    return NextResponse.json({
      success: true,
      data: { sku, locked },
    });
  } catch (error) {
    console.error("[InventoryLock] Check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to check lock" },
      },
      { status: 500 }
    );
  }
}
