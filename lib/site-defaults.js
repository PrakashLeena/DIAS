// Fallback values used until the administrator fills in Website Settings.
export const SEO_KEYWORDS_PLACEHOLDER = '[CLIENT SEO KEYWORDS WILL BE PROVIDED HERE]';

export const DEFAULT_SETTINGS = {
  companyName: { ta: 'வட்ஷன் பந்தல் சேவை', en: 'Watson Decoration' },
  tagline: { ta: 'பந்தல் · மேடை அலங்காரம் · வாடகை உபகரணங்கள்', en: 'Tents · Stage decoration · Rental equipment' },
  logo: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: { ta: '', en: '' },
  businessHours: { ta: 'திங்கள் – ஞாயிறு, காலை 8 – இரவு 8', en: 'Monday – Sunday, 8 am – 8 pm' },
  mapEmbedUrl: '',
  mapLink: '',
  social: { facebook: '', instagram: '', youtube: '', tiktok: '' },
  currency: { code: 'LKR', symbol: 'Rs.' },
  phoneCountryCode: '94',
  hero: {
    heading: { ta: '', en: '' },
    subheading: { ta: '', en: '' },
    videoUrl: '/videos/hero.mp4',
    posterUrl: '/images/lighting/lighting-04.webp',
  },
  about: { title: { ta: '', en: '' }, body: { ta: '', en: '' }, image: '/images/tents/tents-15.webp' },
  gallery: [],
  testimonials: [],
  seo: {
    siteTitle: { ta: 'வட்ஷன் பந்தல் சேவை', en: 'Watson Decoration' },
    metaDescription: {
      ta: 'திருமணம், நிச்சயதார்த்தம், பிறந்தநாள் மற்றும் குடும்ப விழாக்களுக்கான பந்தல், மேடை அலங்காரம், நாற்காலி, மேசை மற்றும் சமையல் உபகரண வாடகை.',
      en: 'Tent rental, stage decoration, chairs, tables and cooking equipment for weddings, engagements, birthdays and family functions.',
    },
    keywords: { ta: SEO_KEYWORDS_PLACEHOLDER, en: SEO_KEYWORDS_PLACEHOLDER },
    ogImage: '/images/tents/tents-15.webp',
    googleVerification: '',
  },
};

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

/** Deep-merges stored settings over defaults; empty strings fall back to defaults. */
export function mergeSettings(defaults, stored) {
  if (!isPlainObject(stored)) return defaults;
  const out = { ...defaults };
  for (const [k, v] of Object.entries(stored)) {
    if (isPlainObject(v) && isPlainObject(defaults[k])) out[k] = mergeSettings(defaults[k], v);
    else if (Array.isArray(v)) out[k] = v.length || !Array.isArray(defaults[k]) ? v : defaults[k];
    else if (v !== '' && v !== null && v !== undefined) out[k] = v;
  }
  return out;
}
