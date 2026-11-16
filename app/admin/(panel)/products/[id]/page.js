import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin-session';
import { getAdminContext, getProductAdmin, listCategoriesAdmin } from '@/services/admin';
import ProductForm from '@/components/admin/ProductForm';

export const metadata = { title: 'Edit product' };

export default async function EditProductPage({ params }) {
  await requireAdminPage();
  const { id } = await params;
  const { t, lang } = await getAdminContext();
  const [product, categories] = await Promise.all([getProductAdmin(id), listCategoriesAdmin()]);
  if (!product) notFound();
  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-ink-500 hover:text-maroon-600">
        <ArrowLeft className="h-4 w-4" /> {t.products.title}
      </Link>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-sans text-[24px] font-semibold text-ink-900">
          {t.products.edit}: {product.name[lang] || product.name.en}
        </h1>
        <a href={`/products/${product.slug}`} target="_blank" className="btn btn-ghost btn-sm">
          <ExternalLink className="h-4 w-4" /> {t.nav.viewSite}
        </a>
      </div>
      <ProductForm product={product} categories={categories} />
    </>
  );
}
