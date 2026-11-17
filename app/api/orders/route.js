// Public order submission (guest checkout — no account required).
// Every price, quantity and availability figure is recomputed on the server.
import { connectDB } from '@/lib/db';
import { handler, json, readJson, ApiError, assertSameOrigin } from '@/lib/api';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { orderSchema } from '@/lib/validators';
import { buildOrderLines } from '@/lib/order-builder';
import { checkAvailability } from '@/lib/inventory';
import { generateOrderId } from '@/lib/order-id';
import { parseDateOnly } from '@/utils/format';
import Order from '@/models/Order';
import WebsiteSettings from '@/models/WebsiteSettings';

export const POST = handler(async (request) => {
  assertSameOrigin(request);
  const ip = getClientIp(request);
  const limit = await rateLimit('order', ip, { limit: 8, windowSec: 600 });
  if (!limit.ok) throw new ApiError(429, 'rateLimited');

  const body = orderSchema.parse(await readJson(request, 60_000));
  if (body.website) throw new ApiError(400, 'generic'); // honeypot filled -> bot

  await connectDB();
  const start = parseDateOnly(body.event.rentalStartDate);
  const end = parseDateOnly(body.event.rentalEndDate);
  const eventDate = parseDateOnly(body.event.eventDate);
  if (!start || !end || !eventDate) throw new ApiError(400, 'required');

  const built = await buildOrderLines(body.items, { start, end, source: body.source });

  // Server-side inventory validation against ACCEPTED orders in the same period.
  const availability = await checkAvailability(built.required, start, end);
  if (!availability.ok) {
    throw new ApiError(409, 'insufficientStock', {
      issues: availability.issues.map((i) => ({ productId: i.productId, name: i.name, requested: i.requested, available: i.available })),
    });
  }

  const settings = await WebsiteSettings.findOne({ key: 'main' }).select('currency').lean();
  const base = {
    customer: body.customer,
    event: { ...body.event, eventDate, rentalStartDate: start, rentalEndDate: end },
    orderItems: built.orderItems,
    inventoryLines: built.inventoryLines,
    orderType: built.orderType,
    rentalDays: built.rentalDays,
    totalAmount: built.totalAmount,
    currency: settings?.currency?.code || 'LKR',
    status: 'pending',
    statusHistory: [{ status: 'pending', at: new Date(), note: 'Order placed' }],
    language: body.language,
  };

  // Unique Order ID — retry on the (very unlikely) collision with the unique index.
  let order;
  for (let attempt = 0; attempt < 5 && !order; attempt++) {
    try {
      order = await Order.create({ ...base, orderId: generateOrderId() });
    } catch (err) {
      if (err?.code !== 11000 || !String(err?.message).includes('orderId')) throw err;
    }
  }
  if (!order) throw new ApiError(500, 'generic');

  return json({ orderId: order.orderId, status: order.status, totalAmount: order.totalAmount }, { status: 201 });
});
