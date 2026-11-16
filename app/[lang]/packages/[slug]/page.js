import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Check, Info } from 'lucide-react';
import { getDictionary, localePath, tr } from '@/lib/i18n';
import { getSettings, getPackageBySlug, getPackages } from '@/services/catalog';
import { buildMetadata, productJsonLd, breadcrumbJsonLd, absoluteUrl } from '@/lib/seo';
import { formatMoney } from '@/utils/format';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ProductGallery from '@/components/products/ProductGallery';
import PackageCard from '@/components/packages/PackageCard';
import SmartImage from '@/components/ui/SmartImage';
import { PackageOrderControls } from '@/components/cart/AddToOrder';
import JsonLd from '@/components/seo/JsonLd';

// Rendered on first request, then cached (ISR) and refreshed when an admin edits content.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const [pkg, settings] = await Promise.all([getPackageBySlug(slug), getSettings()]);
  if (!pkg) return {};
  return buildMetadata({
    lang,
    path: `/packages/${pkg.slug}`,
    title: tr(pkg.seo?.title, lang) || tr(pkg.name, lang),
    description: tr(pkg.seo?.description, lang) || tr(pkg.shortDescription, lang) || tr(pkg.description, lang).slice(0, 160),
    image: pkg.coverImage,
    settings,
  });
}

export default async function PackagePage({ params }) {
  const { lang, slug } = await params;
  const dict = getDictionary(lang);
  const [pkg, settings] = await Promise.all([getPackageBySlug(slug), getSettings()]);
  if (!pkg) notFound();
  const others = (await getPackages()).filter((p) => p._id !== pkg._id).slice(0, 3);
  const name = tr(pkg.name, lang);
  const items = pkg.items.filter((i) => i.product);
  const images = [pkg.coverImage, ...(pkg.gallery || [])].filter((v, i, a) => v && a.indexOf(v) === i);
  const path = localePath(lang, `/packages/${pkg.slug}`);
  const crumbs = [
    { name: dict.nav.home, href: localePath(lang, '/'), path: localePath(lang, '/') },
    { name: dict.nav.packages, href: localePath(lang, '/packages'), path: localePath(lang, '/packages') },
    { name, path },
  ];

  return (
    <>
      <div className="h-24 bg-ink-900 sm:h-28" aria-hidden />
      <article className="container py-8 sm:py-12">
        <Breadcrumbs items={crumbs} />
        <div className="[&>*]:min-w-0 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <ProductGallery images={images} alt={name} />
          <div>
            <p className="eyebrow">{dict.packages.categories[pkg.category]}</p>
            <h1 className="mt-2 text-[clamp(32px,4vw,52px)] [:lang(ta)_&]:text-[clamp(26px,3vw,38px)]">{name}</h1>
            {tr(pkg.shortDescription, lang) && <p className="mt-3 text-[17px] font-light text-ink-500">{tr(pkg.shortDescription, lang)}</p>}
            <div className="mt-6 rounded-xl bg-ink-900 p-6 text-[#FFF8EC] shadow-3 sm:p-7">
              <p className="text-sm text-[color:var(--text-on-dark-muted)]">{dict.packages.packagePrice}</p>
              <p className="flex items-baseline gap-2">
                <span className="font-display text-[44px] font-semibold text-gold-300">{formatMoney(pkg.packagePrice, settings.currency)}</span>
                <span className="text-sm text-[color:var(--text-on-dark-muted)]">/ {dict.packages.perEvent}</span>
              </p>
              {!pkg.isAvailable && <p className="mt-2 text-sm text-blush-200">{dict.common.unavailable}</p>}
              <div className="mt-5">
                <PackageOrderControls pkg={pkg} showCustomize variant="featured" />
              </div>
              <p className="mt-4 flex items-start gap-2 text-[13px] text-[color:var(--text-on-dark-muted)]">
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {dict.packages.customizeNote}
              </p>
            </div>
          </div>
        </div>

        <div className="[&>*]:min-w-0 mt-14 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          {tr(pkg.description, lang) && (
            <section>
              <h2 className="text-3xl [:lang(ta)_&]:text-2xl">{dict.products.description}</h2>
              <p className="mt-4 whitespace-pre-line text-[16.5px] font-light leading-relaxed">{tr(pkg.description, lang)}</p>
            </section>
          )}
          <section aria-labelledby="included-title">
            <h2 id="included-title" className="text-3xl [:lang(ta)_&]:text-2xl">{dict.packages.included}</h2>
            <ul className="mt-4 divide-y overflow-hidden rounded-xl border bg-white shadow-1" style={{ borderColor: 'var(--border-subtle)' }}>
              {items.map((i) => (
                <li key={i.product._id} className="flex items-center gap-4 px-4 py-3">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-champagne-100">
                    <SmartImage src={i.product.images?.[0]} alt="" sizes="56px" quality={60} />
                  </span>
                  <Link href={localePath(lang, `/products/${i.product.slug}`)} className="flex-1 text-[15.5px] font-medium text-ink-900 hover:text-maroon-600">
                    {tr(i.product.name, lang)}
                  </Link>
                  <span className="flex items-center gap-1.5 rounded-full bg-champagne-100 px-3 py-1 text-sm font-semibold text-maroon-700">
                    <Check className="h-3.5 w-3.5" aria-hidden /> × {i.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>

      {others.length > 0 && (
        <section className="bg-champagne-100/60 py-14">
          <div className="container">
            <h2 className="h-section mb-8">{dict.packages.title}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <PackageCard key={p._id} pkg={p} lang={lang} dict={dict} currency={settings.currency} />
              ))}
            </div>
          </div>
        </section>
      )}
      <JsonLd data={productJsonLd({ product: { ...pkg, images, rentalPrice: pkg.packagePrice, category: null }, lang, settings, url: absoluteUrl(path) })} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
