import { requireAdminPage } from '@/lib/admin-session';
import { getContent, getReviews } from '@/lib/content';
import AdminApp from '@/components/admin/AdminApp';

export const metadata = { title: 'Dashboard' };

export default async function AdminPage() {
  const admin = await requireAdminPage();
  const [content, reviews] = await Promise.all([getContent(), getReviews()]);
  return <AdminApp initialContent={content} initialReviews={reviews} adminName={admin.name} />;
}
