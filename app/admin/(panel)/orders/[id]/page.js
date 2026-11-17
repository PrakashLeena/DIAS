import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageCircle, Phone, Mail, CheckCircle2, AlertTriangle } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin-session';
import { getAdminContext, getOrder } from '@/services/admin';
import { checkAvailability } from '@/lib/inventory';
import { formatDate, formatDateTime, formatMoney, whatsappLink } from '@/utils/format';
import { getDictionary } from '@/lib/i18n';
import StatusBadge from '@/components/ui/StatusBadge';
import OrderActions from '@/components/admin/OrderActions';
import { Card } from '@/components/admin/ui';

export const metadata = { title: 'Order' };

export default async function OrderDetailPage({ params }) {
  await requireAdminPage();
  const { id } = await params;
  const { lang, t, settings } = await getAdminContext();
  const order = await getOrder(id);
  if (!order) notFound();
  const money = (n) => formatMoney(n, settings.currency);
  const siteDict = getDictionary(lang);
  const custDict = getDictionary(order.language || 'ta');

  // What would happen if this order were accepted now?
  let stock = null;
  if (order.status === 'pending' || order.status === 'accepted') {
    const required = new Map(order.inventoryLines.map((l) => [String(l.product), l.quantity]));
    stock = await checkAvailability(required, new Date(order.event.rentalStartDate), new Date(order.event.rentalEndDate), { excludeOrderId: order._id });
  }

  const waText = `${custDict.confirmation.whatsappText} ${order.orderId} — ${custDict.status[order.status]}`;
  const wa = whatsappLink(order.customer.phone, `${order.customer.fullName}, ${waText}`, settings.phoneCountryCode);
  const rows = (pairs) =>
    pairs
      .filter(([, v]) => v)
      .map(([k, v]) => (
        <div key={k} className="grid grid-cols-[150px_1fr] gap-3 py-2 text-[14px]">
          <dt className="text-ink-500">{k}</dt>
          <dd className="whitespace-pre-line break-words font-medium text-ink-900">{v}</dd>
        </div>
      ));

  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-ink-500 hover:text-maroon-600">
        <ArrowLeft className="h-4 w-4" /> {t.orders.title}
      </Link>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h1 className="font-mono text-[24px] font-semibold text-ink-900">{order.orderId}</h1>
        <StatusBadge status={order.status} label={t.dashboard[order.status]} size="lg" />
        <span className="text-[13px] text-ink-500">{formatDateTime(order.createdAt, lang)}</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <Card title={t.order.items}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-[14px]">
                <thead className="text-left text-[12px] uppercase text-ink-500">
                  <tr>
                    <th className="pb-2">{t.products.name}</th>
                    <th className="pb-2 text-right">{t.order.qty}</th>
                    <th className="pb-2 text-right">{t.order.unit}</th>
                    <th className="pb-2 text-right">{t.order.line}</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                  {order.orderItems.map((i, k) => (
                    <tr key={k} className="align-top">
                      <td className="py-2.5">
                        <span className="font-medium">{i.name?.[lang] || i.name?.en}</span>
                        {i.itemType === 'package' && <span className="badge ml-2 bg-gold-500/15 !px-2 !py-0 text-[10.5px] text-gold-700">{t.nav.packages}</span>}
                        {i.components?.length > 0 && (
                          <ul className="mt-1 text-[12.5px] text-ink-500">
                            {i.components.map((c, j) => (
                              <li key={j}>
                                {c.quantity} × {c.name?.[lang] || c.name?.en}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="py-2.5 text-right">{i.quantity}</td>
                      <td className="py-2.5 text-right">
                        {money(i.unitPrice)}
                        <span className="block text-[11.5px] text-ink-500">{t.products.units[i.pricingUnit]}</span>
                      </td>
                      <td className="py-2.5 text-right font-medium">{money(i.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="pt-3 text-right text-ink-500">
                      {t.common.total} ({t.order.rentalDays}: {order.rentalDays})
                    </td>
                    <td className="pt-3 text-right text-[18px] font-semibold text-maroon-600">{money(order.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title={t.order.customer}>
              <dl className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {rows([
                  [t.order.fullName, order.customer.fullName],
                  [t.orders.phone, order.customer.phone],
                  [t.order.email, order.customer.email],
                  [t.order.address, order.customer.address],
                  [t.order.city, order.customer.city],
                  [t.order.locationRef, order.customer.locationReference],
                ])}
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-sm border-transparent bg-[#25D366] text-white hover:bg-[#1ebe5a]">
                    <MessageCircle className="h-4 w-4" /> {t.order.whatsapp}
                  </a>
                )}
                <a href={`tel:${order.customer.phone}`} className="btn btn-secondary btn-sm">
                  <Phone className="h-4 w-4" /> {t.order.call}
                </a>
                {order.customer.email && (
                  <a href={`mailto:${order.customer.email}?subject=${encodeURIComponent(order.orderId)}`} className="btn btn-secondary btn-sm">
                    <Mail className="h-4 w-4" /> Email
                  </a>
                )}
              </div>
            </Card>
            <Card title={t.order.event}>
              <dl className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {rows([
                  [t.order.eventType, siteDict.checkout.eventTypes[order.event.eventType] || order.event.eventType],
                  [t.orders.eventDate, formatDate(order.event.eventDate, lang)],
                  [t.order.rentalPeriod, `${formatDate(order.event.rentalStartDate, lang)} – ${formatDate(order.event.rentalEndDate, lang)} (${order.rentalDays})`],
                  [t.order.venue, order.event.venue],
                  [t.order.instructions, order.event.instructions],
                  [t.orders.type, t.orders.types[order.orderType]],
                ])}
              </dl>
            </Card>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Card title={t.order.manage}>
            <OrderActions order={order} />
          </Card>
          {stock && (
            <Card title={t.order.availability}>
              {stock.ok ? (
                <p className="flex items-center gap-2 text-[14px] text-success">
                  <CheckCircle2 className="h-4 w-4" /> {t.order.ok}
                </p>
              ) : (
                <div className="text-[14px] text-danger">
                  <p className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="h-4 w-4" /> {t.order.stockConflict}
                  </p>
                  <ul className="mt-1 list-disc pl-6">
                    {stock.issues.map((i) => (
                      <li key={i.productId}>
                        {i.name?.[lang] || i.name?.en}: {t.order.requested} {i.requested}, {t.order.availableNow} {i.available}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}
          <Card title={t.order.history}>
            <ol className="space-y-2 text-[13.5px]">
              {order.statusHistory.map((h, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <StatusBadge status={h.status} label={t.dashboard[h.status]} />
                  <span className="text-ink-500">{formatDateTime(h.at, lang)}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}
