// Run with: npm test   (Node's built in test runner, Google is always stubbed)
import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { GET } from '../app/api/google-reviews/route.js';
import { resetGoogleReviewsCache } from '../lib/google-reviews.js';

const realFetch = globalThis.fetch;
const realEnv = { key: process.env.GOOGLE_PLACES_API_KEY, id: process.env.GOOGLE_PLACE_ID };
const PLACE_ID = 'ChIJ_test_place_id_123';

const GOOGLE_BODY = {
  rating: 4.6,
  userRatingCount: 17,
  googleMapsUri: 'https://maps.google.com/?cid=123',
  reviews: [
    {
      name: 'places/x/reviews/1',
      rating: 5,
      relativePublishTimeDescription: 'a month ago',
      text: { text: 'Great work <script>alert(1)</script>', languageCode: 'en' },
      authorAttribution: {
        displayName: 'Asha',
        uri: 'https://www.google.com/maps/contrib/1/reviews',
        photoUri: 'https://lh3.googleusercontent.com/a/photo',
      },
      googleMapsUri: 'https://www.google.com/maps/reviews/data=!4m6',
    },
    {
      name: 'places/x/reviews/2',
      rating: 1,
      relativePublishTimeDescription: '2 months ago',
      text: { text: 'Not happy' },
      authorAttribution: { displayName: 'Ravi', uri: 'javascript:alert(1)', photoUri: 'https://evil.example/p.png' },
    },
  ],
};

let calls;
const stub = (impl) => {
  calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return impl(url, init);
  };
};

beforeEach(() => {
  resetGoogleReviewsCache();
  process.env.GOOGLE_PLACES_API_KEY = 'test-key';
  process.env.GOOGLE_PLACE_ID = PLACE_ID;
});
afterEach(() => {
  globalThis.fetch = realFetch;
  if (realEnv.key === undefined) delete process.env.GOOGLE_PLACES_API_KEY; else process.env.GOOGLE_PLACES_API_KEY = realEnv.key;
  if (realEnv.id === undefined) delete process.env.GOOGLE_PLACE_ID; else process.env.GOOGLE_PLACE_ID = realEnv.id;
});

test('success: returns normalised reviews, keeps low ratings, calls Google once with a narrow field mask', async () => {
  stub(() => new Response(JSON.stringify(GOOGLE_BODY), { status: 200 }));
  const res = await GET();
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.match(res.headers.get('cache-control'), /s-maxage=10800/);
  assert.equal(body.rating, 4.6);
  assert.equal(body.userRatingCount, 17);
  assert.equal(body.googleMapsUri, 'https://maps.google.com/?cid=123');
  assert.equal(body.reviews.length, 2); // the 1 star review is not filtered out
  assert.equal(body.reviews[1].rating, 1);
  assert.equal(body.reviews[0].text, 'Great work <script>alert(1)</script>'); // raw text, escaped by React at render time
  assert.equal(body.reviews[0].author.photoUri, 'https://lh3.googleusercontent.com/a/photo');
  // unsafe links from Google data are dropped
  assert.equal(body.reviews[1].author.uri, null);
  assert.equal(body.reviews[1].author.photoUri, null);

  assert.equal(calls.length, 1);
  assert.ok(calls[0].url.startsWith(`https://places.googleapis.com/v1/places/${PLACE_ID}`));
  assert.equal(calls[0].init.headers['X-Goog-FieldMask'], 'rating,userRatingCount,reviews,googleMapsUri');
  assert.equal(calls[0].init.headers['X-Goog-Api-Key'], 'test-key');
  assert.ok(!calls[0].url.includes('test-key'), 'key must not be in the URL');
  assert.ok(!JSON.stringify(body).includes('test-key'), 'key must not be in the response');
});

test('success: second request is served from the in-memory cache', async () => {
  stub(() => new Response(JSON.stringify(GOOGLE_BODY), { status: 200 }));
  await GET();
  const res = await GET();
  assert.equal((await res.json()).reviews.length, 2);
  assert.equal(calls.length, 1);
});

test('missing key: empty result, 200, Google never called', async () => {
  delete process.env.GOOGLE_PLACES_API_KEY;
  stub(() => assert.fail('must not call Google'));
  const res = await GET();
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { rating: null, userRatingCount: 0, googleMapsUri: null, reviews: [] });
  assert.equal(calls.length, 0);
});

test('missing place id: empty result', async () => {
  delete process.env.GOOGLE_PLACE_ID;
  stub(() => assert.fail('must not call Google'));
  const res = await GET();
  assert.deepEqual((await res.json()).reviews, []);
});

test('malformed place id is rejected before any request', async () => {
  process.env.GOOGLE_PLACE_ID = '../../other/endpoint?x=1';
  stub(() => assert.fail('must not call Google'));
  const res = await GET();
  assert.deepEqual((await res.json()).reviews, []);
  assert.equal(calls.length, 0);
});

test('Google error status: empty result, 200, short cache', async () => {
  stub(() => new Response(JSON.stringify({ error: { message: 'API key not valid' } }), { status: 403 }));
  const res = await GET();
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { rating: null, userRatingCount: 0, googleMapsUri: null, reviews: [] });
  assert.doesNotMatch(res.headers.get('cache-control'), /s-maxage=10800/);
});

test('Google network failure: empty result, 200', async () => {
  stub(() => {
    throw new TypeError('fetch failed');
  });
  const res = await GET();
  assert.equal(res.status, 200);
  assert.deepEqual((await res.json()).reviews, []);
});

test('Google returns junk JSON shape: empty reviews, no crash', async () => {
  stub(() => new Response(JSON.stringify({ reviews: 'nope', rating: 'x' }), { status: 200 }));
  const res = await GET();
  const body = await res.json();
  assert.deepEqual(body.reviews, []);
  assert.equal(body.rating, null);
});
