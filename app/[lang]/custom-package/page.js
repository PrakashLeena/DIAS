import { getDictionary } from '@/lib/i18n';
import { getSettings, getBuilderCatalog } from '@/services/catalog';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader';
import CustomBuilder from '@/components/builder/CustomBuilder';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return buildMetadata({ lang, path: '/custom-package', title: dict.builder.title, description: dict.builder.intro, settings: await getSettings() });
}

export default async function CustomPackagePage({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const catalog = await getBuilderCatalog();
  return (
    <>
      <PageHeader eyebrow={dict.builder.eyebrow} title={dict.builder.title} intro={dict.builder.intro} />
      <section className="container py-10 sm:py-14">
        <CustomBuilder catalog={catalog} />
      </section>
    </>
  );
}
