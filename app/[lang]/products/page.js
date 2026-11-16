import { getDictionary, localePath } from '@/lib/i18n';
import { getSettings, getCategories, getProducts } from '@/services/catalog';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader';
import ProductFilters from '@/components/products/ProductFilters';
import ProductCard from '@/components/products/ProductCard';
import Pagination from '@/components/ui/Pagination';

export async function generateMetadata({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const dict = getDictionary(lang);
  const settings = await getSettings();
  const filtered = Object.keys(sp || {}).length > 0;
  return buildMetadata({ lang, path: '/products', title: dict.products.title, description: dict.products.intro, settings, noIndex: filtered });
}

const pick = (v) => (Array.isArray(v) ? v[0] : v) || '';

export default async function ProductsPage({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const dict = getDictionary(lang);
  const values = { q: pick(sp.q).slice(0, 80), category: pick(sp.category), min: pick(sp.min), max: pick(sp.max), sort: pick(sp.sort) || 'featured' };
  const page = Number(pick(sp.page)) || 1;
  const [settings, categories, result] = await Promise.all([getSettings(), getCategories(), getProducts({ ...values, page, limit: 12 })]);
  const basePath = localePath(lang, '/products');

  return (
    <>
      <PageHeader eyebrow={dict.nav.products} title={dict.products.title} intro={dict.products.intro} />
      <section className="container py-10 sm:py-14">
        <ProductFilters action={basePath} categories={categories} lang={lang} dict={dict} values={values} />
        <p className="mt-6 text-sm text-ink-500" aria-live="polite">
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
        <Pagination page={result.page} pages={result.pages} basePath={basePath} params={values.sort === 'featured' ? { ...values, sort: '' } : values} dict={dict} />
      </section>
    </>
  );
}
