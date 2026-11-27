// Server only. Fetches Google reviews with Places API (New) "Place Details".
// GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID are read from the environment on the
// server and are never sent to the browser. Any problem returns an empty result so
// the site always renders.
//
// Caching: the response is held in memory for a few hours (and the route also sends
// s-maxage for the CDN). Nothing is written to a database or to disk, and review
// content is passed through unaltered, with the author name, photo and links Google
// supplies, so the Google Maps Platform attribution rules can be followed in the UI.

const PLACES_ENDPOINT = 'https://places.googleapis.com/v1/places/';
const FIELD_MASK = 'rating,userRatingCount,reviews,googleMapsUri';
const TIMEOUT_MS = 5000;

export const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // fresh for 3 hours
export const STALE_MAX_MS = 6 * 60 * 60 * 1000; // never serve anything older than 6 hours

export const EMPTY = Object.freeze({ rating: null, userRatingCount: 0, googleMapsUri: null, reviews: [] });

let cache = null; // { at, data }
let inflight = null;

export function resetGoogleReviewsCache() {
  cache = null;
  inflight = null;
}

const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Returns the URL only when it is https on one of the allowed Google hosts. */
function safeUrl(v, hostPattern) {
  if (typeof v !== 'string' || v.length > 2000) return null;
  try {
    const u = new URL(v);
    return u.protocol === 'https:' && hostPattern.test(u.hostname) ? u.toString() : null;
  } catch {
    return null;
  }
}

const GOOGLE_PAGE_HOST = /(^|\.)(google\.com|goo\.gl|g\.page|maps\.app\.goo\.gl)$/i;
const GOOGLE_IMAGE_HOST = /(^|\.)(googleusercontent\.com|ggpht\.com|gstatic\.com)$/i;

/** Maps Google's response onto the small shape the UI needs. Review text is kept as is (no filtering by rating). */
export function normalize(raw) {
  if (!raw || typeof raw !== 'object') return { ...EMPTY, reviews: [] };
  const reviews = (Array.isArray(raw.reviews) ? raw.reviews : [])
    .map((r) => {
      if (!r || typeof r !== 'object') return null;
      const rating = num(r.rating);
      if (rating === null) return null;
      const a = r.authorAttribution || {};
      const text = str(r.text?.text ?? r.originalText?.text, 5000);
      return {
        id: str(r.name, 300) || null,
        rating: Math.max(0, Math.min(5, Math.round(rating))),
        text,
        relativeTime: str(r.relativePublishTimeDescription, 80),
        publishTime: str(r.publishTime, 40) || null,
        author: {
          name: str(a.displayName, 120) || 'Google user',
          uri: safeUrl(a.uri, GOOGLE_PAGE_HOST),
          photoUri: safeUrl(a.photoUri, GOOGLE_IMAGE_HOST),
        },
        uri: safeUrl(r.googleMapsUri, GOOGLE_PAGE_HOST),
      };
    })
    .filter(Boolean);
  return {
    rating: num(raw.rating),
    userRatingCount: Math.max(0, Math.floor(num(raw.userRatingCount) ?? 0)),
    googleMapsUri: safeUrl(raw.googleMapsUri, GOOGLE_PAGE_HOST),
    reviews,
  };
}

async function callGoogle(key, placeId) {
  const res = await fetch(`${PLACES_ENDPOINT}${encodeURIComponent(placeId)}`, {
    method: 'GET',
    headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': FIELD_MASK, Accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Places API responded ${res.status}`);
  return normalize(await res.json());
}

/**
 * Returns { data, ok, fresh }:
 *   ok=false  -> not configured or Google failed (data is the empty result)
 *   fresh     -> true only when the data came from a live call just now or from the in-memory cache
 */
export async function loadGoogleReviews(now = Date.now()) {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();
  if (!key || !placeId || !/^[A-Za-z0-9_-]{10,300}$/.test(placeId)) {
    return { data: { ...EMPTY, reviews: [] }, ok: false, reason: 'not-configured' };
  }
  if (cache && now - cache.at < CACHE_TTL_MS) return { data: cache.data, ok: true, reason: 'cache' };

  inflight ??= callGoogle(key, placeId).finally(() => {
    inflight = null;
  });
  try {
    const data = await inflight;
    cache = { at: now, data };
    return { data, ok: true, reason: 'live' };
  } catch (err) {
    // Do not log the request (it carries the key in a header, never in the URL, but stay safe).
    console.error('[google-reviews] fetch failed:', err?.message || 'unknown error');
    if (cache && now - cache.at < STALE_MAX_MS) return { data: cache.data, ok: true, reason: 'stale' };
    return { data: { ...EMPTY, reviews: [] }, ok: false, reason: 'google-error' };
  }
}
