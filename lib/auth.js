// Admin session handling: signed JWT (HS256) in an httpOnly cookie.
// Customers never authenticate — only administrators.
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'wd_admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('NEXTAUTH_SECRET must be set to a random string of at least 32 characters');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(admin) {
  return new SignJWT({ email: admin.email, name: admin.name, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(admin._id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .setIssuer('watson-decoration')
    .setAudience('watson-admin')
    .sign(getSecret());
}

export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ['HS256'],
      issuer: 'watson-decoration',
      audience: 'watson-admin',
    });
    return payload.role === 'admin' ? payload : null;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}
