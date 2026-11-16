// Admin → 3D Design: names, visibility and colour options of the homepage 3D stage.
import { connectDB } from '@/lib/db';
import { adminHandler, json, readJson } from '@/lib/api';
import { stageDesignInput } from '@/lib/validators';
import { revalidatePublic } from '@/lib/revalidate';
import { resolveStageDesign } from '@/lib/stage-design';
import WebsiteSettings from '@/models/WebsiteSettings';

export const GET = adminHandler(async () => {
  await connectDB();
  const s = await WebsiteSettings.findOne({ key: 'main' }).select('stageDesign').lean();
  return json({ item: resolveStageDesign(s?.stageDesign) });
});

export const PUT = adminHandler(async (request) => {
  const data = stageDesignInput.parse(await readJson(request, 100_000));
  await connectDB();
  // Store the normalised version so the site and the admin always agree.
  const stageDesign = resolveStageDesign(data);
  await WebsiteSettings.findOneAndUpdate({ key: 'main' }, { $set: { stageDesign } }, { upsert: true, setDefaultsOnInsert: true });
  revalidatePublic();
  return json({ item: stageDesign });
});
