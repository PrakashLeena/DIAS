import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { handler, json, readJson, ApiError, assertSameOrigin } from '@/lib/api';
import { rateLimit, resetRateLimit, getClientIp } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/content-schema';
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from '@/lib/auth';
import Admin from '@/models/Admin';

// Dummy hash so unknown emails take as long as wrong passwords (no user enumeration by timing).
let DUMMY_HASH;
const dummyHash = () => (DUMMY_HASH ??= bcrypt.hashSync('not-a-real-password', 12));

export const POST = handler(async (request) => {
  assertSameOrigin(request);
  const ip = getClientIp(request);
  const ipLimit = await rateLimit('login-ip', ip, { limit: 20, windowSec: 900 });
  const parsed = loginSchema.safeParse(await readJson(request, 2_000));
  if (!parsed.success) throw new ApiError(400, 'invalid');
  const { email, password } = parsed.data;
  const accountLimit = await rateLimit('login-acct', email, { limit: 6, windowSec: 900 });
  if (!ipLimit.ok || !accountLimit.ok) {
    return json({ error: 'rateLimited' }, { status: 429, headers: { 'Retry-After': String(Math.max(ipLimit.retryAfter, accountLimit.retryAfter)) } });
  }

  await connectDB();
  const admin = await Admin.findOne({ email }).select('+passwordHash email name isActive');
  const ok = await bcrypt.compare(password, admin?.passwordHash || dummyHash());
  if (!admin || !admin.isActive || !ok) throw new ApiError(401, 'invalid');

  await resetRateLimit('login-acct', email);
  admin.lastLoginAt = new Date();
  await admin.save();

  const token = await createSessionToken(admin);
  const res = json({ ok: true, name: admin.name });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
});
