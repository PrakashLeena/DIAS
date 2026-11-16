// Seeds sample categories, products, packages and website settings for
// development / first launch. Prices and stock levels are SAMPLE values — the
// administrator should review them in the dashboard before going live.
//
//   npm run seed            -> inserts data only if the catalogue is empty
//   npm run seed -- --force -> wipes categories/products/packages/settings first (never orders/admins)
import mongoose from 'mongoose';
import { connectDB } from '../lib/db.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Package from '../models/Package.js';
import WebsiteSettings from '../models/WebsiteSettings.js';
import Order from '../models/Order.js';
import RateLimit from '../models/RateLimit.js';
import Admin from '../models/Admin.js';
import { slugify } from '../utils/slug.js';
import { DEFAULT_SETTINGS } from '../lib/site-defaults.js';

const force = process.argv.includes('--force');
await connectDB();
// Build all indexes declared in the schemas.
await Promise.all([Category, Product, Package, WebsiteSettings, Order, RateLimit, Admin].map((m) => m.syncIndexes()));

if (!force && (await Product.estimatedDocumentCount()) > 0) {
  console.log('Catalogue already has data. Run with --force to replace categories, products, packages and settings.');
  await mongoose.disconnect();
  process.exit(0);
}
if (force) {
  await Promise.all([Category.deleteMany({}), Product.deleteMany({}), Package.deleteMany({}), WebsiteSettings.deleteMany({})]);
}

const T = '/images/tents/tents-';
const S = '/images/stages/stages-';
const L = '/images/lighting/lighting-';
const img = (base, ...n) => n.map((x) => `${base}${String(x).padStart(2, '0')}.webp`);

const categories = [
  { key: 'large', name: { ta: 'பெரிய பந்தல்', en: 'Large Tents' }, description: { ta: 'திருமணம் மற்றும் பெரிய விழாக்களுக்கான விசாலமான பந்தல்கள்.', en: 'Spacious tents for weddings and large functions.' }, icon: 'tent-large', image: img(T, 11)[0] },
  { key: 'small', name: { ta: 'சிறிய பந்தல்', en: 'Small Tents' }, description: { ta: 'வீட்டு விழாக்கள் மற்றும் சிறிய நிகழ்வுகளுக்கான பந்தல்கள்.', en: 'Tents for home functions and smaller gatherings.' }, icon: 'tent', image: img(T, 3)[0] },
  { key: 'stage', name: { ta: 'திருமண மேடை', en: 'Wedding Stages' }, description: { ta: 'மலர், திரைச்சீலை மற்றும் விளக்குகளுடன் அலங்கரிக்கப்பட்ட மேடைகள்.', en: 'Stages dressed with florals, drapes and lighting.' }, icon: 'stage', image: img(S, 7)[0] },
  { key: 'tables', name: { ta: 'மேசைகள்', en: 'Tables' }, description: { ta: 'சாப்பாடு மற்றும் விருந்துக்கான மேசைகள்.', en: 'Dining and banquet tables.' }, icon: 'table', image: '' },
  { key: 'chairs', name: { ta: 'நாற்காலிகள்', en: 'Chairs' }, description: { ta: 'உறையுடன் மற்றும் சாதாரண நாற்காலிகள்.', en: 'Covered and standard chairs.' }, icon: 'chair', image: img(T, 21)[0] },
  { key: 'cooking', name: { ta: 'சமையல் பாத்திரங்கள்', en: 'Cooking Equipment' }, description: { ta: 'பெரிய சமையல் பாத்திரங்கள், அடுப்புகள் மற்றும் பரிமாறும் பாத்திரங்கள்.', en: 'Large cooking pots, stoves and serving vessels.' }, icon: 'cooking', image: '' },
  { key: 'decor', name: { ta: 'அலங்காரப் பொருட்கள்', en: 'Decoration Items' }, description: { ta: 'மலர் வளைவுகள், விளக்குகள் மற்றும் அலங்காரங்கள்.', en: 'Flower arches, lights and décor.' }, icon: 'decoration', image: img(L, 1)[0] },
  { key: 'other', name: { ta: 'இதர உபகரணங்கள்', en: 'Other Equipment' }, description: { ta: 'மின்பிறப்பாக்கி, மின்விசிறி மற்றும் பிற உபகரணங்கள்.', en: 'Generators, fans and other equipment.' }, icon: 'other', image: img(L, 4)[0] },
];

