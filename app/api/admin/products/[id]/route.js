import { connectDB } from '@/lib/db';
import { adminHandler, json, readJson, ApiError } from '@/lib/api';
import { productInput, productFlagsInput, objectId } from '@/lib/validators';
import { revalidatePublic } from '@/lib/revalidate';
import { uniqueSlug } from '@/utils/slug';
import Product from '@/models/Product';
import Package from '@/models/Package';
import Category from '@/models/Category';

async function getId(ctx) {
  const { id } = await ctx.params;
  return objectId.parse(id);
}

export const GET = adminHandler(async (request, ctx) => {
  const id = await getId(ctx);
  await connectDB();
  const item = await Product.findById(id).lean();
  if (!item) throw new ApiError(404, 'Not found');
  return json({ item });
});

export const PUT = adminHandler(async (request, ctx) => {
  const id = await getId(ctx);
  const data = productInput.parse(await readJson(request));
  await connectDB();
  if (!(await Category.exists({ _id: data.category }))) throw new ApiError(400, 'Category not found');
  if (data.blockedQuantity > data.totalQuantity) throw new ApiError(400, 'Damaged quantity cannot exceed total quantity');
  const slug = await uniqueSlug(Product, data.slug || data.name.en, id);
  const item = await Product.findByIdAndUpdate(id, { ...data, slug }, { new: true, runValidators: true });
  if (!item) throw new ApiError(404, 'Not found');
  revalidatePublic();
  return json({ item });
});

// Quick toggles from the product table: publish / feature / availability.
export const PATCH = adminHandler(async (request, ctx) => {
  const id = await getId(ctx);
  const data = productFlagsInput.parse(await readJson(request));
  await connectDB();
  const item = await Product.findByIdAndUpdate(id, data, { new: true });
  if (!item) throw new ApiError(404, 'Not found');
  revalidatePublic();
  return json({ item });
});

export const DELETE = adminHandler(async (request, ctx) => {
  const id = await getId(ctx);
  await connectDB();
  const usedIn = await Package.find({ 'items.product': id }).select('name').lean();
  if (usedIn.length) throw new ApiError(409, 'inUse', { packages: usedIn.map((p) => p.name) });
  const res = await Product.findByIdAndDelete(id);
  if (!res) throw new ApiError(404, 'Not found');
  revalidatePublic();
  return json({ ok: true });
});
