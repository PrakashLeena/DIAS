// Default site content (the 11 categories, items and contact details).
// Used (a) when the database has no content yet and (b) by `npm run seed`.
// After the first save in the Admin Panel the database copy is the source of truth.

const P = (dir, n) => `/images/${dir}/${dir}-${String(n).padStart(2, '0')}.webp`;
const L = (ta, en) => ({ ta, en });
const NONE = L('', '');

let seq = 0;
const item = (name, image = '', group = NONE) => ({ id: `i${++seq}`, name, image, group });
const sized = (size, ta, en, image, group) => item(L(`${size} ${ta}`, `${size} ${en}`), image, group);

const base = (c) => ({
  image: '',
  mode: 'items',
  numbered: false,
  numberPrefix: NONE,
  qtyStepper: true,
  selector: { type: 'preset', options: [], min: 1, max: 18, unit: NONE },
  note: NONE,
  items: [],
  subs: [],
  ...c,
});

export function defaultContent() {
  seq = 0;

  // ---- 1. Kolu / Stage backdrop: numbered photo gallery ----
  const kolu = base({
    id: 'kolu',
    emoji: '🎪',
    name: L('கொலு / மணவறை அலங்காரம்', 'Kolu / Stage Backdrop'),
    image: P('stages', 3),
    numbered: true,
    numberPrefix: L('டிசைன்', 'Design'),
    qtyStepper: false,
    note: L(
      'குறிப்பு: வாடிக்கையாளர்களிடம் சொந்தமாக கொலு டிசைன் இருந்தால், அதுவும் உங்கள் விருப்பத்திற்கு ஏற்ப கஸ்டமைஸ் (Customize) செய்து தரப்படும்.',
      'Note: If customers have their own Kolu design, we will custom-build it according to your exact preferences.'
    ),
    items: Array.from({ length: 39 }, (_, i) => item(NONE, P('stages', i + 1))),
  });

  // ---- 2. Cloth canopy ----
  const clothPhotos = [8, 9, 11, 12, 13, 14, 15, 16];
  const standard = L('சாதாரண துணி பந்தல்', 'Standard Cloth Panthal');
  const dome = L('டோம் பந்தல்', 'Dome Panthal');
  const cloth = base({
    id: 'cloth-canopy',
    emoji: '⛺',
    name: L('துணி பந்தல்', 'Cloth Canopy / Tent'),
    image: P('tents', 14),
    items: [
      ...['20 × 10', '20 × 12', '20 × 14', '20 × 15', '20 × 20'].map((s, i) => sized(s, 'துணி பந்தல்', 'Cloth Canopy', P('tents', clothPhotos[i]), standard)),
      ...['18 × 42', '24 × 56', '24 × 28'].map((s, i) => sized(s, 'டோம் பந்தல்', 'Dome Canopy', P('tents', [18, 19, 20][i]), dome)),
    ],
  });

  // ---- 3. Tin sheet canopy ----
  const tinMain = L('தகர பந்தல்', 'Main Tin Panthal');
  const tinCook = L('சமையல் பந்தல்', 'Cooking Shed Canopy');
  const tin = base({
    id: 'tin-canopy',
    emoji: '🏗️',
    name: L('தகர பந்தல்', 'Tin Sheet Canopy'),
    image: P('tents', 3),
    items: [
      ...['15 × 30', '15 × 40', '15 × 60', '15 × 80', '15 × 100'].map((s, i) => sized(s, 'தகர பந்தல்', 'Tin Canopy', P('tents', [1, 2, 3, 4, 5][i]), tinMain)),
      ...['15 × 10', '15 × 20', '15 × 30'].map((s, i) => sized(s, 'சமையல் பந்தல்', 'Cooking Canopy', P('tents', [7, 2, 5][i]), tinCook)),
    ],
  });

  // ---- 4. Cooking vessels: two sub-categories ----
  const vessels = base({
    id: 'cooking-vessels',
    emoji: '🍲',
    name: L('சமையல் பாத்திரங்கள்', 'Cooking Vessels'),
    mode: 'sub',
    subs: [
      {
        id: 'dasar',
        emoji: '🍲',
        name: L('பாத்திரம் / தசர்', 'Cooking Pots / Dasar'),
        image: '',
        items: [15, 20, 30, 40, 50, 60].map((kg) => item(L(`${kg} kg தசர்`, `${kg} kg Dasar Pot`))),
      },
      {
        id: 'saddi',
        emoji: '🥘',
        name: L('சட்டி', 'Cooking Pan / Saddi'),
        image: '',
        items: [30, 35].map((kg) => item(L(`${kg} kg சட்டி`, `${kg} kg Saddi Pan`))),
      },
    ],
  });

  // ---- 5. Light set ----
  const lights = base({
    id: 'light-set',
    emoji: '💡',
    name: L('மின்விளக்கு அலங்காரம்', 'Light Set'),
    image: P('lighting', 4),
    items: ['20 × 10', '20 × 15', '20 × 20', '30 × 30', '30 × 50', '40 × 50', '50 × 60'].map((s, i) =>
      sized(s, 'மின்விளக்கு செட்', 'Light Set', P('lighting', (i % 5) + 1))
    ),
  });

  // ---- 6. Chairs: photos + preset quantity selector ----
  const chairs = base({
    id: 'chairs',
    emoji: '🪑',
    name: L('கதிரைகள்', 'Chairs'),
    image: P('tents', 11),
    mode: 'selector',
    selector: { type: 'preset', options: [100, 150, 200, 250, 400, 500], min: 1, max: 18, unit: L('கதிரைகள்', 'chairs') },
    items: [8, 11, 13, 16, 17, 20].map((n) => item(NONE, P('tents', n))),
  });

  // ---- 7. Entrance decoration ----
  const entrance = base({
    id: 'entrance-decoration',
    emoji: '🌸',
    name: L('நுழைவாயில் அலங்காரம்', 'Entrance Decoration'),
    image: P('stages', 26),
    numbered: true,
    numberPrefix: L('நுழைவாயில் டிசைன்', 'Entrance Design'),
    qtyStepper: false,
    items: [26, 27, 28, 22].map((n) => item(NONE, P('stages', n))),
  });

  // ---- 8. Buffet set: count 1..18 ----
  const buffet = base({
    id: 'buffet-set',
    emoji: '🍽️',
    name: L('பஃபே செட்', 'Buffet Set'),
    mode: 'selector',
    selector: { type: 'range', options: [], min: 1, max: 18, unit: L('செட்', 'sets') },
  });

  // ---- 9. Smoke machine ----
  const smoke = base({
    id: 'smoke-machine',
    emoji: '💨',
    name: L('புகை இயந்திரம்', 'Smoke Machine'),
    items: [item(L('புகை இயந்திரம்', 'Smoke Machine'))],
  });

  // ---- 10 & 11. Contact-only categories ----
  const contactNote = L(
    'ஒலி அமைப்பு மற்றும் வாகன வாடகை விபரங்களுக்கு உரிமையாளரை நேரடியாகத் தொடர்பு கொள்ளவும்.',
    'Please contact the owner directly for Sound System and Vehicle Hire bookings.'
  );
  const sound = base({ id: 'sound-system', emoji: '🔊', name: L('ஒலி அமைப்பு', 'Sound System'), mode: 'contact', note: contactNote });
  const vehicle = base({ id: 'vehicle-hire', emoji: '🚐', name: L('வாகன வாடகை', 'Vehicle Hire'), mode: 'contact', note: contactNote });

  return {
    site: { name: L('வட்ஷன் பந்தல் சேவை', 'Watson Decoration') },
    contact: { whatsapp: '+94751318809', phones: ['0760004755', '0716468691'] },
    categories: [kolu, cloth, tin, vessels, lights, chairs, entrance, buffet, smoke, sound, vehicle],
  };
}
