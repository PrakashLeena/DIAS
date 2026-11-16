// Read-only data access for public pages (Server Components).
// Errors are logged and converted to empty results so a database hiccup never
// breaks the whole page render.
import { cache } from 'react';
import { connectDB } from '../lib/db.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Package from '../models/Package.js';
import WebsiteSettings from '../models/WebsiteSettings.js';
import { DEFAULT_SETTINGS, mergeSettings } from '../lib/site-defaults.js';
import { serialize, escapeRegex } from '../utils/serialize.js';

async function safe(fn, fallback) {
  try {
    await connectDB();
    return await fn();
  } catch (err) {
    console.error('[catalog]', err?.message);
    return fallback;
  }
}

const PUBLIC_PRODUCT = { isPublished: true };
const PRODUCT_FIELDS = 'name slug category images rentalPrice pricingUnit isAvailable isFeatured minOrderQuantity totalQuantity';

export const getSettings = cache(async () =>
  safe(async () => {
    const s = await WebsiteSettings.findOne({ key: 'main' }).lean();
    return serialize(mergeSettings(DEFAULT_SETTINGS, s ? serialize(s) : {}));
  }, DEFAULT_SETTINGS)
);

export const getCategories = cache(async () =>
  safe(async () => {
    const cats = await Category.find({ isActive: true }).sort({ sortOrder: 1, 'name.en': 1 }).lean();
    const counts = await Product.aggregate([{ $match: PUBLIC_PRODUCT }, { $group: { _id: '$category', count: { $sum: 1 } } }]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
    return serialize(cats.map((c) => ({ ...c, productCount: countMap.get(String(c._id)) || 0 })));
  }, [])
);

export const getCategoryBySlug = cache(async (slug) =>
  safe(async () => serialize(await Category.findOne({ slug: String(slug), isActive: true }).lean()), null)
);

const SORTS = {
  featured: { isFeatured: -1, sortOrder: 1, createdAt: -1 },
  priceAsc: { rentalPrice: 1 },
  priceDesc: { rentalPrice: -1 },
  newest: { createdAt: -1 },
};

/** Paginated, filterable product listing. */
export async function getProducts({ q = '', category = '', min, max, sort = 'featured', page = 1, limit = 12 } = {}) {
  return safe(
    async () => {
      const filter = { ...PUBLIC_PRODUCT };
      const activeCats = await Category.find({ isActive: true }).select('_id slug').lean();
      if (category) {
        const cat = activeCats.find((c) => c.slug === String(category));
        if (!cat) return { items: [], total: 0, page: 1, pages: 1 };
        filter.category = cat._id;
      } else {
        filter.category = { $in: activeCats.map((c) => c._id) };
      }
      const term = String(q || '').trim().slice(0, 80);
      if (term) {
        const rx = new RegExp(escapeRegex(term), 'i');
        filter.$or = [{ 'name.en': rx }, { 'name.ta': rx }, { 'description.en': rx }, { 'description.ta': rx }];
      }
      const minN = Number(min);
      const maxN = Number(max);
      if (Number.isFinite(minN) && min !== '' && min != null) filter.rentalPrice = { ...(filter.rentalPrice || {}), $gte: minN };
      if (Number.isFinite(maxN) && max !== '' && max != null) filter.rentalPrice = { ...(filter.rentalPrice || {}), $lte: maxN };
      const safeLimit = Math.min(48, Math.max(1, Number(limit) || 12));
      const total = await Product.countDocuments(filter);
      const pages = Math.max(1, Math.ceil(total / safeLimit));
      const current = Math.min(pages, Math.max(1, Number(page) || 1));
      const items = await Product.find(filter)
        .select(PRODUCT_FIELDS)
        .populate('category', 'name slug')
        .sort(SORTS[sort] || SORTS.featured)
        .skip((current - 1) * safeLimit)
        .limit(safeLimit)
        .lean();
      return serialize({ items, total, page: current, pages });
    },
    { items: [], total: 0, page: 1, pages: 1 }
  );
}

export const getFeaturedProducts = cache(async (limit = 8) =>
  safe(async () => {
    const items = await Product.find({ ...PUBLIC_PRODUCT, isFeatured: true })
      .select(PRODUCT_FIELDS)
      .populate('category', 'name slug')
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(limit)
      .lean();
    return serialize(items);
  }, [])
);

export const getProductBySlug = cache(async (slug) =>
  safe(async () => {
    const p = await Product.findOne({ slug: String(slug), ...PUBLIC_PRODUCT }).populate('category', 'name slug isActive').lean();
    if (!p || !p.category?.isActive) return null;
    return serialize(p);
  }, null)
);

export async function getRelatedProducts(product, limit = 4) {
  return safe(async () => {
    const items = await Product.find({ ...PUBLIC_PRODUCT, category: product.category?._id, _id: { $ne: product._id } })
      .select(PRODUCT_FIELDS)
      .populate('category', 'name slug')
      .sort({ isFeatured: -1, sortOrder: 1 })
      .limit(limit)
      .lean();
    return serialize(items);
  }, []);
}

/** All published products grouped by category — used by the Custom Package Builder. */
export const getBuilderCatalog = cache(async () =>
  safe(async () => {
    const cats = await Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    const products = await Product.find({ ...PUBLIC_PRODUCT, category: { $in: cats.map((c) => c._id) } })
      .select(PRODUCT_FIELDS)
      .sort({ sortOrder: 1, rentalPrice: 1 })
      .lean();
    return serialize(
      cats
        .map((c) => ({ _id: c._id, name: c.name, slug: c.slug, icon: c.icon, products: products.filter((p) => String(p.category) === String(c._id)) }))
        .filter((c) => c.products.length)
    );
  }, [])
);

const PACKAGE_POPULATE = { path: 'items.product', select: 'name slug images rentalPrice pricingUnit isAvailable isPublished category' };

export const getPackages = cache(async ({ featuredOnly = false, category = '' } = {}) =>
  safe(async () => {
    const filter = { isPublished: true };
    if (featuredOnly) filter.isFeatured = true;
    if (category) filter.category = String(category);
    const [items, tentCats] = await Promise.all([
      Package.find(filter).populate(PACKAGE_POPULATE).sort({ sortOrder: 1, packagePrice: 1 }).lean(),
      Category.find({ icon: { $in: ['tent', 'tent-large'] } }).select('_id').lean(),
    ]);
    const tentIds = new Set(tentCats.map((c) => String(c._id)));
    // hasTent: the package already contains a tent (used by the homepage estimator).
    return serialize(items.map((p) => ({ ...p, hasTent: p.items.some((i) => i.product && tentIds.has(String(i.product.category))) })));
  }, [])
);

// Optional extras offered in the homepage estimator, matched to real rental products.
// Change the slugs here if the products are renamed in the admin.
const HOME_ADDON_SLUGS = { tent: 'large-wedding-tent', light: 'decorative-lighting', walk: 'flower-arch-walkway' };

export const getHomeAddons = cache(async () =>
  safe(async () => {
    const products = await Product.find({ slug: { $in: Object.values(HOME_ADDON_SLUGS) }, isPublished: true, isAvailable: true })
      .select('name slug images rentalPrice pricingUnit')
      .lean();
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    return serialize(Object.fromEntries(Object.entries(HOME_ADDON_SLUGS).map(([k, s]) => [k, bySlug.get(s) || null])));
  }, { tent: null, light: null, walk: null })
);

export const getPackageBySlug = cache(async (slug) =>
  safe(async () => serialize(await Package.findOne({ slug: String(slug), isPublished: true }).populate(PACKAGE_POPULATE).lean()), null)
);

/** Lightweight lists for the sitemap. */
export async function getSitemapEntries() {
  return safe(
    async () => {
      const [products, packages, categories] = await Promise.all([
        Product.find(PUBLIC_PRODUCT).select('slug updatedAt').lean(),
        Package.find({ isPublished: true }).select('slug updatedAt').lean(),
        Category.find({ isActive: true }).select('slug updatedAt').lean(),
      ]);
      return { products, packages, categories };
    },
    { products: [], packages: [], categories: [] }
  );
}
