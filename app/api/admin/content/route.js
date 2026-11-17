import { adminHandler, json, readJson } from '@/lib/api';
import { contentSchema } from '@/lib/content-schema';
import { saveContent } from '@/lib/content';

// Saves the whole content tree edited in the Admin Panel.
export const PUT = adminHandler(async (request) => {
  const data = contentSchema.parse(await readJson(request, 3_000_000));
  await saveContent(data);
  return json({ ok: true });
});
