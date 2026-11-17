import '@/styles/globals.css';
<<<<<<< HEAD
import { fontVariables } from '@/lib/fonts';
=======
import { cookies } from 'next/headers';
import { fontVariables } from '@/lib/fonts';
import { ADMIN_LANG_COOKIE } from '@/lib/i18n/admin';
>>>>>>> 6ef55310b926b8304db243483f45c8bf859d5e1b

export const metadata = {
  title: { default: 'Admin | Watson Decoration', template: '%s | Admin' },
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';

<<<<<<< HEAD
export default function AdminRootLayout({ children }) {
  return (
    <html lang="ta" className={fontVariables}>
      <body className="admin bg-[#F6F1E7]" suppressHydrationWarning>{children}</body>
=======
export default async function AdminRootLayout({ children }) {
  const lang = (await cookies()).get(ADMIN_LANG_COOKIE)?.value === 'en' ? 'en' : 'ta';
  return (
    <html lang={lang} className={fontVariables}>
      <body className="bg-[#F6F1E7]">{children}</body>
>>>>>>> 6ef55310b926b8304db243483f45c8bf859d5e1b
    </html>
  );
}
