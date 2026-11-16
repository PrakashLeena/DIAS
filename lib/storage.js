// Image / video storage. Production uses Cloudinary (Vercel's filesystem is
// ephemeral, so uploads must never be written to disk there).
//
// IMAGE_STORAGE_CONFIGURATION=cloudinary://<api_key>:<api_secret>@<cloud_name>
import crypto from 'node:crypto';

export function getStorageConfig() {
  const raw = process.env.IMAGE_STORAGE_CONFIGURATION || process.env.CLOUDINARY_URL || '';
  const m = raw.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!m) return null;
  return { provider: 'cloudinary', apiKey: m[1], apiSecret: m[2], cloudName: m[3] };
}

export const UPLOAD_FOLDER = 'watson-decoration';

/** Signed parameters that let the admin's browser upload straight to Cloudinary (bypasses the 4.5 MB serverless body limit). */
export function createCloudinarySignature(folder = UPLOAD_FOLDER) {
  const cfg = getStorageConfig();
  if (!cfg) return null;
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder, timestamp };
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  const signature = crypto.createHash('sha1').update(toSign + cfg.apiSecret).digest('hex');
  return {
    provider: 'cloudinary',
    uploadUrl: `https://api.cloudinary.com/v1_1/${cfg.cloudName}/auto/upload`,
    fields: { api_key: cfg.apiKey, timestamp: String(timestamp), folder, signature },
  };
}

export const ALLOWED_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm'];
