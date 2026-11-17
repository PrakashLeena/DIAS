import { getSettings } from '@/services/catalog';
import { buildMetadata } from '@/lib/seo';
import { terms } from '@/lib/content/legal';
import LegalPage from '@/components/ui/LegalPage';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildMetadata({ lang, path: '/terms', title: terms[lang].title, description: terms[lang].sections[0][1], settings: await getSettings() });
}

export default async function TermsPage({ params }) {
  const { lang } = await params;
  return <LegalPage content={terms[lang]} settings={await getSettings()} lang={lang} />;
}
