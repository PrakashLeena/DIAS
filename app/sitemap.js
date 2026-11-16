import { getSitemapEntries } from '@/services/catalog';
import { absoluteUrl } from '@/lib/seo';
import { localePath } from '@/lib/i18n/config';

export const revalidate = 3600;

const STATIC = ['/', '/packages', '/products', '/categories', '/custom-package', '/gallery', '/about', '/contact', '/track-order', '/privacy-policy', '/terms'];

function entry(path, lastModified, priority = 0.7) {
  return {
    url: absoluteUrl(localePath('ta', path)),
    lastModified,
    changeFrequency: 'weekly',
    priority,
    alternates: { languages: { ta: absoluteUrl(localePath('ta', path)), en: absoluteUrl(localePath('en', path)) } },
  };
}

export default async function sitemap() {
  const { products, packages, categories } = await getSitemapEntries();
  const now = new Date();
  const out = [];
  for (const p of STATIC) {
    const e = entry(p, now, p === '/' ? 1 : 0.8);
    out.push(e, { ...e, url: absoluteUrl(localePath('en', p)) });
  }
  const add = (path, updatedAt, priority) => {
    const e = entry(path, updatedAt || now, priority);
    out.push(e, { ...e, url: absoluteUrl(localePath('en', path)) });
  };
  packages.forEach((p) => add(`/packages/${p.slug}`, p.updatedAt, 0.9));
  categories.forEach((c) => add(`/categories/${c.slug}`, c.updatedAt, 0.7));
  products.forEach((p) => add(`/products/${p.slug}`, p.updatedAt, 0.7));
  return out;
}
