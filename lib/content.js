// Server-side reads/writes of site content and reviews.
import { unstable_cache, revalidateTag } from 'next/cache';
import { connectDB } from './db.js';
import SiteContent from '../models/SiteContent.js';
import WebsiteSettings from '../models/WebsiteSettings.js';
import { defaultContent } from './default-content.js';

const plain = (x) => JSON.parse(JSON.stringify(x));

export const CONTENT_TAG = 'site-content';
export const REVIEWS_TAG = 'site-reviews';

// Cached reads: errors are thrown (so a failed DB read is never cached) and caught by the callers below.
const readContent = unstable_cache(
  async () => {
    await connectDB();
    const doc = await SiteContent.findOne({ key: 'main' }).lean();
    return doc ? plain({ site: doc.site, contact: doc.contact, categories: doc.categories || [] }) : null;
  },
  ['site-content'],
  { tags: [CONTENT_TAG], revalidate: 300 }
);

/** Content from MongoDB, or the built-in defaults when nothing has been saved yet / DB is unreachable. */
export async function getContent() {
  const def = defaultContent();
  try {
    const doc = await readContent();
    if (doc) {
      return {
        site: doc.site?.name ? doc.site : def.site,
        contact: doc.contact?.whatsapp ? doc.contact : def.contact,
        categories: doc.categories || [],
      };
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
  revalidateTag(CONTENT_TAG, { expire: 0 });
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

const readReviews = unstable_cache(
  async () => {
    await connectDB();
    const doc = await WebsiteSettings.findOne({ key: 'main' }).select('testimonials').lean();
    return (doc?.testimonials || []).map(toReview).filter((r) => r.message);
  },
  ['site-reviews'],
  { tags: [REVIEWS_TAG], revalidate: 300 }
);

export async function getReviews() {
  try {
    return await readReviews();
  } catch (err) {
    console.error('[reviews] load failed:', err.message);
    return [];
  }
}

export const refreshReviews = () => revalidateTag(REVIEWS_TAG, { expire: 0 });
