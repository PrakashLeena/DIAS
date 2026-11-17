import { connectDB } from '@/lib/db';
import { adminHandler, json, readJson } from '@/lib/api';
import { categoryInput } from '@/lib/validators';
import { revalidatePublic } from '@/lib/revalidate';
import { uniqueSlug } from '@/utils/slug';
import Category from '@/models/Category';

export const GET = adminHandler(async () => {
  await connectDB();
  return json({ items: await Category.find({}).sort({ sortOrder: 1 }).lean() });
});

export const POST = adminHandler(async (request) => {
  const data = categoryInput.parse(await readJson(request));
  await connectDB();
  const slug = await uniqueSlug(Category, data.slug || data.name.en);
  const item = await Category.create({ ...data, slug });
  revalidatePublic();
  return json({ item }, { status: 201 });
});
