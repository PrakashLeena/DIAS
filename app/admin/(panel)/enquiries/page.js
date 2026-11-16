import Link from 'next/link';
import { MessageCircle, Phone } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin-session';
import { getAdminContext } from '@/services/admin';
import { connectDB } from '@/lib/db';
import { serialize } from '@/utils/serialize';
import { formatDate, formatDateTime, whatsappLink } from '@/utils/format';
import { homeUi } from '@/lib/i18n/home-ui';
import { resolveStageDesign, applyStageText } from '@/lib/stage-design';
import Enquiry from '@/models/Enquiry';
import EnquiryStatus from '@/components/admin/EnquiryStatus';
import { DeleteButton } from '@/components/admin/RowToggles';

export const metadata = { title: 'Enquiries' };
const pick = (v) => (Array.isArray(v) ? v[0] : v) || '';

export default async function EnquiriesPage({ searchParams }) {
  await requireAdminPage();
  const sp = await searchParams;
  const { lang, t, settings } = await getAdminContext();
  const status = ['new', 'contacted', 'closed'].includes(pick(sp.status)) ? pick(sp.status) : '';
  await connectDB();
  const items = serialize(await Enquiry.find(status ? { status } : {}).sort({ createdAt: -1 }).limit(200).lean());
  const ui = applyStageText(homeUi[lang], resolveStageDesign(settings.stageDesign), lang);

  return (
    <>
      <h1 className="mb-2 font-sans text-[24px] font-semibold text-ink-900">{t.enquiries.title}</h1>
      <p className="mb-5 text-[14px] text-ink-500">{t.enquiries.intro}</p>
      <nav className="mb-4 flex flex-wrap gap-2">
        {['', 'new', 'contacted', 'closed'].map((s) => (
          <Link key={s || 'all'} href={s ? `/admin/enquiries?status=${s}` : '/admin/enquiries'} className={`badge !px-3.5 !py-1.5 !text-[13px] ring-1 ${status === s ? 'bg-maroon-600 text-white ring-maroon-600' : 'bg-white text-ink-700 ring-[color:var(--border-strong)]'}`}>
            {s ? t.enquiries.statuses[s] : t.common.all}
          </Link>
        ))}
      </nav>
      <div className="overflow-x-auto rounded-lg border bg-white shadow-1" style={{ borderColor: 'var(--border-subtle)' }}>
        <table className="w-full min-w-[900px] text-left text-[14px]">
          <thead className="bg-ivory-50 text-[12px] uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">{t.orders.customer}</th>
              <th className="px-3 py-3">{t.orders.eventDate}</th>
              <th className="px-3 py-3">{t.order.eventType}</th>
              <th className="px-3 py-3">{t.order.venue}</th>
              <th className="px-3 py-3">{t.order.instructions}</th>
              <th className="px-3 py-3">{t.orders.booked}</th>
              <th className="px-3 py-3">{t.orders.status}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {items.map((e) => {
              const wa = whatsappLink(e.phone, '', settings.phoneCountryCode);
              return (
                <tr key={e._id} className={`align-top hover:bg-ivory-50 ${e.status === 'new' ? 'bg-gold-500/5' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{e.name}</p>
                    <p className="text-ink-500">{e.phone}</p>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">{formatDate(e.eventDate, lang)}</td>
                  <td className="px-3 py-3">
                    {ui.functions[e.eventType] || e.eventType}
                    {e.guests ? <span className="block text-[12.5px] text-ink-500">{e.guests} {ui.estimator.guestsUnit}</span> : null}
                  </td>
                  <td className="px-3 py-3">{e.venue || '—'}</td>
                  <td className="max-w-[260px] px-3 py-3 text-[13px]">
                    {e.notes || '—'}
                    {e.flora && <span className="mt-1 block text-[12px] text-ink-500">{ui.estimator.florals}: {ui.flora[e.flora] || e.flora}</span>}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-ink-500">{formatDateTime(e.createdAt, lang)}</td>
                  <td className="px-3 py-3">
                    <EnquiryStatus id={e._id} status={e.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {wa && (
                        <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-full p-1.5 text-[#1a9e4b] hover:bg-[#25D366]/10" aria-label="WhatsApp">
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      )}
                      <a href={`tel:${e.phone}`} className="rounded-full p-1.5 hover:bg-champagne-100" aria-label={t.order.call}>
                        <Phone className="h-4 w-4" />
                      </a>
                      <DeleteButton endpoint={`/api/admin/enquiries/${e._id}`} label="" />
                    </div>
                  </td>
                </tr>
              );
            })}
            {!items.length && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-ink-500">
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
