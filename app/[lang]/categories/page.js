import { getDictionary } from '@/lib/i18n';
import { getSettings, getCategories } from '@/services/catalog';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader';
import { CategoryGrid } from '@/components/home/Sections';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return buildMetadata({ lang, path: '/categories', title: dict.categoriesPage.title, description: dict.categoriesPage.intro, settings: await getSettings() });
}

export default async function CategoriesPage({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const categories = await getCategories();
  return (
    <>
      <PageHeader eyebrow={dict.nav.categories} title={dict.categoriesPage.title} intro={dict.categoriesPage.intro} />
      <section className="container py-12 sm:py-16">
        <CategoryGrid categories={categories} lang={lang} dict={dict} heading={false} />
      </section>
    </>
  );
}
