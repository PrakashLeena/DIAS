// Zod schemas shared by client forms and server route handlers.
// Error messages are dictionary keys (checkout.errors.*) so they can be shown in
// the visitor's language.
import { z } from 'zod';
import { ELEMENT_KEYS, PANEL_KEYS, LIGHT_KEYS, OPTION_GROUPS, MAX_OPTIONS } from './stage-design.js';

const stripTags = (s) => s.replace(/<[^>]*>/g, '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
const text = (max, min = 0) =>
  z
    .string({ error: 'required' })
    .transform((s) => stripTags(s).trim())
    .pipe(
      min > 0
        ? z
            .string()
            .min(1, { error: 'required' })
            .refine((s) => s.length === 0 || s.length >= min, { error: 'tooShort' })
            .refine((s) => s.length <= max, { error: 'tooLong' })
        : z.string().max(max)
    );

export const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'required' });

import { ORDER_ID_REGEX, EVENT_TYPES, MAX_RENTAL_DAYS } from './constants.js';
export { ORDER_ID_REGEX, EVENT_TYPES, MAX_RENTAL_DAYS };

export const phoneSchema = z
  .string({ error: 'required' })
  .trim()
  .min(1, { error: 'required' })
  .regex(/^\+?[0-9\s-]{9,16}$/, { error: 'phone' })
  .refine((v) => v.replace(/\D/g, '').length >= 9 && v.replace(/\D/g, '').length <= 15, { error: 'phone' });

export const customerSchema = z.object({
  fullName: text(120, 2),
  phone: phoneSchema,
  email: z.union([z.literal(''), z.string().trim().toLowerCase().email({ error: 'email' }).max(160)]).optional().default(''),
  address: text(500, 5),
  city: text(120, 2),
  locationReference: text(300, 3),
});

const todayUtc = () => {
  const d = new Date();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - 86400000; // allow timezone slack of 1 day
};

export const eventSchema = z
  .object({
    eventType: z.enum(EVENT_TYPES, { error: 'required' }),
    eventDate: dateStr,
    rentalStartDate: dateStr,
    rentalEndDate: dateStr,
    venue: text(500, 3),
    instructions: text(1500).optional().default(''),
  })
  .superRefine((v, ctx) => {
    const s = Date.parse(`${v.rentalStartDate}T00:00:00Z`);
    const e = Date.parse(`${v.rentalEndDate}T00:00:00Z`);
    const ev = Date.parse(`${v.eventDate}T00:00:00Z`);
    if ([s, e, ev].some(Number.isNaN)) return;
    if (s < todayUtc()) ctx.addIssue({ code: 'custom', path: ['rentalStartDate'], message: 'pastDate' });
    if (ev < todayUtc()) ctx.addIssue({ code: 'custom', path: ['eventDate'], message: 'pastDate' });
    if (e < s) ctx.addIssue({ code: 'custom', path: ['rentalEndDate'], message: 'dateOrder' });
    else if ((e - s) / 86400000 + 1 > MAX_RENTAL_DAYS) ctx.addIssue({ code: 'custom', path: ['rentalEndDate'], message: 'maxDays' });
    if (ev < s || ev > e) ctx.addIssue({ code: 'custom', path: ['eventDate'], message: 'eventInRange' });
  });

export const cartItemSchema = z.object({
  type: z.enum(['product', 'package']),
  id: objectId,
  quantity: z.coerce.number().int().min(1).max(10000),
});

export const orderSchema = z.object({
  customer: customerSchema,
  event: eventSchema,
  items: z.array(cartItemSchema).min(1, { error: 'emptyCart' }).max(100),
  source: z.enum(['cart', 'builder']).optional().default('cart'),
  language: z.enum(['ta', 'en']).optional().default('ta'),
  website: z.string().max(0).optional(), // honeypot: must stay empty
});

export const trackSchema = z.object({
  orderId: z
    .string()
    .trim()
    .toUpperCase()
    .regex(ORDER_ID_REGEX, { error: 'invalid' }),
});

// ---------- Admin schemas ----------
const localized = (max, required = false) =>
  z.object({
    ta: required ? text(max, 1) : text(max).optional().default(''),
    en: required ? text(max, 1) : text(max).optional().default(''),
  });

const imageUrl = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === '' || v.startsWith('/') || /^https:\/\//.test(v), 'Image must be an https URL or a site path');

const seoSchema = z.object({ title: localized(120), description: localized(320) }).partial().optional();

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().min(1).max(200),
});

