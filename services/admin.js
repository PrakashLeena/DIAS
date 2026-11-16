// Data access for admin pages (Server Components). Every page calls
// requireAdminPage() before using these.
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import { connectDB } from '../lib/db.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Package from '../models/Package.js';
import Category from '../models/Category.js';
import { serialize, escapeRegex } from '../utils/serialize.js';
import { ADMIN_LANG_COOKIE, getAdminDict } from '../lib/i18n/admin.js';
import { getSettings } from './catalog.js';

export async function getAdminContext() {
  const lang = (await cookies()).get(ADMIN_LANG_COOKIE)?.value === 'en' ? 'en' : 'ta';
  return { lang, t: getAdminDict(lang), settings: await getSettings() };
}

export async function getDashboardStats() {
  await connectDB();
  const [byStatus, totalProducts, totalPackages, recent, upcoming] = await Promise.all([
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Product.countDocuments(),
    Package.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(8).select('orderId customer.fullName customer.phone event.eventDate orderType totalAmount status createdAt').lean(),
    Order.find({ status: 'accepted', 'event.eventDate': { $gte: new Date(Date.now() - 86400000) } })
      .sort({ 'event.eventDate': 1 })
      .limit(6)
      .select('orderId customer.fullName event.eventDate event.eventType totalAmount status')
      .lean(),
  ]);
  const counts = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
  const total = byStatus.reduce((n, s) => n + s.count, 0);
  return serialize({ counts: { total, pending: 0, accepted: 0, cancelled: 0, completed: 0, ...counts }, totalProducts, totalPackages, recent, upcoming });
}

export async function listOrders({ status = '', q = '', from = '', to = '', page = 1, limit = 25 } = {}) {
  await connectDB();
  const filter = {};
  if (['pending', 'accepted', 'cancelled', 'completed'].includes(status)) filter.status = status;
  const term = String(q || '').trim().slice(0, 60);
  if (term) {
    const rx = new RegExp(escapeRegex(term), 'i');
    filter.$or = [{ orderId: rx }, { 'customer.fullName': rx }, { 'customer.phone': rx }];
  }
  const range = {};
  if (/^\d{4}-\d{2}-\d{2}$/.test(from)) range.$gte = new Date(`${from}T00:00:00Z`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(to)) range.$lte = new Date(`${to}T00:00:00Z`);
  if (Object.keys(range).length) filter['event.eventDate'] = range;
  const total = await Order.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / limit));
  const current = Math.min(pages, Math.max(1, Number(page) || 1));
  const items = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((current - 1) * limit)
    .limit(limit)
    .select('orderId customer.fullName customer.phone event.eventDate orderType totalAmount status createdAt')
    .lean();
  return serialize({ items, total, page: current, pages });
}

export async function getOrder(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  return serialize(await Order.findById(id).lean());
}

/** Customers aggregated from orders (no customer accounts exist). */
export async function listCustomers({ q = '', page = 1, limit = 30 } = {}) {
  await connectDB();
  const match = {};
  const term = String(q || '').trim().slice(0, 60);
  if (term) {
    const rx = new RegExp(escapeRegex(term), 'i');
    match.$or = [{ 'customer.fullName': rx }, { 'customer.phone': rx }, { 'customer.city': rx }];
  }
  const pipeline = [
    { $match: match },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$customer.phone',
        fullName: { $first: '$customer.fullName' },
        phone: { $first: '$customer.phone' },
        email: { $first: '$customer.email' },
        address: { $first: '$customer.address' },
        city: { $first: '$customer.city' },
        locationReference: { $first: '$customer.locationReference' },
        lastEventDate: { $first: '$event.eventDate' },
        instructions: { $first: '$event.instructions' },
        lastOrderId: { $first: '$_id' },
        lastOrderCode: { $first: '$orderId' },
        orders: { $sum: 1 },
        lastOrderAt: { $first: '$createdAt' },
      },
    },
    { $sort: { lastOrderAt: -1 } },
  ];
  const all = await Order.aggregate([...pipeline, { $count: 'n' }]);
  const total = all[0]?.n || 0;
  const pages = Math.max(1, Math.ceil(total / limit));
  const current = Math.min(pages, Math.max(1, Number(page) || 1));
  const items = await Order.aggregate([...pipeline, { $skip: (current - 1) * limit }, { $limit: limit }]);
  return serialize({ items, total, page: current, pages });
}

export async function listProductsAdmin({ q = '', category = '', status = '' } = {}) {
  await connectDB();
  const filter = {};
  const term = String(q || '').trim().slice(0, 60);
  if (term) {
    const rx = new RegExp(escapeRegex(term), 'i');
    filter.$or = [{ 'name.en': rx }, { 'name.ta': rx }, { slug: rx }];
  }
  if (mongoose.isValidObjectId(category)) filter.category = category;
  if (status === 'published') filter.isPublished = true;
  if (status === 'unpublished') filter.isPublished = false;
  if (status === 'featured') filter.isFeatured = true;
  if (status === 'unavailable') filter.isAvailable = false;
  const items = await Product.find(filter).populate('category', 'name').sort({ category: 1, sortOrder: 1, 'name.en': 1 }).lean();
  return serialize(items);
}

export async function getProductAdmin(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  return serialize(await Product.findById(id).lean());
}

export async function listCategoriesAdmin() {
  await connectDB();
  const [cats, counts] = await Promise.all([Category.find().sort({ sortOrder: 1 }).lean(), Product.aggregate([{ $group: { _id: '$category', n: { $sum: 1 } } }])]);
  const m = new Map(counts.map((c) => [String(c._id), c.n]));
  return serialize(cats.map((c) => ({ ...c, productCount: m.get(String(c._id)) || 0 })));
}

export async function listPackagesAdmin() {
  await connectDB();
  return serialize(await Package.find().populate('items.product', 'name rentalPrice').sort({ sortOrder: 1, createdAt: -1 }).lean());
}

export async function getPackageAdmin(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  return serialize(await Package.findById(id).lean());
}

export async function listProductOptions() {
  await connectDB();
  return serialize(await Product.find().select('name rentalPrice pricingUnit images isAvailable isPublished').sort({ 'name.en': 1 }).lean());
}
