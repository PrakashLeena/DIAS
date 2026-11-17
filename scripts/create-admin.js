// Creates (or resets) the administrator account from ADMIN_EMAIL / ADMIN_PASSWORD.
// There is deliberately no public admin registration.
//
//   npm run seed:admin            -> creates the admin if it does not exist
//   npm run seed:admin -- --reset -> also resets the password of an existing admin
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../lib/db.js';
import Admin from '../models/Admin.js';

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';
const reset = process.argv.includes('--reset');

if (!email || email.length < 3) {
  console.error('ADMIN_EMAIL (the admin username) is missing or too short.');
  process.exit(1);
}
if (password.length < 8) {
  console.error('ADMIN_PASSWORD must be at least 8 characters.');
  process.exit(1);
}

await connectDB();
const existing = await Admin.findOne({ email });
const passwordHash = await bcrypt.hash(password, 12);

if (existing && !reset) {
  console.log(`Admin ${email} already exists. Use "npm run seed:admin -- --reset" to reset the password.`);
} else if (existing) {
  existing.passwordHash = passwordHash;
  existing.isActive = true;
  await existing.save();
  console.log(`Password reset for ${email}.`);
} else {
  await Admin.create({ email, passwordHash, name: 'Administrator' });
  console.log(`Admin ${email} created.`);
}
console.log('Tip: remove ADMIN_PASSWORD from your environment once the account exists.');
await mongoose.disconnect();
