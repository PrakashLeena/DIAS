import Link from 'next/link';
import { Plus, Pencil, ExternalLink } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin-session';
import { getAdminContext, listProductsAdmin, listCategoriesAdmin } from '@/services/admin';
import { formatMoney } from '@/utils/format';
import { RowToggles, DeleteButton } from '@/components/admin/RowToggles';

export const metadata = { title: 'Products' };
const pick = (v) => (Array.isArray(v) ? v[0] : v) || '';

export default async function ProductsAdminPage({ searchParams }) {
  await requireAdminPage();
  const sp = await searchParams;
  const { lang, t, settings } = await getAdminContext();
  const params = { q: pick(sp.q), category: pick(sp.category), status: pick(sp.status) };
  const [items, categories] = await Promise.all([listProductsAdmin(params), listCategoriesAdmin()]);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-sans text-[24px] font-semibold text-ink-900">{t.products.title}</h1>
        <Link href="/admin/products/new" className="btn btn-primary">
          <Plus className="h-4 w-4" /> {t.products.new}
        </Link>
      </div>
      <form className="mb-5 grid gap-3 rounded-lg border bg-white p-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end" style={{ borderColor: 'var(--border-subtle)' }}>
        <label>
          <span className="field-label">{t.common.search}</span>
          <input name="q" defaultValue={params.q} className="field" />
        </label>
        <label>
          <span className="field-label">{t.products.category}</span>
          <select name="category" defaultValue={params.category} className="field">
            <option value="">{t.common.all}</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name[lang] || c.name.en}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">{t.orders.status}</span>
          <select name="status" defaultValue={params.status} className="field">
            <option value="">{t.common.all}</option>
            <option value="published">{t.common.published}</option>
            <option value="unpublished">{t.common.unpublished}</option>
            <option value="featured">{t.common.featured}</option>
            <option value="unavailable">{t.common.unavailable}</option>
          </select>
        </label>
        <button className="btn btn-primary">{t.common.filter}</button>
      </form>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-1" style={{ borderColor: 'var(--border-subtle)' }}>
        <table className="w-full min-w-[860px] text-left text-[14px]">
          <thead className="bg-ivory-50 text-[12px] uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">{t.products.name}</th>
              <th className="px-3 py-3">{t.products.category}</th>
              <th className="px-3 py-3 text-right">{t.products.price}</th>
              <th className="px-3 py-3 text-right">{t.products.totalQty}</th>
              <th className="px-3 py-3">{t.products.flags}</th>
              <th className="px-4 py-3">{t.common.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {items.map((p) => (
              <tr key={p._id} className="align-top hover:bg-ivory-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-12 w-14 shrink-0 overflow-hidden rounded bg-champagne-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" loading="lazy" />}
                    </span>
                    <div>
                      <Link href={`/admin/products/${p._id}`} className="font-medium text-ink-900 hover:text-maroon-600">
                        {p.name.ta}
                      </Link>
                      <p className="text-[12.5px] text-ink-500">{p.name.en}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">{p.category?.name?.[lang] || '—'}</td>
                <td className="px-3 py-3 text-right">
                  {formatMoney(p.rentalPrice, settings.currency)}
                  <span className="block text-[11.5px] text-ink-500">{t.products.units[p.pricingUnit]}</span>
                </td>
                <td className="px-3 py-3 text-right">
                  {p.totalQuantity}
                  {p.blockedQuantity > 0 && <span className="block text-[11.5px] text-danger">−{p.blockedQuantity}</span>}
                </td>
                <td className="px-3 py-3">
                  <RowToggles endpoint={`/api/admin/products/${p._id}`} item={p} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/products/${p._id}`} className="btn btn-secondary btn-sm !h-8">
                      <Pencil className="h-3.5 w-3.5" /> {t.common.edit}
                    </Link>
                    <a href={`/products/${p.slug}`} target="_blank" className="btn btn-ghost btn-sm !h-8" aria-label={t.nav.viewSite}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <DeleteButton endpoint={`/api/admin/products/${p._id}`} label="" />
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-500">
                  {t.common.noResults}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
