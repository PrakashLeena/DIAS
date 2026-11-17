// Fixed-window rate limiter backed by MongoDB so limits are shared across all
// serverless instances (an in-memory limiter would reset per instance on Vercel).
import crypto from 'node:crypto';
import { connectDB } from './db.js';
import RateLimit from '../models/RateLimit.js';

export function getClientIp(request) {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '0.0.0.0';
}

function hashKey(key) {
  // Store hashed keys so raw IP addresses are not persisted.
  return crypto.createHash('sha256').update(key).digest('base64url').slice(0, 32);
}

/**
 * @returns {Promise<{ ok: boolean, remaining: number, retryAfter: number }>}
 */
export async function rateLimit(name, identifier, { limit, windowSec }) {
  await connectDB();
  const now = new Date();
  const newExpiry = new Date(now.getTime() + windowSec * 1000);
  const key = `${name}:${hashKey(identifier)}`;
  const active = { $gt: ['$expiresAt', now] };
  let doc;
  try {
    doc = await RateLimit.collection.findOneAndUpdate(
      { key },
      [
        {
          $set: {
            count: { $cond: [active, { $add: ['$count', 1] }, 1] },
            expiresAt: { $cond: [active, '$expiresAt', newExpiry] },
          },
        },
      ],
      { upsert: true, returnDocument: 'after' }
    );
  } catch (err) {
    // A concurrent upsert can hit the unique index once; retry a single time.
    if (err?.code === 11000) {
      doc = await RateLimit.collection.findOneAndUpdate({ key }, { $inc: { count: 1 } }, { returnDocument: 'after' });
    } else {
      throw err;
    }
  }
  const count = doc?.count ?? 1;
  const retryAfter = Math.max(1, Math.ceil(((doc?.expiresAt?.getTime?.() ?? newExpiry.getTime()) - now.getTime()) / 1000));
  return { ok: count <= limit, remaining: Math.max(0, limit - count), retryAfter };
}

export async function resetRateLimit(name, identifier) {
  await connectDB();
  await RateLimit.deleteOne({ key: `${name}:${hashKey(identifier)}` });
}