const catDocs = {};
for (const [i, c] of categories.entries()) {
  const { key, ...rest } = c;
  catDocs[key] = await Category.create({ ...rest, slug: slugify(c.name.en), sortOrder: i + 1 });
}

const spec = (lt, le, vt, ve) => ({ label: { ta: lt, en: le }, value: { ta: vt, en: ve } });

const products = [
  { key: 'largeTent', cat: 'large', name: { ta: 'பெரிய திருமண பந்தல்', en: 'Large Wedding Tent' }, price: 45000, unit: 'per_event', qty: 3, featured: true, images: img(T, 11, 8, 20), desc: { ta: 'வண்ணத் திரைச்சீலைகள், கூரை அலங்காரம் மற்றும் விளக்குகளுடன் கூடிய பெரிய திருமண பந்தல். அமைப்பு மற்றும் அகற்றுதல் உட்பட.', en: 'A large wedding tent with coloured drapes, ceiling décor and lighting. Includes setup and take-down.' }, specs: [spec('கொள்ளளவு', 'Capacity', 'சுமார் 400 விருந்தினர்கள்', 'About 400 guests'), spec('அளவு', 'Size', '40 × 100 அடி', '40 × 100 ft')] },
  { key: 'domeTent', cat: 'large', name: { ta: 'வளைவு கூரை பந்தல்', en: 'Arched Dome Tent' }, price: 35000, unit: 'per_event', qty: 2, images: img(T, 14, 10, 9), desc: { ta: 'உறுதியான இரும்புச் சட்டத்துடன் கூடிய வளைவு கூரை பந்தல். மழை மற்றும் வெயிலுக்கு ஏற்றது.', en: 'An arched dome tent on a sturdy steel frame, suitable for both rain and sun.' }, specs: [spec('கொள்ளளவு', 'Capacity', 'சுமார் 300 விருந்தினர்கள்', 'About 300 guests')] },
  { key: 'smallTent', cat: 'small', name: { ta: 'சிறிய பந்தல்', en: 'Small Tent' }, price: 8000, unit: 'per_event', qty: 6, featured: true, images: img(T, 3, 1, 4), desc: { ta: 'வீட்டு விழாக்கள் மற்றும் சிறிய கூட்டங்களுக்கான பந்தல்.', en: 'A tent for home functions and small gatherings.' }, specs: [spec('கொள்ளளவு', 'Capacity', 'சுமார் 100 விருந்தினர்கள்', 'About 100 guests')] },
  { key: 'canopy', cat: 'small', name: { ta: 'வண்ணக் கூரைப் பந்தல்', en: 'Colour Canopy Tent' }, price: 6000, unit: 'per_event', qty: 8, images: img(T, 2, 5), desc: { ta: 'திறந்த வெளி நிகழ்வுகளுக்கான வண்ணக் கூரைப் பந்தல்.', en: 'A coloured canopy tent for open-air events.' }, specs: [] },
  { key: 'stage', cat: 'stage', name: { ta: 'திருமண மேடை அலங்காரம்', en: 'Wedding Stage Decoration' }, price: 25000, unit: 'per_event', qty: 3, featured: true, images: img(S, 7, 12, 13), desc: { ta: 'மலர் அலங்காரம், திரைச்சீலைகள், மணமக்கள் இருக்கை மற்றும் விளக்குகளுடன் கூடிய திருமண மேடை.', en: 'A wedding stage with floral décor, drapes, a couple’s seat and lighting.' }, specs: [spec('உள்ளடக்கம்', 'Includes', 'மலர் வளைவு, இருக்கை, விளக்குகள்', 'Flower arch, seat, lights')] },
  { key: 'premiumStage', cat: 'stage', name: { ta: 'சிறப்பு மேடை அலங்காரம்', en: 'Premium Stage Decoration' }, price: 45000, unit: 'per_event', qty: 2, featured: true, images: img(S, 26, 24, 20), desc: { ta: 'மூன்று மலர் வளைவுகள், சரவிளக்குகள், மெழுகுவர்த்தி ஸ்டாண்டுகள் மற்றும் செதுக்கப்பட்ட இருக்கையுடன் கூடிய சிறப்பு மேடை.', en: 'A premium stage with three flower arches, chandeliers, candle stands and a carved loveseat.' }, specs: [] },
  { key: 'birthdayStage', cat: 'stage', name: { ta: 'பிறந்தநாள் மேடை அமைப்பு', en: 'Birthday Stage Setup' }, price: 15000, unit: 'per_event', qty: 3, images: img(S, 11, 19, 21), desc: { ta: 'பலூன்கள், பெயர் எழுத்துகள் மற்றும் விளக்குகளுடன் பிறந்தநாள் மேடை.', en: 'A birthday stage with balloons, letter props and lights.' }, specs: [] },
  { key: 'tables', cat: 'tables', name: { ta: 'சாப்பாட்டு மேசைகள்', en: 'Dining Tables' }, price: 300, unit: 'per_item', qty: 60, images: [], desc: { ta: 'விருந்துக்கான நீள் சாப்பாட்டு மேசைகள்.', en: 'Long dining tables for banquets.' }, specs: [spec('இருக்கைகள்', 'Seats', '6 பேர்', '6 people')] },
  { key: 'roundTable', cat: 'tables', name: { ta: 'வட்ட விருந்து மேசை', en: 'Round Banquet Table' }, price: 450, unit: 'per_item', qty: 30, images: [], desc: { ta: 'மேசை விரிப்புடன் கூடிய வட்ட மேசை.', en: 'Round table with a table cloth.' }, specs: [spec('இருக்கைகள்', 'Seats', '8 பேர்', '8 people')] },
  { key: 'chairs', cat: 'chairs', name: { ta: 'பிளாஸ்டிக் நாற்காலிகள்', en: 'Plastic Chairs' }, price: 15, unit: 'per_item', qty: 1000, featured: true, images: [], desc: { ta: 'உறுதியான பிளாஸ்டிக் நாற்காலிகள்.', en: 'Sturdy plastic chairs.' }, specs: [], minQty: 10 },
  { key: 'coveredChairs', cat: 'chairs', name: { ta: 'அலங்கார உறை நாற்காலிகள்', en: 'Covered Chairs with Bow' }, price: 40, unit: 'per_item', qty: 500, images: img(T, 21, 18, 17), desc: { ta: 'வெள்ளை, சிவப்பு அல்லது நீல உறையும் வில் அலங்காரமும் கொண்ட நாற்காலிகள்.', en: 'Chairs with white, red or blue covers and a bow sash.' }, specs: [], minQty: 10 },
  { key: 'pots', cat: 'cooking', name: { ta: 'பெரிய சமையல் பாத்திரங்கள்', en: 'Large Cooking Pots' }, price: 500, unit: 'per_day', qty: 30, images: [], desc: { ta: 'பெரிய அளவிலான சமையலுக்கான அலுமினிய / வெண்கலப் பாத்திரங்கள்.', en: 'Aluminium / bronze pots for large-scale cooking.' }, specs: [] },
  { key: 'stoves', cat: 'cooking', name: { ta: 'எரிவாயு அடுப்புகள்', en: 'Gas Stoves' }, price: 600, unit: 'per_day', qty: 15, images: [], desc: { ta: 'வணிகப் பயன்பாட்டிற்கான பெரிய எரிவாயு அடுப்புகள் (சிலிண்டர் தவிர).', en: 'Commercial gas burners (cylinder not included).' }, specs: [] },
  { key: 'serving', cat: 'cooking', name: { ta: 'பரிமாறும் பாத்திரங்கள்', en: 'Serving Vessels' }, price: 100, unit: 'per_item', qty: 200, images: [], desc: { ta: 'உணவு பரிமாறுவதற்கான பாத்திரங்கள் மற்றும் கரண்டிகள்.', en: 'Serving bowls, buckets and ladles.' }, specs: [] },
  { key: 'glasses', cat: 'cooking', name: { ta: 'குவளைகள்', en: 'Glasses' }, price: 3, unit: 'per_item', qty: 2000, images: [], desc: { ta: 'தண்ணீர் / பானங்களுக்கான குவளைகள்.', en: 'Glasses for water and drinks.' }, specs: [], minQty: 50 },
  { key: 'plates', cat: 'cooking', name: { ta: 'தட்டுகள்', en: 'Plates' }, price: 5, unit: 'per_item', qty: 2000, images: [], desc: { ta: 'சாப்பாட்டுத் தட்டுகள்.', en: 'Dinner plates.' }, specs: [], minQty: 50 },
  { key: 'lights', cat: 'decor', name: { ta: 'அலங்கார விளக்குகள்', en: 'Decorative Lighting' }, price: 8000, unit: 'per_event', qty: 6, featured: true, images: img(L, 4, 3, 5), desc: { ta: 'பந்தல் மற்றும் திறந்த வெளிக்கான சர விளக்குகள்.', en: 'String lights for tents and open grounds.' }, specs: [] },
  { key: 'arch', cat: 'decor', name: { ta: 'மலர் வளைவுப் பாதை', en: 'Flower Arch Walkway' }, price: 18000, unit: 'per_event', qty: 2, featured: true, images: img(L, 1, 2), desc: { ta: 'விளக்குகளுடன் கூடிய வெள்ளை மலர் வளைவுப் பாதை.', en: 'A walkway of illuminated white flower arches.' }, specs: [] },
  { key: 'generator', cat: 'other', name: { ta: 'மின்பிறப்பாக்கி', en: 'Generator' }, price: 5000, unit: 'per_day', qty: 3, images: [], desc: { ta: 'விழா முழுவதும் தடையில்லா மின்சாரத்திற்கு.', en: 'Uninterrupted power for the whole function.' }, specs: [spec('திறன்', 'Capacity', '15 kVA', '15 kVA')] },
  { key: 'fans', cat: 'other', name: { ta: 'நிற்கும் மின்விசிறிகள்', en: 'Pedestal Fans' }, price: 300, unit: 'per_day', qty: 40, images: [], desc: { ta: 'பந்தலுக்குள் காற்றோட்டத்திற்கு.', en: 'Keep the tent cool and airy.' }, specs: [] },
];

