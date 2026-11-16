import { connectDB } from '@/lib/db';
import { adminHandler, json, readJson, ApiError } from '@/lib/api';
import { packageInput, productFlagsInput, objectId } from '@/lib/validators';
import { revalidatePublic } from '@/lib/revalidate';
import { uniqueSlug } from '@/utils/slug';
import Package from '@/models/Package';
import { normalizePackageItems } from '@/lib/package-utils';

export const PUT = adminHandler(async (request, ctx) => {
  const id = objectId.parse((await ctx.params).id);
  const data = packageInput.parse(await readJson(request));
  if (!data.items.length) throw new ApiError(400, 'noItems');
  await connectDB();
  const items = await normalizePackageItems(data.items);
  const slug = await uniqueSlug(Package, data.slug || data.name.en, id);
  const item = await Package.findByIdAndUpdate(id, { ...data, items, slug }, { new: true, runValidators: true });
  if (!item) throw new ApiError(404, 'Not found');
  revalidatePublic();
  return json({ item });
});

export const PATCH = adminHandler(async (request, ctx) => {
  const id = objectId.parse((await ctx.params).id);
  const data = productFlagsInput.parse(await readJson(request));
  await connectDB();
  const item = await Package.findByIdAndUpdate(id, data, { new: true });
  if (!item) throw new ApiError(404, 'Not found');
  revalidatePublic();
  return json({ item });
});

export const DELETE = adminHandler(async (request, ctx) => {
  const id = objectId.parse((await ctx.params).id);
  await connectDB();
  const res = await Package.findByIdAndDelete(id);
  if (!res) throw new ApiError(404, 'Not found');
  revalidatePublic();
  return json({ ok: true });
});
