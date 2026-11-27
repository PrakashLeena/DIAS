import { NextResponse } from 'next/server.js';
import { loadGoogleReviews } from '../../../lib/google-reviews.js';

// Public, read only. The API key and Place ID stay on the server.
export const dynamic = 'force-dynamic';

const OK_CACHE = 'public, max-age=300, s-maxage=10800, stale-while-revalidate=3600'; // CDN keeps it ~3h
const SHORT_CACHE = 'public, max-age=60, s-maxage=120'; // empty/failed: retry soon

export async function GET() {
  try {
    const { data, ok } = await loadGoogleReviews();
    return NextResponse.json(data, { headers: { 'Cache-Control': ok ? OK_CACHE : SHORT_CACHE } });
  } catch (err) {
    console.error('[google-reviews] unexpected:', err?.message || 'unknown error');
    return NextResponse.json({ rating: null, userRatingCount: 0, googleMapsUri: null, reviews: [] }, { headers: { 'Cache-Control': SHORT_CACHE } });
  }
}
