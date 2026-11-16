import { connectDB } from '@/lib/db';
import { adminHandler, json, readJson, ApiError } from '@/lib/api';
import { inventoryUpdateInput, objectId } from '@/lib/validators';
import { revalidatePublic } from '@/lib/revalidate';
import Product from '@/models/Product';

// Manual inventory adjustments (total stock, damaged/blocked units, availability).
export const PATCH = adminHandler(async (request, ctx) => {
  const id = objectId.parse((await ctx.params).id);
  const data = inventoryUpdateInput.parse(await readJson(request));
  await connectDB();
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, 'Not found');
  Object.assign(product, data);
  if ((product.blockedQuantity || 0) > product.totalQuantity) throw new ApiError(400, 'Damaged quantity cannot exceed total quantity');
  await product.save();
  revalidatePublic();
  return json({ item: { _id: product._id, totalQuantity: product.totalQuantity, blockedQuantity: product.blockedQuantity, isAvailable: product.isAvailable } });
});
