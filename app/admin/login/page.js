import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getAdminSession } from '@/lib/admin-session';
import { getAdminDict, ADMIN_LANG_COOKIE } from '@/lib/i18n/admin';
import { getSettings } from '@/services/catalog';
import LoginForm from '@/components/admin/LoginForm';

export const metadata = { title: 'Login' };

export default async function LoginPage() {
  if (await getAdminSession()) redirect('/admin');
  const lang = (await cookies()).get(ADMIN_LANG_COOKIE)?.value === 'en' ? 'en' : 'ta';
  const settings = await getSettings();
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 p-4">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center font-display text-3xl font-semibold text-flame-200">{settings.companyName?.[lang]}</p>
        <LoginForm t={getAdminDict(lang)} />
      </div>
    </div>
  );
}
