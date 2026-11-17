import '@/styles/globals.css';
import { fontVariables } from '@/lib/fonts';

export const metadata = {
  title: { default: 'Admin | Watson Decoration', template: '%s | Admin' },
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';

export default function AdminRootLayout({ children }) {
  return (
    <html lang="ta" className={fontVariables}>
      <body className="admin bg-[#F6F1E7]" suppressHydrationWarning>{children}</body>
    </html>
  );
}
