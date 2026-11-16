// Shared formatting helpers (safe for server and client).

export function formatMoney(amount, currency = { code: 'LKR', symbol: 'Rs.' }) {
  const n = Math.round(Number(amount) || 0);
  const locale = currency?.code === 'INR' ? 'en-IN' : 'en-US';
  return `${currency?.symbol || 'Rs.'} ${n.toLocaleString(locale)}`;
}

const MONTHS = {
  ta: ['ஜன', 'பிப்', 'மார்', 'ஏப்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக', 'செப்', 'அக்', 'நவ', 'டிச'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

/**
 * Formats a date as "12 Nov 2026". Event dates are stored as UTC midnight and are
 * shown as-is; real timestamps (createdAt, status changes) are shown in local business time (Sri Lanka time, UTC+5:30).
 */
export function formatDate(value, lang = 'ta') {
  if (!value) return '';
  let d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const isDateOnly = d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 0;
  if (!isDateOnly) d = new Date(d.getTime() + 5.5 * 3600 * 1000);
  return `${d.getUTCDate()} ${(MONTHS[lang] || MONTHS.en)[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatDateTime(value, lang = 'ta') {
  if (!value) return '';
  const d = new Date(value);
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Colombo' });
  const local = new Date(d.getTime() + 5.5 * 3600 * 1000);
  return `${local.getUTCDate()} ${(MONTHS[lang] || MONTHS.en)[local.getUTCMonth()]} ${local.getUTCFullYear()}, ${time}`;
}

/** 'YYYY-MM-DD' -> Date at UTC midnight */
export function parseDateOnly(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const d = new Date(`${str}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toDateInput(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

/** Inclusive number of rental days between two dates. */
export function rentalDaysBetween(start, end) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(e) || e < s) return 1;
  return Math.round((e - s) / 86400000) + 1;
}

/** Normalises a phone number to digits with country code, for wa.me links. */
export function toWhatsAppNumber(phone, countryCode = '94') {
  let digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = countryCode + digits.slice(1);
  else if (digits.length <= 10) digits = countryCode + digits;
  return digits;
}

export function whatsappLink(phone, text = '', countryCode = '94') {
  const n = toWhatsAppNumber(phone, countryCode);
  if (!n) return '';
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export function telLink(phone) {
  const p = String(phone || '').replace(/[^\d+]/g, '');
  return p ? `tel:${p}` : '';
}
