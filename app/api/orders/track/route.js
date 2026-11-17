// Public order tracking. Returns ONLY what a customer needs to follow the order:
// no phone number, address, email or internal notes.
import { connectDB } from '@/lib/db';
import { handler, json, readJson, ApiError } from '@/lib/api';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { trackSchema } from '@/lib/validators';
import Order from '@/models/Order';

function maskName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] || '';
  return `${parts[0]} ${parts.slice(1).map((p) => `${[...p][0]}.`).join(' ')}`;
}

export const POST = handler(async (request) => {
  const ip = getClientIp(request);
  // Strict limit to make Order ID guessing impractical.
  const limit = await rateLimit('track', ip, { limit: 12, windowSec: 600 });
  if (!limit.ok) {
    return json({ error: 'rateLimited' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } });
  }
  const parsed = trackSchema.safeParse(await readJson(request, 2_000));
  if (!parsed.success) throw new ApiError(400, 'invalid');

  await connectDB();
  const order = await Order.findOne({ orderId: parsed.data.orderId })
    .select('orderId customer.fullName event.eventType event.eventDate event.rentalStartDate event.rentalEndDate orderItems.itemType orderItems.name orderItems.quantity orderItems.lineTotal orderType totalAmount status statusHistory adminMessage createdAt')
    .lean();
  if (!order) throw new ApiError(404, 'notFound');

  return json({
    orderId: order.orderId,
    customerName: maskName(order.customer?.fullName),
    eventType: order.event?.eventType,
    eventDate: order.event?.eventDate,
    rentalStartDate: order.event?.rentalStartDate,
    rentalEndDate: order.event?.rentalEndDate,
    orderType: order.orderType,
    items: (order.orderItems || []).map((i) => ({ itemType: i.itemType, name: i.name, quantity: i.quantity, lineTotal: i.lineTotal })),
    totalAmount: order.totalAmount,
    status: order.status,
    history: (order.statusHistory || []).map((h) => ({ status: h.status, at: h.at })),
    adminMessage: order.adminMessage || '',
    createdAt: order.createdAt,
  });
});
