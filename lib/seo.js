// SEO helpers: canonical site URL, business facts, keyword list and JSON-LD builders.
import { waNumber } from './contact.js';

const FALLBACK_URL = 'https://dias-peach.vercel.app';

/** Public site URL without a trailing slash. A localhost value is ignored in production builds. */
export function siteUrl() {
  const env = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/$/, '');
  if (!env || (process.env.NODE_ENV === 'production' && /localhost|127\.0\.0\.1/.test(env))) return FALLBACK_URL;
  return env;
}

export const abs = (path = '/') => `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;

export const BRAND = {
  ta: 'வட்ஷன் பந்தல் சேவை',
  en: 'Watson Panthal Sevai',
  tagline: 'Decorating Your Special Moments',
  place: { village: 'Vankalai', district: 'Mannar', region: 'Northern Province', country: 'LK' },
  // Other spellings customers search for (used in structured data only).
  alternateNames: [
    'Watson Decoration', 'Watsan Panthal Sevai', 'Whatson Panthal Sevai', 'Vatshan Panthal Sevai',
    'Watson Pandal Service', 'DIAS Panthal Sevai', 'DIAS Vankalai',
    'வாட்சன் பந்தல் சேவை', 'வட்சன் பந்தல் சேவை', 'டயஸ் பந்தல் சேவை',
  ],
};

/** Vankalai, from Wikipedia (8°53′N 79°56′E). */
export const GEO = { latitude: 8.8833, longitude: 79.9333 };

/**
 * Towns and villages across Mannar District that the business serves, grouped by
 * Divisional Secretariat. Shown on the home page and used in structured data.
 */
export const MANNAR_AREAS = [
  { ds: { en: 'Mannar Town', ta: 'மன்னார் நகரம்' }, places: [['Mannar Town', 'மன்னார் நகரம்'], ['Thalaimannar', 'தலைமன்னார்'], ['Pesalai', 'பேசாலை'], ['Erukkalampiddy', 'எருக்கலம்பிட்டி'], ['Thoddaveli', 'தோட்டவெளி'], ['Thalvupadu', 'தாழ்வுபாடு'], ['Pallimunai', 'பள்ளிமுனை'], ['Olaithoduvai', 'ஓலைத்தொடுவாய்']] },
  { ds: { en: 'Nanattan', ta: 'நானாட்டான்' }, places: [['Vankalai', 'வங்காலை'], ['Nanattan', 'நானாட்டான்'], ['Murunkan', 'முருங்கன்'], ['Thiruketheeswaram', 'திருக்கேதீஸ்வரம்'], ['Uyilankulam', 'உயிலங்குளம்'], ['Arippu', 'அரிப்பு']] },
  { ds: { en: 'Manthai West', ta: 'மாந்தை மேற்கு' }, places: [['Adampan', 'அடம்பன்'], ['Illuppaikadavai', 'இலுப்பைக்கடவை'], ['Vidathaltheevu', 'விடத்தல்தீவு'], ['Pallamadu', 'பள்ளமடு'], ['Periyamadu', 'பெரியமடு']] },
  { ds: { en: 'Madhu', ta: 'மடு' }, places: [['Madhu', 'மடு'], ['Palampiddy', 'பாலம்பிட்டி'], ['Parappukadanthan', 'பரப்புக்கடந்தான்']] },
  { ds: { en: 'Musali', ta: 'முசலி' }, places: [['Musali', 'முசலி'], ['Silavathurai', 'சிலாவத்துறை'], ['Kokkupadayan', 'கொக்குப்படையான்'], ['Marichchukaddi', 'மறிச்சுக்கட்டி']] },
];
export const MANNAR_PLACES = MANNAR_AREAS.flatMap((a) => a.places);

export const DEFAULT_TITLE = `${BRAND.ta} | ${BRAND.en} — Panthal & Decoration, Mannar District`;
export const DEFAULT_DESCRIPTION =
  'Watson Panthal Sevai (வட்ஷன் பந்தல் சேவை), Vankalai — panthal, wedding stage decoration, tents, lighting, chairs, cooking vessels, sound system and vehicle hire across all of Mannar District: Mannar Town, Pesalai, Thalaimannar, Murunkan, Madhu, Adampan, Nanattan, Musali. மன்னார் மாவட்டம் முழுவதும் பந்தல் அலங்கார சேவை.';

const KEYWORDS_RAW = `watsan panthal sevai, watson panthal sevai, watsan panthal, whatson panthal sevai, watsan panthal sevai vankalai, panthal sevai vankalai, watson decoration, watsan decoration vankalai, dias panthal sevai, dias vankalai, watson vankalai, vatshan panthal sevai, vatsan panthal sevai, watsan pandal service, watson pandal service, watsan pandhal sevai, watsan panthal service, watson panthal, vatshan panthal, watsan pandal, watson pandal, whatson decoration, vatshan decors, watsan events, watsan decorating your special moments, watson event decorators, dayas panthal sevai, diyas panthal sevai, daiyas panthal sevai, dias watsan panthal sevai, dayas watson panthal, dias pandal service, dias decoration vankalai, dayas decoration mannar, dias events vankalai, dayas vankalai, dias mannar, watsan dias, watson dayas, watson panthal sevai vankalai, watsan panthal vangalai, pandal service vankalai, pandhal sevai in vankalai, vankalai panthal service, watsan panthal sevai mannar, panthal sevai mannar, pandal service in mannar, watson decoration mannar, best decorators in mannar, event planners in mannar, wedding decorators in vankalai, wedding decoration mannar sri lanka, panthal service mannar district, pandal rental northern province sri lanka, wedding panthal decoration, marriage pandal service, reception stage decoration, outdoor tent rental mannar, canopy tent service vankalai, marquee hire mannar, church feast panthal decoration, kovil festival pandal service, funeral panthal service, birthday party decoration mannar, puberty ceremony decoration vankalai, manjal neeraattu vizha decoration, housewarming panthal sevai, flower decoration mannar, lighting and sound service vankalai, chair and table rental vankalai, stage backdrop decoration mannar, watsan panthal sevai vankalai contact number, dias vankalai phone number, watson panthal sevai mannar address, watsan decoration booking sri lanka, best panthal service in vankalai mannar, low cost wedding decoration in mannar, top event decorators in mannar sri lanka, affordable pandal service near me, வட்ஷன் பந்தல் சேவை, வட்ஷன் பந்தல் சேவை வங்காலை, வங்காலை வட்ஷன் பந்தல் சேவை, வங்காலை பந்தல் சேவை, டயஸ், டயஸ் வட்ஷன் பந்தல் சேவை, டயஸ் பந்தல் சேவை, வாட்சன் பந்தல் சேவை, வட்சன் பந்தல் சேவை, வட்ஷன் பந்தல், வாட்சன் பந்தல், வட்ஷன் அலங்கார சேவை, வாட்சன் டெக்கரேஷன், டாயஸ், டாயஸ் பந்தல் சேவை, டாயஸ் வாட்சன் பந்தல் சேவை, டயஸ் வங்காலை, டாயஸ் வங்காலை, டயஸ் மன்னார், வங்காலை டயஸ், வாட்சன் பந்தல் சேவை வங்காலை, வங்காலை அலங்கார சேவை, வட்ஷன் பந்தல் சேவை மன்னார், மன்னார் பந்தல் சேவை, மன்னார் வட்ஷன் பந்தல், பந்தல் சேவை இலங்கை, மன்னார் மாவட்ட பந்தல் சேவை, திருமண பந்தல் அலங்காரம், மணமேடை அலங்காரம் மன்னார், வரவேற்பு அலங்காரம் வங்காலை, பிறந்தநாள் மேடை அலங்காரம், மஞ்சள் நீராட்டு விழா அலங்காரம், கோவில் திருவிழா பந்தல், ஆலய திருவிழா பந்தல் அலங்காரம், இறுதி நிகழ்வு பந்தல் சேவை, பந்தல் வாடகைக்கு மன்னார்`;

const AREA_KEYWORDS = MANNAR_PLACES.flatMap(([en, ta]) => [`panthal service ${en.toLowerCase()}`, `wedding decoration ${en.toLowerCase()}`, `${ta} பந்தல் சேவை`]);

export const KEYWORDS = [...new Set([...KEYWORDS_RAW.split(','), ...AREA_KEYWORDS].map((k) => k.trim()).filter(Boolean))];

const e164 = (raw) => `+${waNumber(raw)}`;

/** Site-wide LocalBusiness structured data. No ratings are published: only real, verifiable data goes in. */
export function localBusinessJsonLd({ site, contact, categories = [] }) {
  const phones = (contact?.phones || []).map(e164);
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl()}/#business`,
    name: BRAND.en,
    alternateName: [site?.name?.ta || BRAND.ta, ...BRAND.alternateNames],
    slogan: BRAND.tagline,
    description: DEFAULT_DESCRIPTION,
    url: siteUrl(),
    logo: abs('/logo.png'),
    image: [abs('/og-image.jpg')],
    telephone: phones[0],
    ...(phones.length > 1 ? { contactPoint: phones.map((telephone) => ({ '@type': 'ContactPoint', telephone, contactType: 'customer service', areaServed: 'LK', availableLanguage: ['Tamil', 'English'] })) } : {}),
    priceRange: '$$',
    address: { '@type': 'PostalAddress', addressLocality: BRAND.place.village, addressRegion: `${BRAND.place.district} District, ${BRAND.place.region}`, addressCountry: BRAND.place.country },
    geo: { '@type': 'GeoCoordinates', ...GEO },
    hasMap: `https://www.google.com/maps?q=${GEO.latitude},${GEO.longitude}`,
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Mannar District', alternateName: 'மன்னார் மாவட்டம்', containedInPlace: { '@type': 'AdministrativeArea', name: 'Northern Province, Sri Lanka' } },
      { '@type': 'GeoCircle', geoMidpoint: { '@type': 'GeoCoordinates', ...GEO }, geoRadius: 60000 },
      ...MANNAR_PLACES.map(([name, ta]) => ({ '@type': 'Place', name: `${name}, Mannar`, alternateName: ta })),
    ],
    knowsLanguage: ['ta', 'en'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Event rental & decoration services',
      itemListElement: categories.map((c) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: c.name.en || c.name.ta, alternateName: c.name.ta, url: abs(`/category/${c.id}`), areaServed: { '@type': 'AdministrativeArea', name: 'Mannar District, Sri Lanka' } },
      })),
    },
  };
}

export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
  };
}
