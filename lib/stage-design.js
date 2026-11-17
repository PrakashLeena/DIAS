// "3D வடிவமைப்பு" (3D Customizer) configuration shared by the homepage hero and
// Admin → 3D Design. The geometry (hotspot boxes) is tied to the hero photo and
// stays in code; names, descriptions, visibility and colour options are
// editable by the administrator and stored in WebsiteSettings.stageDesign.
import { homeUi } from './i18n/home-ui.js';

/** The interactive photo (first slide of /public/images/image-slider). */
export const STAGE_IMG = '/images/image-slider/slide-01.webp';
/** Background slideshow — the interactive stage first, then the other photos. */
export const SLIDES = [STAGE_IMG, '/images/image-slider/slide-02.webp', '/images/image-slider/slide-03.webp', '/images/image-slider/slide-04.webp'];

const R = (x1, y1, x2, y2) => ({ x: x1 / 12.8, y: y1 / 7.2, w: (x2 - x1) / 12.8, h: (y2 - y1) / 7.2 });
const ARCH = '50% 50% 6% 6% / 30% 30% 4% 4%';
// Boxes are in % of the 16:9 photo (authored on a 1280×720 grid).
export const HOTSPOTS = [
  { id: 'floor', key: 'floor', panel: 'floor', icon: 'Layers', box: R(60, 630, 1280, 720), z: 1, radius: '60px 60px 0 0', zoom: 1.45 },
  { id: 'valance', key: 'valance', panel: 'drapes', icon: 'Theater', box: R(155, 18, 1138, 158), z: 2, radius: '14px', zoom: 1.7 },
  { id: 'archC', key: 'archC', panel: 'florals', icon: 'Flower2', box: R(362, 186, 882, 560), z: 2, radius: '48% 48% 6% 6% / 42% 42% 6% 6%', zoom: 1.55 },
  { id: 'archL', key: 'archL', panel: 'florals', icon: 'Flower2', box: R(30, 150, 282, 575), z: 2, radius: ARCH, zoom: 1.8 },
  { id: 'archR', key: 'archR', panel: 'florals', icon: 'Flower2', box: R(1026, 140, 1275, 582), z: 2, radius: ARCH, zoom: 1.8 },
  { id: 'candlesL', key: 'candles', panel: 'lighting', icon: 'Lightbulb', box: R(26, 360, 212, 668), z: 3, radius: '16px', zoom: 1.9 },
  { id: 'candlesR', key: 'candles', panel: 'lighting', icon: 'Lightbulb', box: R(1080, 362, 1262, 672), z: 3, radius: '16px', zoom: 1.9 },
  { id: 'chandL', key: 'chand', panel: 'lighting', icon: 'Sparkles', box: R(258, 224, 342, 292), z: 4, radius: '40%', zoom: 2.6 },
  { id: 'chandC', key: 'chand', panel: 'lighting', icon: 'Sparkles', box: R(608, 286, 694, 346), z: 4, radius: '40%', zoom: 2.6 },
  { id: 'chandR', key: 'chand', panel: 'lighting', icon: 'Sparkles', box: R(958, 224, 1044, 292), z: 4, radius: '40%', zoom: 2.6 },
  { id: 'lanternL', key: 'lantern', panel: 'lighting', icon: 'Lamp', box: R(390, 585, 472, 694), z: 4, radius: '18px', zoom: 2.4 },
  { id: 'lanternR', key: 'lantern', panel: 'lighting', icon: 'Lamp', box: R(870, 590, 944, 700), z: 4, radius: '18px', zoom: 2.4 },
  { id: 'seat', key: 'seat', panel: 'seat', icon: 'Armchair', box: R(458, 420, 834, 668), z: 5, radius: '30% 30% 10% 10% / 40% 40% 10% 10%', zoom: 2.0 },
];

/** Editable elements, in the order shown in the admin panel. */
export const ELEMENT_KEYS = ['seat', 'archC', 'archL', 'archR', 'valance', 'chand', 'candles', 'lantern', 'floor'];
export const PANEL_KEYS = ['seat', 'florals', 'lighting', 'floor', 'drapes'];
export const LIGHT_KEYS = ['bright', 'candle', 'golden'];
/** Colour option groups. The first option of each group is the photo as taken (no recolouring). */
export const OPTION_GROUPS = ['flora', 'seat', 'floor', 'valance'];
export const GROUP_PANEL = { flora: 'florals', seat: 'seat', floor: 'floor', valance: 'drapes' };
export const MAX_OPTIONS = 8;

const DEFAULT_OPTIONS = {
  flora: [['crimson', '#B3122E', '#FDFAF4'], ['blush', '#EEA0AC', '#FDFAF4'], ['ivory', '#F6F0E2', '#9DB08A'], ['gold', '#F0B46E', '#FDFAF4']],
  seat: [['champagne', '#D9C29A'], ['blush', '#DEA0A5'], ['emerald', '#24624E'], ['maroon', '#801A34']],
  floor: [['turf', '#4FA830'], ['red', '#B01622']],
  valance: [['maroon', '#8E1B3A', '#EFE1C2'], ['emerald', '#1C5C48', '#EFE1C2'], ['navy', '#203270', '#EFE1C2'], ['gold', '#C49848', '#EFE1C2']],
};

