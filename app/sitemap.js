import { getContent } from '@/lib/content';
import { abs } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const { categories } = await getContent();
  const now = new Date();
  return [
    { url: abs('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    ...categories.map((c) => ({ url: abs(`/category/${c.id}`), lastModified: now, changeFrequency: 'weekly', priority: 0.8 })),
    { url: abs('/rating'), lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
  ];
}
