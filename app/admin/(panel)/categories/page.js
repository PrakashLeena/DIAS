import { requireAdminPage } from '@/lib/admin-session';
import { listCategoriesAdmin } from '@/services/admin';
import CategoryManager from '@/components/admin/CategoryManager';

export const metadata = { title: 'Categories' };

export default async function CategoriesAdminPage() {
  await requireAdminPage();
  const categories = await listCategoriesAdmin();
  return <CategoryManager categories={categories} />;
}