const prodDocs = {};
for (const [i, p] of products.entries()) {
  prodDocs[p.key] = await Product.create({
    name: p.name,
    description: p.desc,
    slug: slugify(p.name.en),
    category: catDocs[p.cat]._id,
    images: p.images,
    rentalPrice: p.price,
    pricingUnit: p.unit,
    totalQuantity: p.qty,
    minOrderQuantity: p.minQty || 1,
    specifications: p.specs,
    isFeatured: !!p.featured,
    sortOrder: i,
  });
}

const it = (key, quantity) => ({ product: prodDocs[key]._id, quantity });
const packages = [
  {
    name: { ta: 'சிறிய திருமணத் தொகுப்பு', en: 'Small Wedding Package' },
    shortDescription: { ta: 'வீட்டில் அல்லது சிறிய மண்டபத்தில் நடைபெறும் திருமணத்திற்கு.', en: 'For weddings at home or in a small hall.' },
    description: { ta: 'சுமார் 100 விருந்தினர்களுக்கான முழுமையான திருமண அமைப்பு — பந்தல், மேடை அலங்காரம், மேசைகள், நாற்காலிகள் மற்றும் சமையல் உபகரணங்கள். எங்கள் குழு கொண்டு வந்து அமைத்து, விழா முடிந்ததும் அகற்றும்.', en: 'A complete wedding setup for about 100 guests — tent, stage decoration, tables, chairs and cooking equipment. Our crew delivers, sets up and takes everything down after the function.' },
    category: 'wedding', coverImage: img(T, 16)[0], gallery: img(T, 16, 13, 12), packagePrice: 65000, featured: true,
    items: [it('smallTent', 1), it('stage', 1), it('tables', 10), it('coveredChairs', 100), it('glasses', 100), it('plates', 100), it('pots', 4), it('stoves', 2)],
  },
  {
    name: { ta: 'பிரீமியம் திருமணத் தொகுப்பு', en: 'Premium Wedding Package' },
    shortDescription: { ta: '250 விருந்தினர்களுக்கான அழகிய திருமண அமைப்பு.', en: 'An elegant wedding setup for 250 guests.' },
    description: { ta: 'பெரிய பந்தல், மேடை அலங்காரம், 20 மேசைகள், 250 நாற்காலிகள், 250 குவளைகள் மற்றும் 10 சமையல் பாத்திரங்கள் அடங்கிய தொகுப்பு.', en: 'A large tent, stage decoration, 20 tables, 250 chairs, 250 glasses and 10 cooking vessels.' },
    category: 'wedding', coverImage: img(T, 15)[0], gallery: img(T, 15, 11, 6), packagePrice: 150000, featured: true,
    items: [it('largeTent', 1), it('stage', 1), it('tables', 20), it('coveredChairs', 250), it('glasses', 250), it('pots', 10)],
  },
  {
    name: { ta: 'பெரிய திருமணத் தொகுப்பு', en: 'Large Wedding Package' },
    shortDescription: { ta: '300 விருந்தினர்களுக்கான முழுமையான சிறப்பு அலங்காரம்.', en: 'Full premium décor for 300 guests.' },
    description: { ta: 'பெரிய திருமண பந்தல், சிறப்பு மேடை அலங்காரம், மலர் வளைவுப் பாதை, அலங்கார விளக்குகள், 25 மேசைகள், 300 நாற்காலிகள் மற்றும் முழுமையான சமையல் உபகரணங்கள்.', en: 'A large wedding tent, premium stage decoration, flower arch walkway, decorative lighting, 25 tables, 300 chairs and complete cooking equipment.' },
    category: 'wedding', coverImage: img(S, 26)[0], gallery: img(S, 26, 24, 33), packagePrice: 185000, featured: true,
    items: [it('largeTent', 1), it('premiumStage', 1), it('arch', 1), it('lights', 1), it('tables', 25), it('coveredChairs', 300), it('glasses', 300), it('plates', 300), it('pots', 10), it('stoves', 4), it('serving', 20)],
  },
  {
    name: { ta: 'பிறந்தநாள் கொண்டாட்டத் தொகுப்பு', en: 'Birthday Celebration Package' },
    shortDescription: { ta: 'பலூன் மேடை, விளக்குகள் மற்றும் 60 விருந்தினர்களுக்கான இருக்கைகள்.', en: 'Balloon stage, lights and seating for 60 guests.' },
    description: { ta: 'வண்ணக் கூரைப் பந்தல், பிறந்தநாள் மேடை அமைப்பு, அலங்கார விளக்குகள், 6 மேசைகள் மற்றும் 60 நாற்காலிகள்.', en: 'A colour canopy tent, birthday stage setup, decorative lights, 6 tables and 60 chairs.' },
    category: 'birthday', coverImage: img(S, 19)[0], gallery: img(S, 19, 11, 21), packagePrice: 35000, featured: false,
    items: [it('canopy', 1), it('birthdayStage', 1), it('lights', 1), it('tables', 6), it('chairs', 60), it('glasses', 60), it('plates', 60)],
  },
];
for (const [i, p] of packages.entries()) {
  const { featured, ...rest } = p;
  await Package.create({ ...rest, slug: slugify(p.name.en), isFeatured: featured, sortOrder: i });
}

