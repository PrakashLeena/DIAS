// Server-side authorization helpers used by every admin page and admin API route.
// The proxy performs a first (optimistic) check; these perform the authoritative one.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connectDB } from './db.js';
import Admin from '../models/Admin.js';
import { SESSION_COOKIE, verifySessionToken } from './auth.js';

export async function getAdminSession() {
  const store = await cookies();
  const payload = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!payload?.sub) return null;
  await connectDB();
  const admin = await Admin.findById(payload.sub).select('email name isActive').lean();
  if (!admin || !admin.isActive) return null;
  return { id: String(admin._id), email: admin.email, name: admin.name };
}

/** For admin pages (Server Components): redirects to the login page when not signed in. */
export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  return session;
}
