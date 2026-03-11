/**
 * Real-Time Presence API
 *
 * POST /api/presence — Record a heartbeat for the current user
 * GET  /api/presence — Get the list of currently active users
 */

import { NextRequest, NextResponse } from "next/server";
import {
  recordPresence,
  getActiveUsers,
  getActiveUserCount,
  removePresence,
} from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId as string | undefined;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "MISSING_USER_ID", message: "userId is required" },
        },
        { status: 400 }
      );
    }

    await recordPresence(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Presence] Heartbeat error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to record presence" },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [users, count] = await Promise.all([
      getActiveUsers(),
      getActiveUserCount(),
    ]);

    return NextResponse.json({
      success: true,
      data: { users, count },
    });
  } catch (error) {
    console.error("[Presence] Fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch active users",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId as string | undefined;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "MISSING_USER_ID", message: "userId is required" },
        },
        { status: 400 }
      );
    }

    await removePresence(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Presence] Remove error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to remove presence",
        },
      },
      { status: 500 }
    );
  }
}
