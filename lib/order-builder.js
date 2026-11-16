// Builds a priced order from cart items using ONLY server-side data, so a
// customer can never influence prices or skip availability checks.
import Product from '../models/Product.js';
import Package from '../models/Package.js';
import { ApiError } from './api.js';
import { rentalDaysBetween } from '../utils/format.js';

export function lineTotalFor(unitPrice, quantity, pricingUnit, rentalDays) {
  const multiplier = pricingUnit === 'per_day' ? Math.max(1, rentalDays) : 1;
  return Math.round(unitPrice * quantity * multiplier);
}

/**
 * @param {Array<{type:'product'|'package', id:string, quantity:number}>} items
 * @param {{ start: Date, end: Date, source?: string }} opts
 */
export async function buildOrderLines(items, { start, end, source = 'cart' }) {
  const rentalDays = rentalDaysBetween(start, end);

  // Merge duplicate cart lines.
  const merged = new Map();
  for (const it of items) {
    const key = `${it.type}:${it.id}`;
    merged.set(key, { ...it, quantity: (merged.get(key)?.quantity || 0) + it.quantity });
  }
  const productIds = [...merged.values()].filter((i) => i.type === 'product').map((i) => i.id);
  const packageIds = [...merged.values()].filter((i) => i.type === 'package').map((i) => i.id);

  const [products, packages] = await Promise.all([
    productIds.length ? Product.find({ _id: { $in: productIds } }).lean() : [],
    packageIds.length ? Package.find({ _id: { $in: packageIds } }).populate('items.product', 'name isAvailable isPublished').lean() : [],
  ]);
  const productMap = new Map(products.map((p) => [String(p._id), p]));
  const packageMap = new Map(packages.map((p) => [String(p._id), p]));

  const orderItems = [];
  const required = new Map(); // productId -> qty for inventory checks
  const unavailable = [];
  const addRequired = (id, qty) => required.set(String(id), (required.get(String(id)) || 0) + qty);

  for (const it of merged.values()) {
    if (it.type === 'product') {
      const p = productMap.get(it.id);
      if (!p || !p.isPublished || !p.isAvailable) {
        unavailable.push({ type: 'product', id: it.id, name: p?.name });
        continue;
      }
      const quantity = Math.max(it.quantity, p.minOrderQuantity || 1);
      orderItems.push({
        itemType: 'product',
        refId: p._id,
        slug: p.slug,
        name: p.name,
        image: p.images?.[0] || '',
        quantity,
        unitPrice: p.rentalPrice,
        pricingUnit: p.pricingUnit,
        rentalDays,
        lineTotal: lineTotalFor(p.rentalPrice, quantity, p.pricingUnit, rentalDays),
      });
      addRequired(p._id, quantity);
    } else {
      const pk = packageMap.get(it.id);
      const brokenItem = pk?.items?.some((c) => !c.product || !c.product.isAvailable);
      if (!pk || !pk.isPublished || !pk.isAvailable || brokenItem) {
        unavailable.push({ type: 'package', id: it.id, name: pk?.name });
        continue;
      }
      orderItems.push({
        itemType: 'package',
        refId: pk._id,
        slug: pk.slug,
        name: pk.name,
        image: pk.coverImage || '',
        quantity: it.quantity,
        unitPrice: pk.packagePrice,
        pricingUnit: 'per_event',
        rentalDays,
        lineTotal: lineTotalFor(pk.packagePrice, it.quantity, 'per_event', rentalDays),
        components: pk.items.map((c) => ({ product: c.product._id, name: c.product.name, quantity: c.quantity * it.quantity })),
      });
      for (const c of pk.items) addRequired(c.product._id, c.quantity * it.quantity);
    }
  }

  if (unavailable.length) throw new ApiError(409, 'itemUnavailable', { unavailable });
  if (!orderItems.length) throw new ApiError(400, 'emptyCart');

  const hasPackages = orderItems.some((i) => i.itemType === 'package');
  const hasProducts = orderItems.some((i) => i.itemType === 'product');
  const orderType = hasPackages && hasProducts ? 'mixed' : hasPackages ? 'package' : source === 'builder' ? 'custom' : 'individual';
  const totalAmount = orderItems.reduce((s, i) => s + i.lineTotal, 0);
  const inventoryLines = [...required.entries()].map(([product, quantity]) => ({ product, quantity }));

  return { orderItems, inventoryLines, required, orderType, totalAmount, rentalDays };
}
