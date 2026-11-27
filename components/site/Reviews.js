'use client';

// Customer reviews: Google reviews only. Visitors write reviews on Google (link below);
// the reviews Google returns are shown here. The website's own review form was removed.
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
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

// Server-rendered data arrives as `initial`; the browser only fetches when it is missing.
// Reviews come from our own server endpoint, so the API key never reaches the browser.
function useGoogleReviews(initial) {
  const [g, setG] = useState(initial || EMPTY_GOOGLE);
  useEffect(() => {
    if (initial) return;
    const ctrl = new AbortController();
    fetch('/api/google-reviews', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : EMPTY_GOOGLE))
      .then((d) => setG({ ...EMPTY_GOOGLE, ...d, reviews: Array.isArray(d?.reviews) ? d.reviews : [] }))
      .catch(() => {});
    return () => ctrl.abort();
  }, [initial]);
  return g;
}

function GoogleSummary({ g }) {
  const hasRating = typeof g.rating === 'number' && g.userRatingCount > 0;
  const n = g.userRatingCount;
  return (
    <div className="mx-auto mt-6 flex max-w-2xl flex-col items-center gap-4 rounded-2xl border bg-white px-5 py-5 text-center shadow-2 sm:flex-row sm:justify-between sm:px-7 sm:text-left" style={{ borderColor: 'var(--border-gold)' }}>
      <div className="flex flex-col items-center gap-1.5 sm:items-start">
        <span className="inline-flex items-center gap-2 text-[15px] font-medium text-ink-900">
          <GoogleG size={22} /> Google Reviews
        </span>
        {hasRating ? (
          <>
            <span className="inline-flex items-center gap-2">
              <strong className="font-display text-[34px] leading-none text-ink-900">{g.rating.toFixed(1)}</strong>
              <Stars value={Math.round(g.rating)} size={20} />
            </span>
            <span className="text-[13px] text-ink-500">
              {n} Google மதிப்புரை{n === 1 ? '' : 'கள்'} / Based on {n} Google {n === 1 ? 'review' : 'reviews'}
            </span>
          </>
        ) : (
          <span className="text-[13.5px] text-ink-500">எங்கள் சேவை பற்றி Google இல் கருத்துத் தெரிவியுங்கள் / Tell others about us on Google</span>
        )}
      </div>
      <div className="flex flex-col items-center gap-2 sm:items-end">
        <WriteGoogleReviewLink className="btn btn-primary">
          <span>Google இல் மதிப்புரை எழுதுக / Write a review</span>
        </WriteGoogleReviewLink>
        {g.googleMapsUri && (
          <a href={g.googleMapsUri} target="_blank" rel="noopener" className="text-[13px] font-semibold text-maroon-600 underline">
            அனைத்து மதிப்புரைகள் / See all reviews on Google ↗
          </a>
        )}
      </div>
    </div>
  );
}

function GoogleReviewCard({ r }) {
  const a = r.author || {};
  const [open, setOpen] = useState(false);
  const long = (r.text || '').length > 260;
  const name = <span className="block truncate text-[15px] font-semibold text-ink-900">{a.name}</span>;
  return (
    <figure className="m-0 flex h-full min-w-0 flex-col gap-3 rounded-2xl border bg-white p-5 shadow-1 sm:p-6" style={{ borderColor: 'var(--border-subtle)', overflowWrap: 'anywhere' }}>
      <figcaption className="flex items-center gap-3">
        {a.photoUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.photoUri} alt="" width={44} height={44} loading="lazy" referrerPolicy="no-referrer" className="h-11 w-11 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-champagne-100 text-base font-semibold text-maroon-600" aria-hidden="true">
            {Array.from(a.name || 'G')[0].toUpperCase()}
          </span>
        )}
        <span className="flex min-w-0 flex-1 flex-col">
          {a.uri ? (
            <a href={a.uri} target="_blank" rel="noopener" className="min-w-0 hover:underline">
              {name}
            </a>
          ) : (
            name
          )}
          {r.relativeTime && <span className="text-[12.5px] text-ink-500">{r.relativeTime}</span>}
        </span>
        <span className="shrink-0" title="Posted on Google">
          <GoogleG size={20} />
        </span>
      </figcaption>
      <Stars value={r.rating} size={17} />
      {r.text && (
        <blockquote className={`m-0 whitespace-pre-line text-[15px] leading-relaxed text-ink-800 ${open ? '' : 'line-clamp-6'}`}>{r.text}</blockquote>
      )}
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        {long ? (
          <button type="button" onClick={() => setOpen((o) => !o)} className="text-[13px] font-semibold text-maroon-600">
            {open ? 'குறைவாக / Show less' : 'மேலும் / Read more'}
          </button>
        ) : (
          <span />
        )}
        {r.uri && (
          <a href={r.uri} target="_blank" rel="noopener" className="text-[12.5px] font-medium text-ink-500 underline hover:text-maroon-600">
            View on Google ↗
          </a>
        )}
      </div>
    </figure>
  );
}

/** Mobile: swipeable row with snap + arrows. Tablet/desktop: grid. */
function ReviewsShowcase({ reviews }) {
  const rail = useRef(null);
  const scroll = (dir) => {
    const el = rail.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };
  return (
    <div className="relative mt-8">
      <ul
        ref={rail}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 scrollbar-none sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3"
        aria-label="Google reviews"
      >
        {reviews.map((r, i) => (
          <li key={r.id || i} className="w-[86%] shrink-0 snap-center sm:w-auto">
            <GoogleReviewCard r={r} />
          </li>
        ))}
      </ul>
      {reviews.length > 1 && (
        <div className="mt-3 flex justify-center gap-2 sm:hidden">
          <button type="button" onClick={() => scroll(-1)} className="grid h-10 w-10 place-items-center rounded-full border bg-white text-lg text-ink-700 shadow-1" style={{ borderColor: 'var(--border-subtle)' }} aria-label="Previous review">
            ‹
          </button>
          <button type="button" onClick={() => scroll(1)} className="grid h-10 w-10 place-items-center rounded-full border bg-white text-lg text-ink-700 shadow-1" style={{ borderColor: 'var(--border-subtle)' }} aria-label="Next review">
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export default function ReviewsSection({ google: initialGoogle, standalone = false }) {
  const google = useGoogleReviews(initialGoogle);
  const Heading = standalone ? 'h1' : 'h2';

  return (
    <section id="reviews" className="bg-ivory-100 py-14" aria-labelledby="reviews-title">
      <div className="mx-auto max-w-[1200px] px-4">
        {standalone && (
          <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-maroon-600">
            ◂ முகப்பு / Home
          </Link>
        )}
        <Heading id="reviews-title" className="text-center text-[clamp(24px,4vw,36px)]">
          வாடிக்கையாளர் மதிப்புரைகள் <span className="text-[0.55em] font-normal text-ink-500">/ Customer Reviews</span>
        </Heading>
        <p className="mt-1 text-center text-[13.5px] text-ink-500">Google இல் எங்கள் வாடிக்கையாளர்கள் சொல்வது / What our customers say on Google</p>

        <GoogleSummary g={google} />

        {google.reviews.length > 0 && <ReviewsShowcase reviews={google.reviews} />}

        {google.reviews.length > 0 && google.googleMapsUri && (
          <p className="mt-6 text-center">
            <a href={google.googleMapsUri} target="_blank" rel="noopener" className="btn btn-secondary btn-sm">
              <GoogleG size={16} /> அனைத்து Google மதிப்புரைகளும் / Read all reviews on Google
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
