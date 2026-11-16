import { getSettings } from '@/services/catalog';
import { buildMetadata } from '@/lib/seo';
import { privacy } from '@/lib/content/legal';
import LegalPage from '@/components/ui/LegalPage';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({ lang, path: '/privacy-policy', title: privacy[lang].title, description: privacy[lang].sections[0][1], settings: await getSettings() });
}

export default async function PrivacyPage({ params }) {
  const { lang } = await params;
  return <LegalPage content={privacy[lang]} settings={await getSettings()} lang={lang} />;
}
