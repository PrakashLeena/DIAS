import { getContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const { categories } = await getContent();
  return [{ url: `${base}/` }, ...categories.map((c) => ({ url: `${base}/category/${c.id}` }))];
}
