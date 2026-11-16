import { connectDB } from '@/lib/db';
import { adminHandler, json, readJson } from '@/lib/api';
import { settingsInput } from '@/lib/validators';
import { revalidatePublic } from '@/lib/revalidate';
import WebsiteSettings from '@/models/WebsiteSettings';

export const GET = adminHandler(async () => {
  await connectDB();
  return json({ item: await WebsiteSettings.findOne({ key: 'main' }).lean() });
});

export const PUT = adminHandler(async (request) => {
  const data = settingsInput.parse(await readJson(request, 400_000));
  await connectDB();
  // Flatten nested objects into dot-paths so partial updates never wipe sibling fields.
  const $set = {};
  const flatten = (obj, prefix = '') => {
    for (const [k, v] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, path);
      else if (v !== undefined) $set[path] = v;
    }
  };
  flatten(data);
  const item = await WebsiteSettings.findOneAndUpdate({ key: 'main' }, { $set }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }).lean();
  revalidatePublic();
  return json({ item });
});
