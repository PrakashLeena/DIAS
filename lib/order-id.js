import crypto from 'node:crypto';

// No 0/O/1/I to avoid confusion when customers read the ID over the phone.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** EVT-YYYYMMDD-XXXXX (date in Sri Lanka time, UTC+5:30). Uniqueness is enforced by a unique index. */
export function generateOrderId(date = new Date()) {
  const ist = new Date(date.getTime() + 5.5 * 3600 * 1000);
  const ymd = ist.toISOString().slice(0, 10).replace(/-/g, '');
  const bytes = crypto.randomBytes(5);
  let suffix = '';
  for (let i = 0; i < 5; i++) suffix += ALPHABET[bytes[i] % ALPHABET.length];
  return `EVT-${ymd}-${suffix}`;
}
