// Shared helpers for Route Handlers: JSON responses, error handling, request
// parsing, CSRF origin checks and admin authorization.
import { NextResponse } from 'next/server';
import { getAdminSession } from './admin-session.js';

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function json(data, init = {}) {
  return NextResponse.json(data, { ...init, headers: { 'Cache-Control': 'no-store', ...(init.headers || {}) } });
}

export function errorResponse(err) {
  if (err instanceof ApiError) {
    return json({ error: err.message, details: err.details }, { status: err.status });
  }
  if (err?.name === 'ZodError') {
    return json({ error: 'Validation failed', details: err.issues?.map((i) => ({ path: i.path.join('.'), message: i.message })) }, { status: 400 });
  }
  if (err?.name === 'ValidationError') {
    return json({ error: 'Validation failed', details: Object.values(err.errors || {}).map((e) => ({ path: e.path, message: e.message })) }, { status: 400 });
  }
  if (err?.name === 'CastError') return json({ error: 'Invalid identifier' }, { status: 400 });
  if (err?.code === 11000) return json({ error: 'A record with the same unique value already exists' }, { status: 409 });
  console.error('[api] unexpected error:', err);
  return json({ error: 'Internal server error' }, { status: 500 });
}

/** Wraps a route handler with uniform error handling. */
export function handler(fn) {
  return async (request, ctx) => {
    try {
      return await fn(request, ctx);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export async function readJson(request, maxBytes = 200_000) {
  const len = Number(request.headers.get('content-length') || 0);
  if (len > maxBytes) throw new ApiError(413, 'Request body too large');
  const text = await request.text();
  if (text.length > maxBytes) throw new ApiError(413, 'Request body too large');
  try {
    return JSON.parse(text || '{}');
  } catch {
    throw new ApiError(400, 'Invalid JSON body');
  }
}

/** Rejects cross-site state-changing requests (defence in depth on top of SameSite cookies). */
export function assertSameOrigin(request) {
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return;
  const origin = request.headers.get('origin');
  if (!origin) return; // non-browser clients; still need a valid session for admin routes
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  let originHost;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new ApiError(403, 'Invalid origin');
  }
  if (originHost !== host) throw new ApiError(403, 'Cross-origin request blocked');
}

/** Authoritative admin check for API routes. */
export async function requireAdmin(request) {
  assertSameOrigin(request);
  const session = await getAdminSession();
  if (!session) throw new ApiError(401, 'Unauthorized');
  return session;
}

export function adminHandler(fn) {
  return handler(async (request, ctx) => {
    const admin = await requireAdmin(request);
    return fn(request, ctx, admin);
  });
}
