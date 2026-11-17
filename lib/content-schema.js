// Zod validation for everything the admin can save, plus the login and review forms.
import { z } from 'zod';

const L = (max) => z.object({ ta: z.string().max(max), en: z.string().max(max) });
const imageUrl = z
  .string()
  .max(800)
  .refine((v) => v === '' || /^\/(?!\/)/.test(v) || /^https:\/\//.test(v), 'Image must be an uploaded file or https URL');
const id = z.string().min(1).max(60).regex(/^[a-z0-9][a-z0-9-]*$/i);
const phone = z.string().trim().min(6).max(20).regex(/^[\d+\s()-]+$/, 'Phone numbers may only contain digits, spaces, + and -');

const item = z.object({ id, name: L(160), image: imageUrl, group: L(120) });

const sub = z.object({ id, emoji: z.string().max(16), name: L(160), image: imageUrl, items: z.array(item).max(300) });

const category = z.object({
  id,
  emoji: z.string().max(16),
  name: L(160),
  image: imageUrl,
  mode: z.enum(['items', 'selector', 'sub', 'contact']),
  numbered: z.boolean(),
  numberPrefix: L(60),
  qtyStepper: z.boolean(),
  selector: z.object({
    type: z.enum(['preset', 'range']),
    options: z.array(z.number().int().min(1).max(1_000_000)).max(30),
    min: z.number().int().min(0).max(1_000_000),
    max: z.number().int().min(1).max(1_000_000),
    unit: L(40),
  }),
  note: L(1200),
  items: z.array(item).max(300),
  subs: z.array(sub).max(30),
});

export const contentSchema = z
  .object({
    site: z.object({ name: L(120) }),
    contact: z.object({ whatsapp: phone, phones: z.array(phone).min(1).max(4) }),
    categories: z.array(category).max(40),
  })
  .superRefine((data, ctx) => {
    const seen = new Set();
    data.categories.forEach((c, i) => {
      if (seen.has(c.id)) ctx.addIssue({ code: 'custom', path: ['categories', i, 'id'], message: 'Duplicate category id' });
      seen.add(c.id);
    });
  });

export const reviewSchema = z.object({
  name: z.string().trim().min(2).max(60),
  rating: z.number().int().min(1).max(5),
  message: z.string().trim().min(3).max(600),
  website: z.string().max(200).optional(), // honeypot
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(2).max(160), // username (or e-mail)
  password: z.string().min(1).max(200),
});
