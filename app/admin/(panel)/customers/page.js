import Link from 'next/link';
import { MessageCircle, Phone } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin-session';
import { getAdminContext, listCustomers } from '@/services/admin';
import { formatDate, whatsappLink } from '@/utils/format';
import AdminPagination from '@/components/admin/AdminPagination';

export const metadata = { title: 'Customers' };
const pick = (v) => (Array.isArray(v) ? v[0] : v) || '';

export default async function CustomersPage({ searchParams }) {
  await requireAdminPage();
  const sp = await searchParams;
  const { lang, t, settings } = await getAdminContext();
  const q = pick(sp.q);
  const data = await listCustomers({ q, page: pick(sp.page) });

  return (
    <>
      <h1 className="mb-5 font-sans text-[24px] font-semibold text-ink-900">{t.customers.title}</h1>
      <form className="mb-5 flex gap-3">
        <input name="q" defaultValue={q} placeholder={t.orders.searchPlaceholder} className="field max-w-md" />
        <button className="btn btn-primary">{t.common.search}</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {data.items.map((c) => {
          const wa = whatsappLink(c.phone, '', settings.phoneCountryCode);
          return (
            <article key={c._id} className="rounded-lg border bg-white p-5 shadow-1" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-sans text-[17px] font-semibold text-ink-900">{c.fullName}</h2>
                  <p className="text-[14px] text-ink-700">{c.phone}</p>
                  {c.email && <p className="text-[13px] text-ink-500">{c.email}</p>}
                </div>
                <span className="badge bg-champagne-100 text-ink-700">
                  {c.orders} {t.customers.orders}
                </span>
              </div>
              <dl className="mt-3 space-y-1.5 text-[13.5px]">
                <div>
                  <dt className="inline text-ink-500">{t.order.address}: </dt>
                  <dd className="inline">{c.address}</dd>
                </div>
                <div>
                  <dt className="inline text-ink-500">{t.order.city}: </dt>
                  <dd className="inline">{c.city}</dd>
                </div>
                <div>
                  <dt className="inline text-ink-500">{t.order.locationRef}: </dt>
                  <dd className="inline">{c.locationReference}</dd>
                </div>
                <div>
                  <dt className="inline text-ink-500">{t.customers.lastEvent}: </dt>
                  <dd className="inline">{formatDate(c.lastEventDate, lang)}</dd>
                </div>
                {c.instructions && (
                  <div>
                    <dt className="inline text-ink-500">{t.order.instructions}: </dt>
                    <dd className="inline">{c.instructions}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-sm border-transparent bg-[#25D366] text-white hover:bg-[#1ebe5a]">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                )}
                <a href={`tel:${c.phone}`} className="btn btn-secondary btn-sm">
                  <Phone className="h-4 w-4" /> {t.order.call}
                </a>
                <Link href={`/admin/orders/${c.lastOrderId}`} className="btn btn-ghost btn-sm">
                  {c.lastOrderCode}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      {!data.items.length && <p className="rounded-lg border border-dashed bg-white p-10 text-center text-ink-500">{t.common.noResults}</p>}
      <AdminPagination page={data.page} pages={data.pages} base="/admin/customers" params={{ q }} t={t} />
    </>
  );
}
