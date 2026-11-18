import { connectDB } from '@/lib/db';
import { handler, json, readJson, ApiError, assertSameOrigin } from '@/lib/api';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { reviewSchema } from '@/lib/content-schema';
import { toReview, refreshReviews } from '@/lib/content';
import WebsiteSettings from '@/models/WebsiteSettings';

// Public: anyone can write a review. Rate limited + honeypot; stored newest-first (max 100 kept).
export const POST = handler(async (request) => {
  assertSameOrigin(request);
  const limit = await rateLimit('review-ip', getClientIp(request), { limit: 5, windowSec: 3600 });
  if (!limit.ok) return json({ error: 'rateLimited' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } });
  const parsed = reviewSchema.safeParse(await readJson(request, 5_000));
  if (!parsed.success) throw new ApiError(400, 'invalid');
  const { name, rating, message, website } = parsed.data;
  if (website) return json({ ok: true }); // bot: pretend success, store nothing

  await connectDB();
  const doc = await WebsiteSettings.findOneAndUpdate(
    { key: 'main' },
    { $push: { testimonials: { $each: [{ name, rating, message, createdAt: new Date() }], $position: 0, $slice: 100 } } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  refreshReviews();
  return json({ ok: true, review: toReview(doc.testimonials[0]) }, { status: 201 });
});
