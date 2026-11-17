// Upload endpoint.
// - Production: returns a signed Cloudinary payload; the browser uploads the file
//   directly to Cloudinary (no 4.5 MB serverless body limit, nothing written to
//   Vercel's ephemeral filesystem).
// - Local development without Cloudinary: stores the file in /public/uploads.
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { adminHandler, json, ApiError } from '@/lib/api';
import { createCloudinarySignature, getStorageConfig, ALLOWED_UPLOAD_TYPES } from '@/lib/storage';

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'video/mp4': 'mp4', 'video/webm': 'webm' };

// GET -> how should the browser upload?
export const GET = adminHandler(async () => {
  const signed = createCloudinarySignature();
  if (signed) return json(signed);
  if (process.env.NODE_ENV === 'production') {
    throw new ApiError(500, 'Image storage is not configured. Set IMAGE_STORAGE_CONFIGURATION.');
  }
  return json({ provider: 'local', uploadUrl: '/api/admin/upload' });
});

// POST -> local development fallback only
export const POST = adminHandler(async (request) => {
  if (getStorageConfig() || process.env.NODE_ENV === 'production') {
    throw new ApiError(400, 'Direct uploads are disabled; upload to the configured storage provider.');
  }
  const form = await request.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') throw new ApiError(400, 'No file');
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) throw new ApiError(400, 'Unsupported file type');
  const max = file.type.startsWith('video/') ? 60 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > max) throw new ApiError(413, 'File too large');
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${EXT[file.type]}`;
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return json({ url: `/uploads/${name}` });
});
