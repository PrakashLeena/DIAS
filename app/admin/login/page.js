import { redirect } from 'next/navigation';
<<<<<<< HEAD
import { getAdminSession } from '@/lib/admin-session';
=======
import { cookies } from 'next/headers';
import { getAdminSession } from '@/lib/admin-session';
import { getAdminDict, ADMIN_LANG_COOKIE } from '@/lib/i18n/admin';
import { getSettings } from '@/services/catalog';
>>>>>>> 6ef55310b926b8304db243483f45c8bf859d5e1b
import LoginForm from '@/components/admin/LoginForm';

export const metadata = { title: 'Login' };

export default async function LoginPage() {
  if (await getAdminSession()) redirect('/admin');
<<<<<<< HEAD
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 p-4">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center font-display text-3xl font-semibold text-[#FFE9B0]">வட்ஷன் பந்தல் சேவை</p>
        <LoginForm />
=======
  const lang = (await cookies()).get(ADMIN_LANG_COOKIE)?.value === 'en' ? 'en' : 'ta';
  const settings = await getSettings();
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 p-4">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center font-display text-3xl font-semibold text-flame-200">{settings.companyName?.[lang]}</p>
        <LoginForm t={getAdminDict(lang)} />
>>>>>>> 6ef55310b926b8304db243483f45c8bf859d5e1b
      </div>
    </div>
  );
}
