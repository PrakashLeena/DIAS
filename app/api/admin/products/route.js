import { connectDB } from '@/lib/db';
import { adminHandler, json, readJson } from '@/lib/api';
import { productInput } from '@/lib/validators';
import { revalidatePublic } from '@/lib/revalidate';
import { uniqueSlug } from '@/utils/slug';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { ApiError } from '@/lib/api';

// List (used by the package editor's product picker)
export const GET = adminHandler(async () => {
  await connectDB();
  const items = await Product.find({}).select('name slug rentalPrice pricingUnit images isAvailable isPublished category').sort({ 'name.en': 1 }).lean();
  return json({ items });
});

export const POST = adminHandler(async (request) => {
  const data = productInput.parse(await readJson(request));
  await connectDB();
  if (!(await Category.exists({ _id: data.category }))) throw new ApiError(400, 'Category not found');
  if (data.blockedQuantity > data.totalQuantity) throw new ApiError(400, 'Damaged quantity cannot exceed total quantity');
  const slug = await uniqueSlug(Product, data.slug || data.name.en);
  const product = await Product.create({ ...data, slug });
  revalidatePublic();
  return json({ item: product }, { status: 201 });
});