export const categoryInput = z.object({
  name: localized(120, true),
  description: localized(600).optional(),
  slug: z.string().trim().max(120).optional(),
  image: imageUrl.optional().default(''),
  icon: z.string().trim().max(40).optional().default('sparkles'),
  sortOrder: z.coerce.number().int().min(-10000).max(10000).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const productInput = z.object({
  name: localized(160, true),
  description: localized(4000).optional(),
  slug: z.string().trim().max(140).optional(),
  category: objectId,
  images: z.array(imageUrl).max(12).optional().default([]),
  rentalPrice: z.coerce.number().min(0).max(100_000_000),
  pricingUnit: z.enum(['per_item', 'per_day', 'per_event']),
  totalQuantity: z.coerce.number().int().min(0).max(1_000_000),
  blockedQuantity: z.coerce.number().int().min(0).max(1_000_000).optional().default(0),
  minOrderQuantity: z.coerce.number().int().min(1).max(100_000).optional().default(1),
  specifications: z.array(z.object({ label: localized(80), value: localized(200) })).max(30).optional().default([]),
  isAvailable: z.boolean().optional().default(true),
  isPublished: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  sortOrder: z.coerce.number().int().min(-10000).max(10000).optional().default(0),
  seo: seoSchema,
});

export const packageInput = z.object({
  name: localized(160, true),
  shortDescription: localized(300).optional(),
  description: localized(5000).optional(),
  slug: z.string().trim().max(140).optional(),
  category: z.enum(['wedding', 'engagement', 'birthday', 'religious', 'corporate', 'other']),
  coverImage: imageUrl.optional().default(''),
  gallery: z.array(imageUrl).max(20).optional().default([]),
  items: z.array(z.object({ product: objectId, quantity: z.coerce.number().int().min(1).max(100_000) })).max(60),
  packagePrice: z.coerce.number().min(0).max(1_000_000_000),
  isAvailable: z.boolean().optional().default(true),
  isPublished: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  sortOrder: z.coerce.number().int().min(-10000).max(10000).optional().default(0),
  seo: seoSchema,
});

export const orderUpdateInput = z.object({
  status: z.enum(['pending', 'accepted', 'cancelled', 'completed']).optional(),
  adminMessage: text(1000).optional(),
  internalNotes: text(4000).optional(),
});

export const inventoryUpdateInput = z.object({
  totalQuantity: z.coerce.number().int().min(0).max(1_000_000).optional(),
  blockedQuantity: z.coerce.number().int().min(0).max(1_000_000).optional(),
  isAvailable: z.boolean().optional(),
});

export const productFlagsInput = z.object({
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
});

const url = z.string().trim().max(600).refine((v) => v === '' || /^https?:\/\//.test(v), 'Must be a URL');

export const settingsInput = z
  .object({
    companyName: localized(120),
    tagline: localized(200),
    logo: imageUrl,
    phone: z.string().trim().max(30),
    whatsapp: z.string().trim().max(30),
    email: z.union([z.literal(''), z.string().trim().email().max(160)]),
    address: localized(400),
    businessHours: localized(160),
    mapEmbedUrl: z.string().trim().max(1500).refine((v) => v === '' || /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/.test(v), 'Must be a Google Maps embed URL'),
    mapLink: url,
    social: z.object({ facebook: url, instagram: url, youtube: url, tiktok: url }).partial(),
    currency: z.object({ code: z.string().trim().length(3).toUpperCase(), symbol: z.string().trim().min(1).max(6) }),
    phoneCountryCode: z.string().trim().regex(/^\d{1,4}$/),
    hero: z.object({ heading: localized(200), subheading: localized(500), videoUrl: imageUrl, posterUrl: imageUrl }).partial(),
    about: z.object({ title: localized(200), body: localized(5000), image: imageUrl }).partial(),
    gallery: z.array(z.object({ url: imageUrl.refine((v) => v.length > 0, 'Required'), caption: localized(160), category: z.enum(['tent', 'stage', 'lighting', 'other']) })).max(200),
    testimonials: z.array(z.object({ name: text(80, 1), event: localized(120), quote: localized(600), rating: z.coerce.number().int().min(1).max(5) })).max(50),
    seo: z.object({ siteTitle: localized(120), metaDescription: localized(320), keywords: localized(1000), ogImage: imageUrl, googleVerification: z.string().trim().max(120) }).partial(),
  })
  .partial();

// Admin → 3D Design (homepage 3D stage customizer)
const hexColor = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Colour must look like #A1B2C3');
const keyed = (keys, schema) => z.object(Object.fromEntries(keys.map((k) => [k, schema.optional()])));
export const stageDesignInput = z.object({
  elements: keyed(ELEMENT_KEYS, z.object({ enabled: z.boolean(), action: localized(60), name: localized(80) })),
  panels: keyed(PANEL_KEYS, z.object({ title: localized(60), description: localized(500) })),
  lights: keyed(LIGHT_KEYS, z.object({ short: localized(30), long: localized(80) })),
  options: keyed(
    OPTION_GROUPS,
    z
      .array(z.object({ v: z.string().regex(/^[a-z0-9-]{1,20}$/), enabled: z.boolean(), color: hexColor, accent: z.union([z.literal(''), hexColor]), label: localized(40) }))
      .min(1)
      .max(MAX_OPTIONS)
  ),
});

/** Maps Zod issues to { fieldPath: messageKey } */
export function issuesToFieldErrors(issues = []) {
  const out = {};
  for (const i of issues) {
    const key = (i.path || []).join('.');
    if (!out[key]) out[key] = i.message;
  }
  return out;
}
