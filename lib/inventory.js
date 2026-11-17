// Rental inventory availability.
//
// available(product, period) = totalQuantity
//                              - blockedQuantity (damaged / maintenance, set by admin)
//                              - quantities held by ACCEPTED orders whose rental period overlaps
//
// Pending orders are requests only and do not reduce inventory. Completed orders
// have returned their items and cancelled orders were released, so neither holds stock.
import mongoose from 'mongoose';
import Order, { RESERVING_STATUSES } from '../models/Order.js';
import Product from '../models/Product.js';

/**
 * Returns Map<productId, reservedQty> for accepted orders overlapping [start, end].
 * @param {Date} start @param {Date} end @param {string[]} productIds @param {string} [excludeOrderId] Mongo _id to ignore
 */
export async function getReservedQuantities(start, end, productIds = null, excludeOrderId = null) {
  const match = {
    status: { $in: RESERVING_STATUSES },
    'event.rentalStartDate': { $lte: end },
    'event.rentalEndDate': { $gte: start },
  };
  if (excludeOrderId) match._id = { $ne: new mongoose.Types.ObjectId(String(excludeOrderId)) };
  const pipeline = [{ $match: match }, { $unwind: '$inventoryLines' }];
  if (productIds?.length) {
    pipeline.push({ $match: { 'inventoryLines.product': { $in: productIds.map((id) => new mongoose.Types.ObjectId(String(id))) } } });
  }
  pipeline.push({ $group: { _id: '$inventoryLines.product', reserved: { $sum: '$inventoryLines.quantity' } } });
  const rows = await Order.aggregate(pipeline);
  return new Map(rows.map((r) => [String(r._id), r.reserved]));
}

/**
 * Checks whether the required quantities are available for the period.
 * @param {Map<string, number>} required productId -> quantity
 * @returns {Promise<{ ok: boolean, issues: Array<{ productId, name, requested, available }> , products: Map }>}
 */
export async function checkAvailability(required, start, end, { excludeOrderId = null } = {}) {
  const ids = [...required.keys()];
  const products = await Product.find({ _id: { $in: ids } })
    .select('name totalQuantity blockedQuantity isAvailable isPublished')
    .lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));
  const reserved = await getReservedQuantities(start, end, ids, excludeOrderId);
  const issues = [];
  for (const [id, qty] of required) {
    const p = byId.get(id);
    if (!p || !p.isAvailable) {
      issues.push({ productId: id, name: p?.name || { ta: '', en: '' }, requested: qty, available: 0 });
      continue;
    }
    const available = Math.max(0, (p.totalQuantity || 0) - (p.blockedQuantity || 0) - (reserved.get(id) || 0));
    if (qty > available) issues.push({ productId: id, name: p.name, requested: qty, available });
  }
  return { ok: issues.length === 0, issues, products: byId };
}

/** Inventory overview for the admin dashboard. */
export async function getInventoryReport(start, end) {
  const products = await Product.find({})
    .select('name slug category totalQuantity blockedQuantity isAvailable isPublished pricingUnit images')
    .populate('category', 'name')
    .sort({ category: 1, sortOrder: 1, 'name.en': 1 })
    .lean();
  const reserved = await getReservedQuantities(start, end);
  return products.map((p) => {
    const r = reserved.get(String(p._id)) || 0;
    return {
      ...p,
      reserved: r,
      available: Math.max(0, (p.totalQuantity || 0) - (p.blockedQuantity || 0) - r),
    };
  });
}
