// Public price + availability quote for the checkout summary. Read-only.
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { handler, json, readJson, ApiError } from '@/lib/api';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { cartItemSchema } from '@/lib/validators';
import { buildOrderLines } from '@/lib/order-builder';
import { checkAvailability } from '@/lib/inventory';
import { parseDateOnly } from '@/utils/format';

const schema = z.object({
  items: z.array(cartItemSchema).min(1).max(100),
  rentalStartDate: z.string().optional(),
  rentalEndDate: z.string().optional(),
  source: z.enum(['cart', 'builder']).optional().default('cart'),
});

export const POST = handler(async (request) => {
  const limit = await rateLimit('quote', getClientIp(request), { limit: 90, windowSec: 60 });
  if (!limit.ok) throw new ApiError(429, 'rateLimited');
  const body = schema.parse(await readJson(request, 50_000));
  await connectDB();

  let start = parseDateOnly(body.rentalStartDate);
  let end = parseDateOnly(body.rentalEndDate);
  const hasDates = !!(start && end && end >= start && (end - start) / 86400000 < 31);
  if (!hasDates) {
    const now = new Date();
    start = end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  const built = await buildOrderLines(body.items, { start, end, source: body.source });
  let availability = null;
  if (hasDates) {
    const res = await checkAvailability(built.required, start, end);
    availability = { ok: res.ok, issues: res.issues.map((i) => ({ productId: i.productId, name: i.name, requested: i.requested, available: i.available })) };
  }

  return json({
    lines: built.orderItems.map((l) => ({ ...l, refId: String(l.refId), components: l.components?.map((c) => ({ ...c, product: String(c.product) })) })),
    totalAmount: built.totalAmount,
    rentalDays: built.rentalDays,
    orderType: built.orderType,
    availability,
  });
});
