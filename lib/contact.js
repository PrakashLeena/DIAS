// Contact + WhatsApp message helpers (safe to import from client and server code).

/** Digits-only international number for wa.me, e.g. "+94 75 131 8809" / "0751318809" -> "94751318809". */
export function waNumber(raw = '') {
  let d = String(raw).replace(/[^\d]/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  else if (d.startsWith('0')) d = '94' + d.slice(1); // Sri Lanka local format
  return d;
}

export const telHref = (raw = '') => `tel:${String(raw).replace(/[^\d+]/g, '')}`;

export const waHref = (raw, text = '') => `https://wa.me/${waNumber(raw)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/** "0760004755" -> "076 000 4755" (display only). */
export function prettyPhone(raw = '') {
  const d = String(raw).replace(/\s+/g, '');
  return /^0\d{9}$/.test(d) ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : raw;
}

const both = (n) => (n?.ta && n?.en ? `${n.ta} (${n.en})` : n?.ta || n?.en || '');

/** Builds the WhatsApp order text from the selection lines, grouped by category. */
export function buildOrderMessage(lines, { siteName, note } = {}) {
  const out = [];
  out.push(`வணக்கம்! / Hello${siteName?.en ? ` ${siteName.en}` : ''}! 🙏`);
  out.push('எனக்கு கீழ்க்காணும் பொருட்கள் தேவை / I would like to order the following:');
  const groups = [];
  for (const l of lines) {
    let g = groups.find((x) => x.catId === l.catId);
    if (!g) groups.push((g = { catId: l.catId, catEmoji: l.catEmoji, catName: l.catName, lines: [] }));
    g.lines.push(l);
  }
  for (const g of groups) {
    out.push('');
    out.push(`${g.catEmoji || '•'} *${both(g.catName)}*`);
    for (const l of g.lines) {
      const unit = l.unit ? ` ${l.unit.en || l.unit.ta}` : '';
      const qty = l.qty > 1 || l.showQty ? ` × ${l.qty}${unit}` : '';
      out.push(`   • ${both(l.label)}${qty}`);
    }
  }
  out.push('');
  out.push(`மொத்தம் / Total selections: ${lines.length}`);
  if (note?.trim()) {
    out.push('');
    out.push(`📝 ${note.trim()}`);
  }
  out.push('');
  out.push('நன்றி / Thank you.');
  return out.join('\n');
}

export const GREETING = 'வணக்கம்! / Hello! I would like to enquire about your services. 🙏';
