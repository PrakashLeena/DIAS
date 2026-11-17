import '@/styles/globals.css';
import { fontVariables } from '@/lib/fonts';
import { getContent } from '@/lib/content';
import { SiteProvider } from '@/components/site/SiteProvider';
import Header from '@/components/site/Header';
import ActionBar from '@/components/site/ActionBar';

// Content is edited live from the Admin Panel, so pages are rendered per request.
export const dynamic = 'force-dynamic';

export const viewport = { themeColor: '#4A0E22', width: 'device-width', initialScale: 1 };

export async function generateMetadata() {
  const { site } = await getContent();
  return {
    title: `${site.name.ta} | ${site.name.en}`,
    description: `${site.name.en} — canopy, stage décor, lighting, chairs, cooking vessels and more. வட்ஷன் பந்தல் சேவை.`,
    icons: { icon: '/icon.svg' },
    formatDetection: { telephone: false },
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
      </body>
    </html>
  );
}
