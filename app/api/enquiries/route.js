// Public consultation request (homepage booking form). Rate limited and validated.
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { handler, json, readJson, ApiError, assertSameOrigin } from '@/lib/api';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { phoneSchema } from '@/lib/validators';
import { parseDateOnly } from '@/utils/format';
import Enquiry from '@/models/Enquiry';

const clean = (max) => z.string().max(max).transform((s) => s.replace(/<[^>]*>/g, '').trim());

const schema = z.object({
  name: clean(120).refine((s) => s.length >= 2),
  phone: phoneSchema,
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  eventType: z.enum(['wedding', 'reception', 'engagement', 'housewarming', 'birthday', 'corporate']).default('wedding'),
  venue: clean(500).optional().default(''),
  guests: z.coerce.number().int().min(1).max(100000).optional(),
  notes: clean(1500).optional().default(''),
  flora: z.string().trim().regex(/^[a-z0-9-]{1,20}$/).optional(), // colour option keys come from Admin → 3D Design
  language: z.enum(['ta', 'en']).optional().default('ta'),
  website: z.string().max(0).optional(), // honeypot
});

export const POST = handler(async (request) => {
  assertSameOrigin(request);
  const limit = await rateLimit('enquiry', getClientIp(request), { limit: 5, windowSec: 600 });
  if (!limit.ok) throw new ApiError(429, 'rateLimited');
  const data = schema.parse(await readJson(request, 10_000));
  const eventDate = parseDateOnly(data.eventDate);
  const now = new Date();
  if (!eventDate || eventDate < new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 86400000)) throw new ApiError(400, 'pastDate');
  await connectDB();
  const { website, ...rest } = data;
  await Enquiry.create({ ...rest, eventDate });
  return json({ ok: true }, { status: 201 });
});
