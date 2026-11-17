<<<<<<< HEAD
export default function robots() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
=======
import { siteUrl } from '@/lib/seo';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/checkout', '/en/checkout', '/order-confirmation', '/en/order-confirmation'],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
>>>>>>> 6ef55310b926b8304db243483f45c8bf859d5e1b
  };
}
