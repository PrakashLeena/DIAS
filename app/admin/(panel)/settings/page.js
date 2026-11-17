import { requireAdminPage } from '@/lib/admin-session';
import { getAdminContext } from '@/services/admin';
import SettingsForm from '@/components/admin/SettingsForm';

export const metadata = { title: 'Website settings' };

export default async function SettingsPage() {
  await requireAdminPage();
  const { t, settings } = await getAdminContext();
  return (
    <>
      <h1 className="mb-6 font-sans text-[24px] font-semibold text-ink-900">{t.settings.title}</h1>
      <SettingsForm initial={settings} />
    </>
  );
}
