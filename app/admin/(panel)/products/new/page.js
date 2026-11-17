import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin-session';
import { getAdminContext, listCategoriesAdmin } from '@/services/admin';
import ProductForm from '@/components/admin/ProductForm';

export const metadata = { title: 'New product' };

export default async function NewProductPage() {
  await requireAdminPage();
  const { t } = await getAdminContext();
  const categories = await listCategoriesAdmin();
  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-ink-500 hover:text-maroon-600">
        <ArrowLeft className="h-4 w-4" /> {t.products.title}
      </Link>
      <h1 className="mb-6 font-sans text-[24px] font-semibold text-ink-900">{t.products.new}</h1>
      <ProductForm categories={categories} />
    </>
  );
}
