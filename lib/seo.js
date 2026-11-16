// SEO helpers: per-language metadata, canonical + hreflang alternates, Open Graph
// and JSON-LD builders. Client keywords are managed in Admin -> SEO Settings.
import { localePath, tr } from './i18n/config.js';
import { SEO_KEYWORDS_PLACEHOLDER } from './site-defaults.js';

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function absoluteUrl(path = '/') {
  if (!path) return siteUrl();
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl()}${path.startsWith('/') ? '' : '/'}${path}`;
}

function keywordsFor(settings, lang) {
  const k = tr(settings?.seo?.keywords, lang);
  if (!k || k.includes(SEO_KEYWORDS_PLACEHOLDER)) return undefined; // never publish the placeholder
  return k.split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * @param {{ lang:'ta'|'en', path:string, title?:string, description?:string, image?:string, settings:object, noIndex?:boolean, type?:string }} o
 */
export function buildMetadata({ lang, path = '/', title, description, image, settings, noIndex = false, type = 'website' }) {
  const brand = tr(settings?.companyName, lang);
  const siteTitle = tr(settings?.seo?.siteTitle, lang) || brand;
  const fullTitle = title ? `${title} | ${brand}` : siteTitle;
  const desc = (description || tr(settings?.seo?.metaDescription, lang) || '').slice(0, 300);
  const canonical = absoluteUrl(localePath(lang, path));
  const ogImage = absoluteUrl(image || settings?.seo?.ogImage || '/images/tents/tents-15.webp');
  return {
    title: { absolute: fullTitle },
    description: desc,
    keywords: keywordsFor(settings, lang),
    alternates: {
      canonical,
      languages: {
        'ta-LK': absoluteUrl(localePath('ta', path)),
        'en-LK': absoluteUrl(localePath('en', path)),
        'x-default': absoluteUrl(localePath('ta', path)),
      },
    },
    openGraph: {
      type,
      url: canonical,
      title: fullTitle,
      description: desc,
      siteName: brand,
      locale: lang === 'ta' ? 'ta_LK' : 'en_LK',
      alternateLocale: lang === 'ta' ? ['en_LK'] : ['ta_LK'],
      images: [{ url: ogImage, width: 1200, height: 630, alt: title || brand }],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description: desc, images: [ogImage] },
    robots: noIndex ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export function localBusinessJsonLd(settings, lang) {
  const sameAs = Object.values(settings?.social || {}).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl()}/#business`,
    name: tr(settings?.companyName, lang),
    alternateName: tr(settings?.companyName, lang === 'ta' ? 'en' : 'ta'),
    description: tr(settings?.seo?.metaDescription, lang),
    url: absoluteUrl(localePath(lang, '/')),
    image: absoluteUrl(settings?.seo?.ogImage || '/images/tents/tents-15.webp'),
    logo: settings?.logo ? absoluteUrl(settings.logo) : undefined,
    telephone: settings?.phone || undefined,
    email: settings?.email || undefined,
    address: tr(settings?.address, lang) ? { '@type': 'PostalAddress', streetAddress: tr(settings.address, lang) } : undefined,
    hasMap: settings?.mapLink || undefined,
    priceRange: settings?.currency?.symbol ? `${settings.currency.symbol}${settings.currency.symbol}` : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

export function productJsonLd({ product, lang, settings, url }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tr(product.name, lang),
    description: tr(product.description, lang) || undefined,
    image: (product.images || []).map((i) => absoluteUrl(i)),
    category: tr(product.category?.name, lang) || undefined,
    brand: { '@type': 'Brand', name: tr(settings?.companyName, lang) },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: settings?.currency?.code || 'LKR',
      price: product.rentalPrice ?? product.packagePrice,
      availability: product.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
    },
  };
}

export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}
