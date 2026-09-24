import { NextResponse } from "next/server";

/**
 * Standard success response shape used across all API routes:
 * { success: true, ...data }
 */
export function apiSuccess(data = {}, init = {}) {
  return NextResponse.json({ success: true, ...data }, init);
}

/**
 * Standard error response shape used across all API routes:
 * { success: false, error: "message" }
 */
export function apiError(message, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * Wraps a route handler so unexpected exceptions always return a
 * consistent JSON error instead of leaking a stack trace or crashing
 * with a raw 500 HTML page.
 */
export function withErrorHandler(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error("API error:", err);
      return apiError("Something went wrong. Please try again.", 500);
    }
  };
}
