import { requireAdminPage } from '@/lib/admin-session';
import { getAdminContext } from '@/services/admin';
import { getInventoryReport } from '@/lib/inventory';
import { connectDB } from '@/lib/db';
import { serialize } from '@/utils/serialize';
import { parseDateOnly, toDateInput } from '@/utils/format';
import InventoryRow from '@/components/admin/InventoryRow';

export const metadata = { title: 'Inventory' };
const pick = (v) => (Array.isArray(v) ? v[0] : v) || '';

export default async function InventoryPage({ searchParams }) {
  await requireAdminPage();
  const sp = await searchParams;
  const { t } = await getAdminContext();
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const from = parseDateOnly(pick(sp.from)) || today;
  let to = parseDateOnly(pick(sp.to)) || from;
  if (to < from) to = from;
  await connectDB();
  const rows = serialize(await getInventoryReport(from, to));

  return (
    <>
      <h1 className="mb-2 font-sans text-[24px] font-semibold text-ink-900">{t.inventory.title}</h1>
      <p className="mb-5 max-w-3xl text-[14px] text-ink-500">{t.inventory.intro}</p>
      <form className="mb-5 flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <label>
          <span className="field-label">{t.common.from}</span>
          <input type="date" name="from" defaultValue={toDateInput(from)} className="field" />
        </label>
        <label>
          <span className="field-label">{t.common.to}</span>
          <input type="date" name="to" defaultValue={toDateInput(to)} className="field" />
        </label>
        <button className="btn btn-primary">{t.common.apply}</button>
      </form>
      <div className="overflow-x-auto rounded-lg border bg-white shadow-1" style={{ borderColor: 'var(--border-subtle)' }}>
        <table className="w-full min-w-[820px] text-left text-[14px]">
          <thead className="bg-ivory-50 text-[12px] uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">{t.inventory.product}</th>
              <th className="px-3 py-3">{t.inventory.total}</th>
              <th className="px-3 py-3">{t.inventory.blocked}</th>
              <th className="px-3 py-3 text-right">{t.inventory.reserved}</th>
              <th className="px-3 py-3 text-right">{t.inventory.availableQty}</th>
              <th className="px-3 py-3">{t.common.available}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {rows.map((r) => (
              <InventoryRow key={`${r._id}-${r.totalQuantity}-${r.blockedQuantity}-${r.reserved}-${r.isAvailable}`} item={r} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
