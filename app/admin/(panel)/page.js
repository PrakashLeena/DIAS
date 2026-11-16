import Link from 'next/link';
import { ClipboardList, Clock3, CheckCircle2, XCircle, PartyPopper, Boxes, Package, CalendarDays } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin-session';
import { getAdminContext, getDashboardStats } from '@/services/admin';
import { formatDate, formatMoney } from '@/utils/format';
import StatusBadge from '@/components/ui/StatusBadge';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  await requireAdminPage();
  const { lang, t, settings } = await getAdminContext();
  const s = await getDashboardStats();
  const money = (n) => formatMoney(n, settings.currency);
  const stats = [
    ['totalOrders', s.counts.total, ClipboardList, 'text-ink-900', '/admin/orders'],
    ['pending', s.counts.pending, Clock3, 'text-warning', '/admin/orders?status=pending'],
    ['accepted', s.counts.accepted, CheckCircle2, 'text-success', '/admin/orders?status=accepted'],
    ['cancelled', s.counts.cancelled, XCircle, 'text-danger', '/admin/orders?status=cancelled'],
    ['completed', s.counts.completed, PartyPopper, 'text-info', '/admin/orders?status=completed'],
    ['products', s.totalProducts, Boxes, 'text-maroon-600', '/admin/products'],
    ['packages', s.totalPackages, Package, 'text-gold-700', '/admin/packages'],
  ];

  return (
    <>
      <h1 className="mb-6 font-sans text-[24px] font-semibold text-ink-900">{t.dashboard.title}</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {stats.map(([key, value, Icon, color, href]) => (
          <Link key={key} href={href} className="rounded-lg border bg-white p-4 shadow-1 transition-shadow hover:shadow-2" style={{ borderColor: 'var(--border-subtle)' }}>
            <Icon className={`h-5 w-5 ${color}`} strokeWidth={1.7} aria-hidden />
            <p className="mt-3 text-[28px] font-semibold leading-none text-ink-900">{value}</p>
            <p className="mt-1 text-[13px] text-ink-500">{t.dashboard[key]}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="overflow-hidden rounded-lg border bg-white shadow-1" style={{ borderColor: 'var(--border-subtle)' }}>
          <header className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <h2 className="font-sans text-[16px] font-semibold">{t.dashboard.recent}</h2>
            <Link href="/admin/orders" className="text-[13px] text-maroon-600 hover:underline">
              {t.dashboard.viewAll}
            </Link>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead className="bg-ivory-50 text-[12px] uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-2.5">{t.orders.orderId}</th>
                  <th className="px-3 py-2.5">{t.orders.customer}</th>
                  <th className="px-3 py-2.5">{t.orders.eventDate}</th>
                  <th className="px-3 py-2.5 text-right">{t.orders.amount}</th>
                  <th className="px-5 py-2.5">{t.orders.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {s.recent.map((o) => (
                  <tr key={o._id} className="hover:bg-ivory-50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${o._id}`} className="whitespace-nowrap font-mono font-medium text-maroon-600 hover:underline">
                        {o.orderId}
                      </Link>
                    </td>
                    <td className="px-3 py-3">{o.customer.fullName}</td>
                    <td className="px-3 py-3">{formatDate(o.event.eventDate, lang)}</td>
                    <td className="px-3 py-3 text-right">{money(o.totalAmount)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={o.status} label={t.dashboard[o.status]} />
                    </td>
                  </tr>
                ))}
                {!s.recent.length && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-ink-500">
                      {t.common.noResults}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border bg-white shadow-1" style={{ borderColor: 'var(--border-subtle)' }}>
          <header className="border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <h2 className="font-sans text-[16px] font-semibold">{t.dashboard.upcoming}</h2>
          </header>
          <ul className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {s.upcoming.map((o) => (
              <li key={o._id}>
                <Link href={`/admin/orders/${o._id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ivory-50">
                  <CalendarDays className="h-5 w-5 text-gold-700" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{o.customer.fullName}</p>
                    <p className="text-[12.5px] text-ink-500">
                      {formatDate(o.event.eventDate, lang)} · {o.orderId}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
            {!s.upcoming.length && <li className="px-5 py-8 text-center text-[14px] text-ink-500">{t.common.noResults}</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
