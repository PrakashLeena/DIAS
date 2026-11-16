import { notFound } from 'next/navigation';
import { getDictionary, localePath, tr } from '@/lib/i18n';
import { getSettings, getCategories, getCategoryBySlug, getProducts } from '@/services/catalog';
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader';
import ProductFilters from '@/components/products/ProductFilters';
import ProductCard from '@/components/products/ProductCard';
import Pagination from '@/components/ui/Pagination';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';

export async function generateMetadata({ params, searchParams }) {
  const { lang, slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return buildMetadata({
    lang,
    path: `/categories/${category.slug}`,
    title: tr(category.name, lang),
    description: tr(category.description, lang),
    image: category.image,
    settings: await getSettings(),
    noIndex: Object.keys(sp || {}).length > 0,
  });
}

const pick = (v) => (Array.isArray(v) ? v[0] : v) || '';

export default async function CategoryPage({ params, searchParams }) {
  const { lang, slug } = await params;
  const sp = await searchParams;
  const dict = getDictionary(lang);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const values = { q: pick(sp.q).slice(0, 80), category: category.slug, min: pick(sp.min), max: pick(sp.max), sort: pick(sp.sort) || 'featured' };
  const [settings, categories, result] = await Promise.all([getSettings(), getCategories(), getProducts({ ...values, page: Number(pick(sp.page)) || 1 })]);
  const basePath = localePath(lang, `/categories/${category.slug}`);
  const crumbs = [
    { name: dict.nav.home, href: localePath(lang, '/'), path: localePath(lang, '/') },
    { name: dict.nav.categories, href: localePath(lang, '/categories'), path: localePath(lang, '/categories') },
    { name: tr(category.name, lang), path: basePath },
  ];

  return (
    <>
      <PageHeader eyebrow={dict.products.category} title={tr(category.name, lang)} intro={tr(category.description, lang)} />
      <section className="container py-10 sm:py-14">
        <Breadcrumbs items={crumbs} />
        <ProductFilters action={basePath} categories={categories} lang={lang} dict={dict} values={values} hideCategory />
        <p className="mt-6 text-sm text-ink-500">
          {result.total} {dict.products.results}
        </p>
        {result.items.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {result.items.map((p) => (
              <ProductCard key={p._id} product={p} lang={lang} dict={dict} currency={settings.currency} />
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-xl border border-dashed bg-white p-10 text-center text-ink-500">{dict.common.noResults}</p>
        )}
        <Pagination page={result.page} pages={result.pages} basePath={basePath} params={{ q: values.q, min: values.min, max: values.max, sort: values.sort === 'featured' ? '' : values.sort }} dict={dict} />
      </section>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
