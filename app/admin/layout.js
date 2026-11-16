import '@/styles/globals.css';
import { cookies } from 'next/headers';
import { fontVariables } from '@/lib/fonts';
import { ADMIN_LANG_COOKIE } from '@/lib/i18n/admin';

export const metadata = {
  title: { default: 'Admin | Watson Decoration', template: '%s | Admin' },
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';

export default async function AdminRootLayout({ children }) {
  const lang = (await cookies()).get(ADMIN_LANG_COOKIE)?.value === 'en' ? 'en' : 'ta';
  return (
    <html lang={lang} className={fontVariables}>
      <body className="bg-[#F6F1E7]">{children}</body>
    </html>
  );
}
