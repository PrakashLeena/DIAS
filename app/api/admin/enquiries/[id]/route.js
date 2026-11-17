import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { adminHandler, json, readJson, ApiError } from '@/lib/api';
import { objectId } from '@/lib/validators';
import Enquiry, { ENQUIRY_STATUSES } from '@/models/Enquiry';

export const PATCH = adminHandler(async (request, ctx) => {
  const id = objectId.parse((await ctx.params).id);
  const { status } = z.object({ status: z.enum(ENQUIRY_STATUSES) }).parse(await readJson(request, 1_000));
  await connectDB();
  const item = await Enquiry.findByIdAndUpdate(id, { status }, { new: true }).lean();
  if (!item) throw new ApiError(404, 'Not found');
  return json({ item });
});

export const DELETE = adminHandler(async (request, ctx) => {
  const id = objectId.parse((await ctx.params).id);
  await connectDB();
  const res = await Enquiry.findByIdAndDelete(id);
  if (!res) throw new ApiError(404, 'Not found');
  return json({ ok: true });
});
