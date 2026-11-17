import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { adminHandler, json, ApiError } from '@/lib/api';
import WebsiteSettings from '@/models/WebsiteSettings';

export const DELETE = adminHandler(async (_request, { params }) => {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'Invalid id');
  await connectDB();
  await WebsiteSettings.updateOne({ key: 'main' }, { $pull: { testimonials: { _id: id } } });
  return json({ ok: true });
});
