import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin-session';
import { getAdminContext, listProductOptions } from '@/services/admin';
import PackageForm from '@/components/admin/PackageForm';

export const metadata = { title: 'New package' };

export default async function NewPackagePage() {
  await requireAdminPage();
  const { t } = await getAdminContext();
  const products = await listProductOptions();
  return (
    <>
      <Link href="/admin/packages" className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-ink-500 hover:text-maroon-600">
        <ArrowLeft className="h-4 w-4" /> {t.packages.title}
      </Link>
      <h1 className="mb-6 font-sans text-[24px] font-semibold text-ink-900">{t.packages.new}</h1>
      <PackageForm products={products} />
    </>
  );
}
