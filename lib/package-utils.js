import Product from '../models/Product.js';
import { ApiError } from './api.js';

/** Merges duplicate products and verifies they all exist. */
export async function normalizePackageItems(items) {
  const merged = new Map();
  for (const i of items) merged.set(i.product, (merged.get(i.product) || 0) + i.quantity);
  const ids = [...merged.keys()];
  const found = await Product.countDocuments({ _id: { $in: ids } });
  if (found !== ids.length) throw new ApiError(400, 'One or more products no longer exist');
  return ids.map((product) => ({ product, quantity: merged.get(product) }));
}
