// Server-side reads/writes of site content and reviews.
import { connectDB } from './db.js';
import SiteContent from '../models/SiteContent.js';
import WebsiteSettings from '../models/WebsiteSettings.js';
import { defaultContent } from './default-content.js';

const plain = (x) => JSON.parse(JSON.stringify(x));

/** Content from MongoDB, or the built-in defaults when nothing has been saved yet / DB is unreachable. */
export async function getContent() {
  const def = defaultContent();
  try {
    await connectDB();
    const doc = await SiteContent.findOne({ key: 'main' }).lean();
    if (doc) {
      return plain({
        site: doc.site?.name ? doc.site : def.site,
        contact: doc.contact?.whatsapp ? doc.contact : def.contact,
        categories: doc.categories || [],
      });
    }
  } catch (err) {
    console.error('[content] falling back to defaults:', err.message);
  }
  return plain(def);
}

export async function saveContent(data) {
  await connectDB();
  await SiteContent.findOneAndUpdate(
    { key: 'main' },
    { $set: { site: data.site, contact: data.contact, categories: data.categories } },
    { upsert: true, setDefaultsOnInsert: true }
  );
}

export function toReview(t) {
  return {
    id: String(t._id),
    name: t.name,
    rating: t.rating || 5,
    message: t.message || t.quote?.ta || t.quote?.en || '',
    event: t.event?.ta || t.event?.en || '',
    createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : null,
  };
}

export async function getReviews() {
  try {
    await connectDB();
    const doc = await WebsiteSettings.findOne({ key: 'main' }).select('testimonials').lean();
    return (doc?.testimonials || []).map(toReview).filter((r) => r.message);
  } catch (err) {
    console.error('[reviews] load failed:', err.message);
    return [];
  }
}
