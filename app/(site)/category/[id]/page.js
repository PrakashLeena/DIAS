import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { BRAND, abs, breadcrumbJsonLd } from '@/lib/seo';
import CategoryView from '@/components/site/CategoryView';
import Footer from '@/components/site/Footer';
import JsonLd from '@/components/site/JsonLd';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { categories } = await getContent();
  const cat = categories.find((c) => c.id === id);
  if (!cat) return { title: 'Not found', robots: { index: false } };
  const en = cat.name.en || cat.name.ta;
  const title = `${cat.name.ta} — ${en} in Mannar District`;
  const description = `${en} (${cat.name.ta}) for weddings, church & kovil festivals, birthdays and events across Mannar District — Mannar Town, Pesalai, Thalaimannar, Murunkan, Madhu, Adampan, Vankalai. மன்னார் மாவட்டம் முழுவதும். Order on WhatsApp — ${BRAND.ta}.`;
  const image = cat.image ? (cat.image.startsWith('http') ? cat.image : abs(cat.image)) : abs('/og-image.jpg');
  return {
    title,
    description,
    alternates: { canonical: `/category/${cat.id}` },
    openGraph: { type: 'website', url: `/category/${cat.id}`, title, description, images: [{ url: image, alt: `${en} — ${BRAND.en}` }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function CategoryPage({ params }) {
  const { id } = await params;
  const { categories } = await getContent();
  const category = categories.find((c) => c.id === id);
  if (!category) notFound();
  return (
    <>
      <CategoryView category={category} />
      <p className="mx-auto max-w-[1200px] px-4 pb-8 text-[13.5px] leading-relaxed text-ink-500">
        {category.name.ta} ({category.name.en || category.name.ta}) — மன்னார் மாவட்டம் முழுவதும் (மன்னார் நகரம், பேசாலை, தலைமன்னார், முருங்கன், மடு, அடம்பன், நானாட்டான், முசலி, வங்காலை) வழங்கப்படுகிறது.
        {' '}Available across Mannar District from {BRAND.en}, Vankalai.
      </p>
      <Footer />
      <JsonLd data={breadcrumbJsonLd([[BRAND.en, '/'], [category.name.en || category.name.ta, `/category/${category.id}`]])} />
    </>
  );
}
