'use client';

// Customer Ratings & Reviews: "Write a Review" form above the existing marquee of reviews.
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Stars } from './ui';
import { GOOGLE_REVIEW_URL } from '@/lib/google-reviews-shared';

export function GoogleG({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

/** Opens Google's own review page in a new tab (Google blocks embedding it in an iframe). */
export function WriteGoogleReviewLink({ className = 'btn btn-secondary btn-sm', children }) {
  return (
    <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener" className={className}>
      <GoogleG size={16} />
      {children ?? <span>Google மதிப்புரை எழுதுக / Write a Google review</span>}
    </a>
  );
}

const EMPTY_GOOGLE = { rating: null, userRatingCount: 0, googleMapsUri: null, reviews: [] };

// Reviews come from our own server endpoint, so the API key never reaches the browser.
function useGoogleReviews() {
  const [g, setG] = useState(EMPTY_GOOGLE);
  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/google-reviews', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : EMPTY_GOOGLE))
      .then((d) => setG({ ...EMPTY_GOOGLE, ...d, reviews: Array.isArray(d?.reviews) ? d.reviews : [] }))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);
  return g;
}

function GoogleSummary({ g }) {
  const hasRating = typeof g.rating === 'number' && g.userRatingCount > 0;
  const n = g.userRatingCount;
  return (
    <div className="mx-auto mt-6 flex max-w-2xl flex-col items-center gap-3 rounded-xl border bg-white px-5 py-4 text-center shadow-1 sm:flex-row sm:justify-between sm:text-left" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex flex-col items-center gap-1 sm:items-start">
        <span className="inline-flex items-center gap-2 text-[15px] font-medium text-ink-900">
          <GoogleG size={20} /> Google
        </span>
        {hasRating && (
          <>
            <span className="inline-flex items-center gap-2">
              <strong className="text-lg text-ink-900">{g.rating.toFixed(1)}</strong>
              <Stars value={Math.round(g.rating)} size={18} />
            </span>
            <span className="text-[13px] text-ink-500">
              {n} Google மதிப்புரை{n === 1 ? '' : 'களின்'} அடிப்படையில் / Based on {n} Google {n === 1 ? 'review' : 'reviews'}
            </span>
          </>
        )}
      </div>
      <div className="flex flex-col items-center gap-2 sm:items-end">
        <WriteGoogleReviewLink className="btn btn-primary btn-sm">
          <span>மதிப்புரை எழுதுக / Write a review</span>
        </WriteGoogleReviewLink>
        {g.googleMapsUri && (
          <a href={g.googleMapsUri} target="_blank" rel="noopener" className="text-[13px] font-semibold text-maroon-600 underline">
            Google இல் அனைத்து மதிப்புரைகள் / See all reviews on Google
          </a>
        )}
      </div>
    </div>
  );
}

function GoogleReviewCard({ r }) {
  const a = r.author || {};
  const name = <span className="text-[15px] font-medium text-ink-900">{a.name}</span>;
  return (
    <figure className="m-0 flex min-w-0 flex-col gap-3 rounded-xl border bg-white p-6 shadow-1" style={{ borderColor: 'var(--border-subtle)', overflowWrap: 'anywhere' }}>
      <figcaption className="flex items-center gap-3">
        {a.photoUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.photoUri} alt="" width={40} height={40} loading="lazy" referrerPolicy="no-referrer" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-champagne-100 text-base font-semibold text-maroon-600" aria-hidden="true">
            {Array.from(a.name || 'G')[0].toUpperCase()}
          </span>
        )}
        <span className="flex min-w-0 flex-col">
          {a.uri ? (
            <a href={a.uri} target="_blank" rel="noopener" className="hover:underline">
              {name}
            </a>
          ) : (
            name
          )}
          {r.relativeTime && <span className="text-[12.5px] text-ink-500">{r.relativeTime}</span>}
        </span>
        <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium text-ink-700" style={{ borderColor: 'var(--border-subtle)' }} title="Google review">
          <GoogleG size={12} /> Google
        </span>
      </figcaption>
      <Stars value={r.rating} size={16} />
      {r.text && <blockquote className="m-0 line-clamp-5 text-[15px] leading-relaxed text-ink-900">{r.text}</blockquote>}
      {r.uri && (
        <a href={r.uri} target="_blank" rel="noopener" className="mt-auto text-[12.5px] font-semibold text-maroon-600 underline">
          Google இல் பார்க்க / View on Google
        </a>
      )}
    </figure>
  );
}

function ReviewCard({ r }) {
  if (r.source === 'google') return <GoogleReviewCard r={r} />;
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
      <div key={`${copy}-${i}`} className="sd-marquee-item" aria-hidden={copy === 'b' || i >= items.length ? 'true' : undefined} inert={copy === 'b' || i >= items.length ? true : undefined}>
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
  const google = useGoogleReviews();
  const marqueeItems = useMemo(() => [...google.reviews.map((r) => ({ ...r, source: 'google' })), ...reviews], [google, reviews]);
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

        <GoogleSummary g={google} />

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

      {marqueeItems.length > 0 && (
        <div className="mt-10">
          <Marquee items={marqueeItems} />
        </div>
      )}
    </section>
  );
}
