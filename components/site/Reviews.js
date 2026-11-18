'use client';

// Customer Ratings & Reviews: "Write a Review" form above the existing marquee of reviews.
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Stars } from './ui';

function ReviewCard({ r }) {
  return (
    <figure className="m-0 flex min-w-0 flex-col gap-4 rounded-xl border bg-white p-7 shadow-1" style={{ borderColor: 'var(--border-subtle)', overflowWrap: 'anywhere' }}>
      <Stars value={r.rating} size={16} />
      <blockquote className="m-0 font-display text-[20px] italic leading-snug text-ink-900">“{r.message}”</blockquote>
      <figcaption className="mt-auto flex flex-col">
        <span className="text-[15px] font-medium text-ink-900">{r.name}</span>
        {r.event && <span className="text-[13px] text-ink-500">{r.event}</span>}
      </figcaption>
    </figure>
  );
}

// Infinite right-to-left scroll: the list is repeated until it is wider than the
// screen, then drawn twice so the first card follows straight after the last.
function Marquee({ items }) {
  const base = [];
  while (base.length < Math.max(6, items.length)) base.push(...items);
  const cards = (copy) =>
    base.map((x, i) => (
      <div key={`${copy}-${i}`} className="sd-marquee-item" aria-hidden={copy === 'b' || i >= items.length ? 'true' : undefined}>
        <ReviewCard r={x} />
      </div>
    ));
  return (
    <div className="sd-marquee" style={{ '--marquee-dur': `${base.length * 10}s` }}>
      <div className="sd-marquee-track">
        {cards('a')}
        {cards('b')}
      </div>
    </div>
  );
}

const LABELS = ['', 'மோசம் / Poor', 'சுமார் / Fair', 'நன்று / Good', 'மிக நன்று / Very good', 'அருமை / Excellent'];

export default function ReviewsSection({ initial, standalone = false }) {
  const [reviews, setReviews] = useState(initial);
  const [form, setForm] = useState({ name: '', rating: 0, message: '', website: '' });
  const [hover, setHover] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ busy: false, msg: '', ok: false });

  const avg = useMemo(() => (reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0), [reviews]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'பெயரை உள்ளிடவும் / Please enter your name';
    if (!form.rating) errs.rating = 'நட்சத்திரங்களைத் தேர்வு செய்க / Please choose a star rating';
    if (form.message.trim().length < 3) errs.message = 'கருத்தை எழுதவும் / Please write your review';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStatus({ busy: true, msg: '', ok: false });
    try {
      const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.review) {
        setReviews((r) => [data.review, ...r]);
        setForm({ name: '', rating: 0, message: '', website: '' });
        setStatus({ busy: false, ok: true, msg: 'நன்றி! உங்கள் கருத்து பதிவு செய்யப்பட்டது. / Thank you! Your review has been posted.' });
      } else if (res.ok) {
        setStatus({ busy: false, ok: true, msg: 'நன்றி! / Thank you!' });
      } else {
        setStatus({ busy: false, ok: false, msg: res.status === 429 ? 'பல முறை முயற்சி செய்துவிட்டீர்கள்; பிறகு முயலவும். / Too many attempts, please try again later.' : 'சேமிக்க முடியவில்லை. மீண்டும் முயலவும். / Could not save your review. Please try again.' });
      }
    } catch {
      setStatus({ busy: false, ok: false, msg: 'இணைப்புப் பிழை. / Network error, please try again.' });
    }
  };

  const shown = hover || form.rating;

  return (
    <section id="reviews" className="bg-ivory-100 py-14" aria-labelledby="reviews-title">
      <div className="mx-auto max-w-[1200px] px-4">
        {standalone && (
          <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-maroon-600">
            ◂ முகப்பு / Home
          </Link>
        )}
        {(() => {
          const Heading = standalone ? 'h1' : 'h2';
          return (
            <Heading id="reviews-title" className="text-center text-[clamp(24px,4vw,36px)]">
              வாடிக்கையாளர் மதிப்புரைகள் <span className="text-[0.55em] font-normal text-ink-500">/ Customer Ratings &amp; Reviews</span>
            </Heading>
          );
        })()}
        {!standalone && (
          <p className="mt-1 text-center text-[13.5px]">
            <Link href="/rating" className="font-semibold text-maroon-600 underline">
              தனிப் பக்கத்தில் மதிப்பீடு செய்ய / Open the rating page ▸
            </Link>
          </p>
        )}
        {reviews.length > 0 && (
          <p className="mt-2 flex items-center justify-center gap-2 text-ink-700">
            <Stars value={Math.round(avg)} size={20} />
            <strong className="text-ink-900">{avg.toFixed(1)}</strong>
            <span className="text-sm">({reviews.length})</span>
          </p>
        )}

        <form onSubmit={submit} noValidate className="mx-auto mt-8 max-w-2xl rounded-xl border bg-white p-5 shadow-2 sm:p-7" style={{ borderColor: 'var(--border-gold)' }} aria-labelledby="write-review">
          <h3 id="write-review" className="mb-4 text-xl">
            ✍️ உங்கள் கருத்தைப் பதிவிடுக <span className="text-[13px] font-normal text-ink-500">/ Write a Review</span>
          </h3>

          <label htmlFor="rv-name" className="field-label">பெயர் / Your Name</label>
          <input id="rv-name" className="field" value={form.name} onChange={set('name')} maxLength={60} autoComplete="name" aria-invalid={errors.name ? 'true' : 'false'} />
          {errors.name && <p className="mt-1 text-[13px] text-[#B3122E]">{errors.name}</p>}

          <span className="field-label mt-4" id="rv-stars">மதிப்பீடு / Rating</span>
          <div className="flex flex-wrap items-center gap-3">
            <div role="radiogroup" aria-labelledby="rv-stars" className="flex" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={form.rating === n}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  onMouseEnter={() => setHover(n)}
                  onClick={() => setForm((f) => ({ ...f, rating: n }))}
                  className="px-0.5 text-[34px] leading-none transition-transform hover:scale-110"
                  style={{ color: n <= shown ? '#D4A845' : '#D9CDBA' }}
                >
                  ★
                </button>
              ))}
            </div>
            {shown > 0 && <span className="text-sm font-medium text-ink-700">{LABELS[shown]}</span>}
          </div>
          {errors.rating && <p className="mt-1 text-[13px] text-[#B3122E]">{errors.rating}</p>}

          <label htmlFor="rv-msg" className="field-label mt-4">உங்கள் கருத்து / Your Review Message</label>
          <textarea id="rv-msg" rows={4} className="field" value={form.message} onChange={set('message')} maxLength={600} aria-invalid={errors.message ? 'true' : 'false'} />
          {errors.message && <p className="mt-1 text-[13px] text-[#B3122E]">{errors.message}</p>}

          {/* honeypot: hidden from people, bots fill it in */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
            <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} /></label>
          </div>

          <button type="submit" disabled={status.busy} className="btn btn-primary mt-5 w-full sm:w-auto">
            {status.busy ? '…' : 'கருத்தைச் சமர்ப்பி / Submit Review'}
          </button>
          {status.msg && (
            <p role="status" className={`mt-3 rounded-lg px-3 py-2 text-sm ${status.ok ? 'bg-[#E6F4EA] text-[#1a7d43]' : 'bg-[#FBE7EA] text-[#B3122E]'}`}>
              {status.msg}
            </p>
          )}
        </form>
      </div>

      {reviews.length > 0 && (
        <div className="mt-10">
          <Marquee items={reviews} />
        </div>
      )}
    </section>
  );
}
