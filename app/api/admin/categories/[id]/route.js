import { connectDB } from '@/lib/db';
import { adminHandler, json, readJson, ApiError } from '@/lib/api';
import { categoryInput, objectId } from '@/lib/validators';
import { revalidatePublic } from '@/lib/revalidate';
import { uniqueSlug } from '@/utils/slug';
import Category from '@/models/Category';
import Product from '@/models/Product';

export const PUT = adminHandler(async (request, ctx) => {
  const id = objectId.parse((await ctx.params).id);
  const data = categoryInput.parse(await readJson(request));
  await connectDB();
  const slug = await uniqueSlug(Category, data.slug || data.name.en, id);
  const item = await Category.findByIdAndUpdate(id, { ...data, slug }, { new: true, runValidators: true });
  if (!item) throw new ApiError(404, 'Not found');
  revalidatePublic();
  return json({ item });
});

export const DELETE = adminHandler(async (request, ctx) => {
  const id = objectId.parse((await ctx.params).id);
  await connectDB();
  const count = await Product.countDocuments({ category: id });
  if (count) throw new ApiError(409, 'hasProducts', { count });
  const res = await Category.findByIdAndDelete(id);
  if (!res) throw new ApiError(404, 'Not found');
  revalidatePublic();
  return json({ ok: true });
});