const groups = [
  img(S, 26, 7, 33, 24, 12, 20, 22, 16, 11, 19, 36, 28).map((url) => ({ url, category: 'stage', caption: { ta: 'மேடை அலங்காரம்', en: 'Stage decoration' } })),
  img(T, 15, 11, 8, 6, 13, 20, 14, 1).map((url) => ({ url, category: 'tent', caption: { ta: 'பந்தல் அலங்காரம்', en: 'Tent decoration' } })),
  img(L, 1, 2, 3, 4, 5).map((url) => ({ url, category: 'lighting', caption: { ta: 'விளக்கு அலங்காரம்', en: 'Lighting décor' } })),
];
// Interleave so the homepage preview shows a mix.
const gallery = [];
for (let i = 0; groups.some((g) => g[i]); i++) for (const g of groups) if (g[i]) gallery.push(g[i]);

const testimonials =
  process.env.NODE_ENV === 'production'
    ? []
    : [
        { name: 'Sample — R. Kumar', event: { ta: 'திருமணம் · 300 விருந்தினர்கள்', en: 'Wedding · 300 guests' }, quote: { ta: 'பந்தலும் மேடையும் நாங்கள் எதிர்பார்த்ததை விட அழகாக இருந்தது. நேரத்தில் அமைத்து முடித்தார்கள்.', en: 'The tent and stage looked even better than we hoped, and everything was ready on time.' }, rating: 5 },
        { name: 'Sample — S. Mary', event: { ta: 'பிறந்தநாள் · 80 விருந்தினர்கள்', en: 'Birthday · 80 guests' }, quote: { ta: 'பலூன் மேடை குழந்தைகளுக்கு மிகவும் பிடித்தது.', en: 'The children loved the balloon stage.' }, rating: 5 },
        { name: 'Sample — A. Fernando', event: { ta: 'நிச்சயதார்த்தம் · 150 விருந்தினர்கள்', en: 'Engagement · 150 guests' }, quote: { ta: 'விலை தெளிவாக இருந்தது, குழுவினர் மிகவும் பொறுப்பாக நடந்துகொண்டனர்.', en: 'Clear pricing and a very responsible crew.' }, rating: 5 },
      ];

