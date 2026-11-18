import '@/styles/globals.css';
import { fontVariables } from '@/lib/fonts';
import { getContent } from '@/lib/content';
import { BRAND, DEFAULT_DESCRIPTION, DEFAULT_TITLE, KEYWORDS, localBusinessJsonLd, siteUrl } from '@/lib/seo';
import { SiteProvider } from '@/components/site/SiteProvider';
import Header from '@/components/site/Header';
import ActionBar from '@/components/site/ActionBar';
import JsonLd from '@/components/site/JsonLd';

// Content is edited live from the Admin Panel, so pages are rendered per request.
export const dynamic = 'force-dynamic';

export const viewport = { themeColor: '#4A0E22', width: 'device-width', initialScale: 1 };

export async function generateMetadata() {
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: DEFAULT_TITLE, template: `%s | ${BRAND.en}` },
    description: DEFAULT_DESCRIPTION,
    keywords: KEYWORDS,
    applicationName: BRAND.en,
    authors: [{ name: BRAND.en }],
    creator: BRAND.en,
    publisher: BRAND.en,
    alternates: { canonical: '/' },
    icons: { icon: '/favicon.png', apple: '/favicon.png' },
    formatDetection: { telephone: false },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
    openGraph: {
      type: 'website',
      siteName: `${BRAND.ta} | ${BRAND.en}`,
      locale: 'ta_LK',
      alternateLocale: ['en_LK'],
      url: '/',
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: `${BRAND.ta} — ${BRAND.en}, Vankalai, Mannar` }],
    },
    twitter: { card: 'summary_large_image', title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, images: ['/og-image.jpg'] },
    other: { 'geo.region': 'LK-4', 'geo.placename': 'Vankalai, Mannar', 'content-language': 'ta, en' },
  };
}

export default async function SiteLayout({ children }) {
  const content = await getContent();
  return (
    <html lang="ta" className={fontVariables}>
      <body suppressHydrationWarning>
        <SiteProvider content={content}>
          <Header />
          <main id="main">{children}</main>
          <ActionBar />
        </SiteProvider>
        <JsonLd data={localBusinessJsonLd(content)} />
      </body>
    </html>
  );
}
