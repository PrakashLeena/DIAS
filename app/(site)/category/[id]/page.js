import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import CategoryView from '@/components/site/CategoryView';
import Footer from '@/components/site/Footer';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { categories, site } = await getContent();
  const cat = categories.find((c) => c.id === id);
  return cat ? { title: `${cat.name.ta} | ${cat.name.en} — ${site.name.en}` } : {};
}

export default async function CategoryPage({ params }) {
  const { id } = await params;
  const { categories } = await getContent();
  const category = categories.find((c) => c.id === id);
  if (!category) notFound();
  return (
    <>
      <CategoryView category={category} />
      <Footer />
    </>
  );
}
