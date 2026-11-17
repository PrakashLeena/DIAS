import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-session';
import LoginForm from '@/components/admin/LoginForm';

export const metadata = { title: 'Login' };

export default async function LoginPage() {
  if (await getAdminSession()) redirect('/admin');
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 p-4">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center font-display text-3xl font-semibold text-[#FFE9B0]">வட்ஷன் பந்தல் சேவை</p>
        <LoginForm />
      </div>
    </div>
  );
}
