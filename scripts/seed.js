// Stores the default categories / items / contact details in MongoDB.
//
//   npm run seed            -> only if no content has been saved yet
//   npm run seed -- --force -> overwrite whatever the Admin Panel saved (reviews and admins are never touched)
import mongoose from 'mongoose';
import { connectDB } from '../lib/db.js';
import SiteContent from '../models/SiteContent.js';
import { defaultContent } from '../lib/default-content.js';
import { saveContent } from '../lib/content.js';

const force = process.argv.includes('--force');
await connectDB();
const existing = await SiteContent.findOne({ key: 'main' }).lean();
if (existing && !force) {
  console.log('Content already exists. Use "npm run seed -- --force" to overwrite it with the defaults.');
} else {
  await saveContent(defaultContent());
  console.log('Default content saved.');
}
await mongoose.disconnect();
