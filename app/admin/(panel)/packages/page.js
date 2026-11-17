import Link from 'next/link';
import { Plus, Pencil, ExternalLink } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin-session';
import { getAdminContext, listPackagesAdmin } from '@/services/admin';
import { formatMoney } from '@/utils/format';
import { RowToggles, DeleteButton } from '@/components/admin/RowToggles';

export const metadata = { title: 'Packages' };

export default async function PackagesAdminPage() {
  await requireAdminPage();
  const { lang, t, settings } = await getAdminContext();
  const packages = await listPackagesAdmin();

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-sans text-[24px] font-semibold text-ink-900">{t.packages.title}</h1>
        <Link href="/admin/packages/new" className="btn btn-primary">
          <Plus className="h-4 w-4" /> {t.packages.new}
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {packages.map((p) => (
          <article key={p._id} className="flex gap-4 rounded-lg border bg-white p-4 shadow-1" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="h-28 w-32 shrink-0 overflow-hidden rounded-md bg-champagne-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.coverImage && <img src={p.coverImage} alt="" className="h-full w-full object-cover" loading="lazy" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link href={`/admin/packages/${p._id}`} className="font-semibold text-ink-900 hover:text-maroon-600">
                    {p.name.ta}
                  </Link>
                  <p className="text-[12.5px] text-ink-500">
                    {p.name.en} · {t.packages.categories[p.category]}
                  </p>
                </div>
                <p className="text-[17px] font-semibold text-maroon-600">{formatMoney(p.packagePrice, settings.currency)}</p>
              </div>
              <p className="mt-1 line-clamp-2 text-[12.5px] text-ink-500">{p.items.filter((i) => i.product).map((i) => `${i.quantity}× ${i.product.name[lang] || i.product.name.en}`).join(', ')}</p>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                <RowToggles endpoint={`/api/admin/packages/${p._id}`} item={p} />
                <div className="flex gap-2">
                  <Link href={`/admin/packages/${p._id}`} className="btn btn-secondary btn-sm !h-8">
                    <Pencil className="h-3.5 w-3.5" /> {t.common.edit}
                  </Link>
                  <a href={`/packages/${p.slug}`} target="_blank" className="btn btn-ghost btn-sm !h-8" aria-label={t.nav.viewSite}>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <DeleteButton endpoint={`/api/admin/packages/${p._id}`} label="" />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!packages.length && <p className="rounded-lg border border-dashed bg-white p-10 text-center text-ink-500">{t.common.noResults}</p>}
    </>
  );
}
