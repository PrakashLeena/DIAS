import { json } from '@/lib/api';

// The website's own review form was removed: customers now review the business on Google.
// The endpoint is kept only to answer old/cached pages and bots with "Gone".
export const POST = () => json({ error: 'gone', message: 'Please write your review on Google.' }, { status: 410 });
