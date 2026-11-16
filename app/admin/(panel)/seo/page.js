import { requireAdminPage } from '@/lib/admin-session';
import { getAdminContext } from '@/services/admin';
import SeoForm from '@/components/admin/SeoForm';

export const metadata = { title: 'SEO settings' };

export default async function SeoPage() {
  await requireAdminPage();
  const { t, settings } = await getAdminContext();
  return (
    <>
      <h1 className="mb-6 font-sans text-[24px] font-semibold text-ink-900">{t.seo.title}</h1>
      <SeoForm initial={settings.seo} />
    </>
  );
}
