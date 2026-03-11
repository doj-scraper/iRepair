/**
 * API Validation Middleware
 *
 * Provides a reusable pattern for validating incoming API request bodies,
 * query parameters, and route parameters using Zod schemas. Returns
 * standardised JSON error responses on validation failure.
 */

import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema } from "zod";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ValidatedRequest<TBody = unknown, TQuery = unknown> {
  body: TBody;
  query: TQuery;
}

interface ValidationSchemas<TBody = unknown, TQuery = unknown> {
  body?: ZodSchema<TBody>;
  query?: ZodSchema<TQuery>;
}

type ApiHandler<TBody = unknown, TQuery = unknown> = (
  request: NextRequest,
  validated: ValidatedRequest<TBody, TQuery>,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>;

// ─── Error Formatting ────────────────────────────────────────────────────────

function formatZodError(error: z.ZodError) {
  return {
    success: false as const,
    error: {
      code: "VALIDATION_ERROR",
      message: "Request validation failed",
      details: error.flatten(),
    },
  };
}

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * Wraps an API route handler with Zod validation for body and/or query params.
 *
 * @example
 * ```ts
 * import { withValidation } from "@/lib/api-validation";
 * import { productAdminSchema } from "@/lib/validations";
 *
 * export const POST = withValidation(
 *   { body: productAdminSchema },
 *   async (req, { body }) => {
 *     // body is fully typed and validated
 *     return NextResponse.json({ success: true, data: body });
 *   }
 * );
 * ```
 */
export function withValidation<TBody = unknown, TQuery = unknown>(
  schemas: ValidationSchemas<TBody, TQuery>,
  handler: ApiHandler<TBody, TQuery>
) {
  return async (
    request: NextRequest,
    context?: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    try {
      let body: TBody = undefined as TBody;
      let query: TQuery = undefined as TQuery;

      // Validate request body
      if (schemas.body) {
        try {
          const rawBody = await request.json();
          body = schemas.body.parse(rawBody);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(formatZodError(error), { status: 400 });
          }
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "INVALID_JSON",
                message: "Request body must be valid JSON",
              },
            },
            { status: 400 }
          );
        }
      }

      // Validate query parameters
      if (schemas.query) {
        const { searchParams } = new URL(request.url);
        const queryObj: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          queryObj[key] = value;
        });
        try {
          query = schemas.query.parse(queryObj);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(formatZodError(error), { status: 400 });
          }
          throw error;
        }
      }

      return handler(request, { body, query }, context);
    } catch (error) {
      console.error("Unhandled API error:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "An unexpected error occurred",
          },
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Standalone body validation helper for use inside existing route handlers.
 *
 * @returns The parsed data or a NextResponse with a 400 error.
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T | NextResponse> {
  try {
    const rawBody = await request.json();
    return schema.parse(rawBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(formatZodError(error), { status: 400 });
    }
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON",
        },
      },
      { status: 400 }
    );
  }
}

/**
 * Standalone query-params validation helper.
 */
export function validateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T | NextResponse {
  const { searchParams } = new URL(request.url);
  const queryObj: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    queryObj[key] = value;
  });
  try {
    return schema.parse(queryObj);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(formatZodError(error), { status: 400 });
    }
    throw error;
  }
}
