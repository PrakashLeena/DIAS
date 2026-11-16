import { connectDB } from '@/lib/db';
import { adminHandler, json, readJson, ApiError } from '@/lib/api';
import { orderUpdateInput, objectId } from '@/lib/validators';
import { checkAvailability } from '@/lib/inventory';
import Order from '@/models/Order';

export const GET = adminHandler(async (request, ctx) => {
  const id = objectId.parse((await ctx.params).id);
  await connectDB();
  const item = await Order.findById(id).lean();
  if (!item) throw new ApiError(404, 'Not found');
  return json({ item });
});

// Status changes + customer-visible message + internal notes.
// The public tracking endpoint reads the same document, so changes are visible immediately.
export const PATCH = adminHandler(async (request, ctx) => {
  const id = objectId.parse((await ctx.params).id);
  const data = orderUpdateInput.parse(await readJson(request, 20_000));
  await connectDB();
  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, 'Not found');

  if (data.status && data.status !== order.status) {
    // Accepting reserves stock: re-validate against other ACCEPTED orders in the same period.
    if (data.status === 'accepted') {
      const required = new Map(order.inventoryLines.map((l) => [String(l.product), l.quantity]));
      const res = await checkAvailability(required, order.event.rentalStartDate, order.event.rentalEndDate, { excludeOrderId: order._id });
      if (!res.ok) {
        throw new ApiError(409, 'stockConflict', { issues: res.issues.map((i) => ({ productId: i.productId, name: i.name, requested: i.requested, available: i.available })) });
      }
    }
    order.status = data.status;
    order.statusHistory.push({ status: data.status, at: new Date(), note: 'Updated by admin' });
  }
  if (data.adminMessage !== undefined) order.adminMessage = data.adminMessage;
  if (data.internalNotes !== undefined) order.internalNotes = data.internalNotes;
  await order.save();
  return json({ item: order.toObject() });
});
