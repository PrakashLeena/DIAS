import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin-session';
import { getAdminContext, getPackageAdmin, listProductOptions } from '@/services/admin';
import PackageForm from '@/components/admin/PackageForm';

export const metadata = { title: 'Edit package' };

export default async function EditPackagePage({ params }) {
  await requireAdminPage();
  const { id } = await params;
  const { t, lang } = await getAdminContext();
  const [pkg, products] = await Promise.all([getPackageAdmin(id), listProductOptions()]);
  if (!pkg) notFound();
  return (
    <>
      <Link href="/admin/packages" className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-ink-500 hover:text-maroon-600">
        <ArrowLeft className="h-4 w-4" /> {t.packages.title}
      </Link>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-sans text-[24px] font-semibold text-ink-900">
          {t.packages.edit}: {pkg.name[lang] || pkg.name.en}
        </h1>
        <a href={`/packages/${pkg.slug}`} target="_blank" className="btn btn-ghost btn-sm">
          <ExternalLink className="h-4 w-4" /> {t.nav.viewSite}
        </a>
      </div>
      <PackageForm pkg={pkg} products={products} />
    </>
  );
}
