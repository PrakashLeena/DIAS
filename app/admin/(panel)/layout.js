import { cookies } from 'next/headers';
import { requireAdminPage } from '@/lib/admin-session';
import { ADMIN_LANG_COOKIE } from '@/lib/i18n/admin';
import { getSettings } from '@/services/catalog';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Enquiry from '@/models/Enquiry';
import AdminShell from '@/components/admin/AdminShell';

export default async function PanelLayout({ children }) {
  const admin = await requireAdminPage();
  const lang = (await cookies()).get(ADMIN_LANG_COOKIE)?.value === 'en' ? 'en' : 'ta';
  const settings = await getSettings();
  await connectDB();
  const [pendingCount, newEnquiries] = await Promise.all([Order.countDocuments({ status: 'pending' }), Enquiry.countDocuments({ status: 'new' })]);
  return (
    <AdminShell lang={lang} admin={admin} currency={settings.currency} companyName={settings.companyName?.[lang] || settings.companyName?.en} pendingCount={pendingCount} newEnquiries={newEnquiries}>
      {children}
    </AdminShell>
  );
}
