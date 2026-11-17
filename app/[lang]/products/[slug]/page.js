import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Boxes, Info } from 'lucide-react';
import { getDictionary, localePath, tr } from '@/lib/i18n';
import { getSettings, getProductBySlug, getRelatedProducts } from '@/services/catalog';
import { buildMetadata, productJsonLd, breadcrumbJsonLd, absoluteUrl } from '@/lib/seo';
import { formatMoney } from '@/utils/format';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ProductGallery from '@/components/products/ProductGallery';
import ProductCard from '@/components/products/ProductCard';
import { ProductOrderControls } from '@/components/cart/AddToOrder';
import JsonLd from '@/components/seo/JsonLd';

// Rendered on first request, then cached (ISR) and refreshed when an admin edits content.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!product) return {};
  return buildMetadata({
    lang,
    path: `/products/${product.slug}`,
    title: tr(product.seo?.title, lang) || tr(product.name, lang),
    description: tr(product.seo?.description, lang) || tr(product.description, lang).slice(0, 160),
    image: product.images?.[0],
    settings,
  });
}

export default async function ProductPage({ params }) {
  const { lang, slug } = await params;
  const dict = getDictionary(lang);
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!product) notFound();
  const related = await getRelatedProducts(product);
  const name = tr(product.name, lang);
  const url = absoluteUrl(localePath(lang, `/products/${product.slug}`));
  const crumbs = [
    { name: dict.nav.home, href: localePath(lang, '/'), path: localePath(lang, '/') },
    { name: dict.nav.products, href: localePath(lang, '/products'), path: localePath(lang, '/products') },
    { name: tr(product.category?.name, lang), href: localePath(lang, `/categories/${product.category?.slug}`), path: localePath(lang, `/categories/${product.category?.slug}`) },
    { name, path: localePath(lang, `/products/${product.slug}`) },
  ];

  return (
    <>
      <div className="h-24 bg-ink-900 sm:h-28" aria-hidden />
      <article className="container py-8 sm:py-12">
        <Breadcrumbs items={crumbs} />
        <div className="[&>*]:min-w-0 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={product.images} alt={name} />
          <div>
            <p className="eyebrow">{tr(product.category?.name, lang)}</p>
            <h1 className="mt-2 text-[clamp(32px,4vw,50px)] [:lang(ta)_&]:text-[clamp(26px,3vw,36px)]">{name}</h1>
            <p className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-[40px] font-semibold text-maroon-600">{formatMoney(product.rentalPrice, settings.currency)}</span>
              <span className="text-ink-500">/ {dict.common[product.pricingUnit]}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.isAvailable ? (
                <span className="badge bg-success/10 text-success ring-1 ring-success/25">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {dict.common.available}
                </span>
              ) : (
                <span className="badge bg-danger/10 text-danger ring-1 ring-danger/25">
                  <XCircle className="h-3.5 w-3.5" /> {dict.common.unavailable}
                </span>
              )}
              <span className="badge bg-champagne-100 text-ink-700">
                <Boxes className="h-3.5 w-3.5" /> {dict.products.totalStock}: {product.totalQuantity}
              </span>
              {product.minOrderQuantity > 1 && (
                <span className="badge bg-champagne-100 text-ink-700">
                  {dict.products.minQty}: {product.minOrderQuantity}
                </span>
              )}
            </div>
            {tr(product.description, lang) && (
              <div className="mt-6">
                <h2 className="sr-only">{dict.products.description}</h2>
                <p className="whitespace-pre-line text-[16.5px] font-light leading-relaxed text-ink-700">{tr(product.description, lang)}</p>
              </div>
            )}
            <div className="mt-8 rounded-xl border bg-white p-5 shadow-1 sm:p-6" style={{ borderColor: 'var(--border-subtle)' }}>
              <ProductOrderControls product={product} />
              <p className="mt-4 flex items-start gap-2 text-[13px] text-ink-500">
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {dict.products.stockNote}
              </p>
            </div>
            {product.specifications?.length > 0 && (
              <section className="mt-8">
                <h2 className="text-2xl">{dict.products.specifications}</h2>
                <dl className="mt-3 divide-y rounded-xl border bg-white" style={{ borderColor: 'var(--border-subtle)' }}>
                  {product.specifications.map((s, i) => (
                    <div key={i} className="grid grid-cols-2 gap-4 px-5 py-3 text-[15px]">
                      <dt className="text-ink-500">{tr(s.label, lang)}</dt>
                      <dd className="font-medium text-ink-900">{tr(s.value, lang)}</dd>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-4 px-5 py-3 text-[15px]">
                    <dt className="text-ink-500">{dict.products.pricingUnit}</dt>
                    <dd className="font-medium text-ink-900">{dict.common[product.pricingUnit]}</dd>
                  </div>
                </dl>
              </section>
            )}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-champagne-100/60 py-14" aria-labelledby="related-title">
          <div className="container">
            <h2 id="related-title" className="h-section mb-8">{dict.products.related}</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} lang={lang} dict={dict} currency={settings.currency} />
              ))}
            </div>
            <Link href={localePath(lang, `/categories/${product.category?.slug}`)} className="btn btn-secondary mt-8">
              {tr(product.category?.name, lang)}
            </Link>
          </div>
        </section>
      )}
      <JsonLd data={productJsonLd({ product, lang, settings, url })} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