await WebsiteSettings.create({
  key: 'main',
  ...DEFAULT_SETTINGS,
  hero: {
    heading: { ta: 'உங்கள் விழாவை அழகாக்கும் பந்தல் சேவை', en: 'Tents and stages that make your celebration beautiful' },
    subheading: { ta: '', en: '' },
    videoUrl: '/videos/hero.mp4',
    posterUrl: '/images/lighting/lighting-04.webp',
  },
  about: {
    title: { ta: 'வட்ஷன் பந்தல் சேவை பற்றி', en: 'About Watson Decoration' },
    body: {
      ta: 'வட்ஷன் பந்தல் சேவை திருமணங்கள், நிச்சயதார்த்தங்கள், பிறந்தநாள் விழாக்கள், சமய நிகழ்வுகள் மற்றும் குடும்ப விழாக்களுக்கு பந்தல், மேடை அலங்காரம், நாற்காலி, மேசை, சமையல் பாத்திரங்கள் மற்றும் அலங்காரப் பொருட்களை வாடகைக்கு வழங்குகிறது.\n\nஒவ்வொரு விழாவையும் எங்கள் சொந்தக் குழுவே அமைத்து, விழா முடிந்ததும் அகற்றுகிறது. தனிப் பொருட்களை வாடகைக்கு எடுக்கலாம், தயாரான தொகுப்புகளைத் தேர்வு செய்யலாம், அல்லது உங்கள் தேவைக்கு ஏற்ப தனிப்பயன் தொகுப்பை உருவாக்கலாம்.',
      en: 'Watson Decoration provides tents, stage decoration, chairs, tables, cooking equipment and decoration items for weddings, engagements, birthdays, religious functions and family celebrations.\n\nOur own crew sets up every function and takes everything down afterwards. Rent individual items, choose a ready-made package, or build a custom package that fits your needs.',
    },
    image: img(T, 15)[0],
  },
  gallery,
  testimonials,
});

console.log(`Seeded ${categories.length} categories, ${products.length} products, ${packages.length} packages and website settings.`);
await mongoose.disconnect();
