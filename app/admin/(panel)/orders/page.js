import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin-session';
import { getAdminContext, listOrders } from '@/services/admin';
import { formatDate, formatMoney, whatsappLink } from '@/utils/format';
import StatusBadge from '@/components/ui/StatusBadge';
import AdminPagination from '@/components/admin/AdminPagination';

export const metadata = { title: 'Orders' };
const pick = (v) => (Array.isArray(v) ? v[0] : v) || '';

export default async function OrdersPage({ searchParams }) {
  await requireAdminPage();
  const sp = await searchParams;
  const { lang, t, settings } = await getAdminContext();
  const params = { status: pick(sp.status), q: pick(sp.q), from: pick(sp.from), to: pick(sp.to) };
  const data = await listOrders({ ...params, page: pick(sp.page) });
  const money = (n) => formatMoney(n, settings.currency);
  const statuses = ['', 'pending', 'accepted', 'completed', 'cancelled'];

  return (
    <>
      <h1 className="mb-5 font-sans text-[24px] font-semibold text-ink-900">{t.orders.title}</h1>
      <nav className="mb-4 flex flex-wrap gap-2">
        {statuses.map((s) => {
          const q = new URLSearchParams(Object.entries({ ...params, status: s }).filter(([, v]) => v));
          return (
            <Link key={s || 'all'} href={`/admin/orders${q.toString() ? `?${q}` : ''}`} className={`badge !px-3.5 !py-1.5 !text-[13px] ring-1 ${params.status === s ? 'bg-maroon-600 text-white ring-maroon-600' : 'bg-white text-ink-700 ring-[color:var(--border-strong)]'}`}>
              {s ? t.dashboard[s] : t.common.all}
            </Link>
          );
        })}
      </nav>
      <form className="mb-5 grid gap-3 rounded-lg border bg-white p-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end" style={{ borderColor: 'var(--border-subtle)' }}>
        {params.status && <input type="hidden" name="status" value={params.status} />}
        <label>
          <span className="field-label">{t.common.search}</span>
          <input name="q" defaultValue={params.q} placeholder={t.orders.searchPlaceholder} className="field" />
        </label>
        <label>
          <span className="field-label">{t.orders.eventDate} — {t.common.from}</span>
          <input type="date" name="from" defaultValue={params.from} className="field" />
        </label>
        <label>
          <span className="field-label">{t.common.to}</span>
          <input type="date" name="to" defaultValue={params.to} className="field" />
        </label>
        <button className="btn btn-primary">{t.common.filter}</button>
      </form>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-1" style={{ borderColor: 'var(--border-subtle)' }}>
        <table className="w-full min-w-[900px] text-left text-[14px]">
          <thead className="bg-ivory-50 text-[12px] uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">{t.orders.orderId}</th>
              <th className="px-3 py-3">{t.orders.customer}</th>
              <th className="px-3 py-3">{t.orders.phone}</th>
              <th className="px-3 py-3">{t.orders.eventDate}</th>
              <th className="px-3 py-3">{t.orders.type}</th>
              <th className="px-3 py-3 text-right">{t.orders.amount}</th>
              <th className="px-3 py-3">{t.orders.booked}</th>
              <th className="px-3 py-3">{t.orders.status}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {data.items.map((o) => {
              const wa = whatsappLink(o.customer.phone, `${o.orderId}`, settings.phoneCountryCode);
              return (
                <tr key={o._id} className="hover:bg-ivory-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o._id}`} className="font-mono font-medium text-maroon-600 hover:underline">
                      {o.orderId}
                    </Link>
                  </td>
                  <td className="px-3 py-3 font-medium text-ink-900">{o.customer.fullName}</td>
                  <td className="px-3 py-3">
                    <a href={`tel:${o.customer.phone}`} className="hover:underline">
                      {o.customer.phone}
                    </a>
                  </td>
                  <td className="px-3 py-3">{formatDate(o.event.eventDate, lang)}</td>
                  <td className="px-3 py-3">{t.orders.types[o.orderType]}</td>
                  <td className="px-3 py-3 text-right font-medium">{money(o.totalAmount)}</td>
                  <td className="px-3 py-3 text-ink-500">{formatDate(o.createdAt, lang)}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={o.status} label={t.dashboard[o.status]} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {wa && (
                        <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-full p-1.5 text-[#1a9e4b] hover:bg-[#25D366]/10" aria-label={t.order.whatsapp}>
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      )}
                      <Link href={`/admin/orders/${o._id}`} className="btn btn-secondary btn-sm !h-8">
                        {t.common.view}
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!data.items.length && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-ink-500">
                  {t.common.noResults}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination page={data.page} pages={data.pages} base="/admin/orders" params={params} t={t} />
    </>
  );
}
