import { connectDB } from '@/lib/db';
import { adminHandler, json, readJson, ApiError } from '@/lib/api';
import { packageInput } from '@/lib/validators';
import { revalidatePublic } from '@/lib/revalidate';
import { normalizePackageItems } from '@/lib/package-utils';
import { uniqueSlug } from '@/utils/slug';
import Package from '@/models/Package';

export const POST = adminHandler(async (request) => {
  const data = packageInput.parse(await readJson(request));
  if (!data.items.length) throw new ApiError(400, 'noItems');
  await connectDB();
  const items = await normalizePackageItems(data.items);
  const slug = await uniqueSlug(Package, data.slug || data.name.en);
  const item = await Package.create({ ...data, items, slug });
  revalidatePublic();
  return json({ item }, { status: 201 });
});
