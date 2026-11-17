import { notFound } from 'next/navigation';
import '@/styles/globals.css';
import { fontVariables } from '@/lib/fonts';
import { getDictionary, isLocale, LOCALES } from '@/lib/i18n';
import { getSettings, getCategories } from '@/services/catalog';
import { buildMetadata, localBusinessJsonLd, siteUrl } from '@/lib/seo';
import { LangProvider } from '@/contexts/LangContext';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingContact from '@/components/layout/FloatingContact';
import JsonLd from '@/components/seo/JsonLd';

export const revalidate = 300;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const viewport = {
  themeColor: '#1E1114',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const settings = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    ...buildMetadata({ lang, path: '/', settings }),
    verification: settings.seo?.googleVerification ? { google: settings.seo.googleVerification } : undefined,
    icons: { icon: settings.logo || '/icon.svg' },
    formatDetection: { telephone: false },
  };
}

/** Only the fields client components need — keeps the RSC payload small. */
function publicSettings(s, categories = []) {
  // Navbar "Stages" link → the stage-decoration category (icon "stage").
  const stages = categories.find((c) => c.icon === 'stage') || categories.find((c) => /stage/i.test(c.slug));
  return {
    stagesPath: stages ? `/categories/${stages.slug}` : '/categories',
    companyName: s.companyName,
    logo: s.logo,
    phone: s.phone,
    whatsapp: s.whatsapp,
    currency: s.currency,
    phoneCountryCode: s.phoneCountryCode,
  };
}

export default async function LangLayout({ children, params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);

  return (
    <html lang={lang} className={fontVariables}>
      <body>
        <LangProvider lang={lang} dict={dict} settings={publicSettings(settings, categories)}>
          <CartProvider>
            <Header />
            <main id="main">{children}</main>
            <Footer lang={lang} dict={dict} settings={settings} />
            <FloatingContact settings={settings} dict={dict} />
          </CartProvider>
        </LangProvider>
        <JsonLd data={localBusinessJsonLd(settings, lang)} />
      </body>
    </html>
  );
}