const both = (fn) => ({ ta: fn(homeUi.ta), en: fn(homeUi.en) });
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const HEX = /^#[0-9a-f]{6}$/i;
const L = (stored, fallback) => ({ ta: (isObj(stored) && stored.ta?.trim()) || fallback.ta, en: (isObj(stored) && stored.en?.trim()) || fallback.en });

export function defaultStageDesign() {
  return {
    elements: Object.fromEntries(ELEMENT_KEYS.map((k) => [k, { enabled: true, action: both((u) => u.hotspots[k][0]), name: both((u) => u.hotspots[k][1]) }])),
    panels: Object.fromEntries(PANEL_KEYS.map((k) => [k, { title: both((u) => u.panels[k][0]), description: both((u) => u.panels[k][1]) }])),
    lights: Object.fromEntries(LIGHT_KEYS.map((k) => [k, { short: both((u) => u.light[k][0]), long: both((u) => u.light[k][1]) }])),
    options: Object.fromEntries(
      OPTION_GROUPS.map((g) => [g, DEFAULT_OPTIONS[g].map(([v, color, accent]) => ({ v, enabled: true, color, accent: accent || '', label: both((u) => u[g][v]) }))])
    ),
  };
}

/** Merges what the administrator saved over the defaults; anything missing or invalid falls back. */
export function resolveStageDesign(stored) {
  const d = defaultStageDesign();
  if (!isObj(stored)) return d;
  for (const k of ELEMENT_KEYS) {
    const s = stored.elements?.[k];
    if (!isObj(s)) continue;
    d.elements[k] = { enabled: s.enabled !== false, action: L(s.action, d.elements[k].action), name: L(s.name, d.elements[k].name) };
  }
  for (const k of PANEL_KEYS) {
    const s = stored.panels?.[k];
    if (isObj(s)) d.panels[k] = { title: L(s.title, d.panels[k].title), description: L(s.description, d.panels[k].description) };
  }
  for (const k of LIGHT_KEYS) {
    const s = stored.lights?.[k];
    if (isObj(s)) d.lights[k] = { short: L(s.short, d.lights[k].short), long: L(s.long, d.lights[k].long) };
  }
  for (const g of OPTION_GROUPS) {
    const list = stored.options?.[g];
    if (!Array.isArray(list) || !list.length) continue;
    const seen = new Set();
    const out = [];
    list.slice(0, MAX_OPTIONS).forEach((o, i) => {
      if (!isObj(o) || typeof o.v !== 'string' || !/^[a-z0-9-]{1,20}$/.test(o.v) || seen.has(o.v)) return;
      seen.add(o.v);
      const def = d.options[g].find((x) => x.v === o.v);
      const fallbackLabel = def?.label || { ta: o.v, en: o.v };
      out.push({
        v: o.v,
        enabled: i === 0 ? true : o.enabled !== false,
        color: HEX.test(o.color || '') ? o.color : def?.color || '#D4A845',
        accent: HEX.test(o.accent || '') ? o.accent : def?.accent || '',
        label: L(o.label, fallbackLabel),
      });
    });
    // The original photo colour must stay first so "reset" always exists.
    const original = d.options[g][0];
    if (!out.length || out[0].v !== original.v) {
      const idx = out.findIndex((o) => o.v === original.v);
      const first = idx >= 0 ? out.splice(idx, 1)[0] : original;
      out.unshift({ ...first, enabled: true });
    }
    d.options[g] = out.slice(0, MAX_OPTIONS);
  }
  return d;
}

const hexToRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

/** Option lists in the shape the hero/estimator use: { v, sw, T } (T = recolour target, null for the original). */
export function stageOptions(design) {
  return Object.fromEntries(
    OPTION_GROUPS.map((g) => [
      g,
      design.options[g]
        .filter((o) => o.enabled)
        .map((o, i) => ({ v: o.v, sw: g === 'seat' || g === 'floor' ? o.color : [o.color, o.accent || '#FDFAF4'], T: i === 0 && o.v === design.options[g][0].v ? null : hexToRgb(o.color) })),
    ])
  );
}

/** Homepage text with the administrator's names/descriptions applied. */
export function applyStageText(t, design, lang) {
  const pick = (o) => o[lang] || o.en;
  return {
    ...t,
    hotspots: Object.fromEntries(ELEMENT_KEYS.map((k) => [k, [pick(design.elements[k].action), pick(design.elements[k].name)]])),
    panels: Object.fromEntries(PANEL_KEYS.map((k) => [k, [pick(design.panels[k].title), pick(design.panels[k].description)]])),
    light: Object.fromEntries(LIGHT_KEYS.map((k) => [k, [pick(design.lights[k].short), pick(design.lights[k].long)]])),
    ...Object.fromEntries(OPTION_GROUPS.map((g) => [g, Object.fromEntries(design.options[g].map((o) => [o.v, pick(o.label)]))])),
  };
}
