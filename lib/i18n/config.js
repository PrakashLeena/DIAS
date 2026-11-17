// Central language configuration. Tamil is the default and is served without a
// URL prefix (/products); English lives under /en (/en/products).
export const LOCALES = ['ta', 'en'];
export const DEFAULT_LOCALE = 'ta';

export const isLocale = (v) => LOCALES.includes(v);

/** Builds a locale-aware internal link. localePath('en', '/products') -> '/en/products' */
export function localePath(lang, path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === DEFAULT_LOCALE) return clean;
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`;
}

/** Removes a locale prefix from a pathname: '/en/products' -> '/products' */
export function stripLocale(pathname = '/') {
  for (const l of LOCALES) {
    if (pathname === `/${l}`) return '/';
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}

/** Picks the right language from a { ta, en } object, falling back to the other one. */
export function tr(obj, lang) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] || obj[lang === 'ta' ? 'en' : 'ta'] || '';
}
