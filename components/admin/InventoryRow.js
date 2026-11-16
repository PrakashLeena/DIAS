'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { apiFetch, Toggle } from './ui';

export default function InventoryRow({ item }) {
  const { t, lang } = useAdmin();
  const router = useRouter();
  const [total, setTotal] = useState(item.totalQuantity);
  const [blocked, setBlocked] = useState(item.blockedQuantity || 0);
  const [avail, setAvail] = useState(item.isAvailable);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const dirty = Number(total) !== item.totalQuantity || Number(blocked) !== (item.blockedQuantity || 0) || avail !== item.isAvailable;
  const available = Math.max(0, Number(total) - Number(blocked) - item.reserved);

  const save = async () => {
    setBusy(true);
    setMsg('');
    try {
      await apiFetch(`/api/admin/inventory/${item._id}`, { method: 'PATCH', body: { totalQuantity: Number(total), blockedQuantity: Number(blocked), isAvailable: avail } });
      setMsg('✓');
      router.refresh();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <tr className={`hover:bg-ivory-50 ${available === 0 ? 'bg-danger/5' : ''}`}>
      <td className="px-4 py-2.5">
        <p className="font-medium text-ink-900">{item.name[lang] || item.name.en}</p>
        <p className="text-[12px] text-ink-500">{item.category?.name?.[lang]}</p>
      </td>
      <td className="px-3 py-2.5">
        <input type="number" min="0" value={total} onChange={(e) => setTotal(e.target.value)} className="field !min-h-[36px] w-24 !py-1" aria-label={t.inventory.total} />
      </td>
      <td className="px-3 py-2.5">
        <input type="number" min="0" value={blocked} onChange={(e) => setBlocked(e.target.value)} className="field !min-h-[36px] w-20 !py-1" aria-label={t.inventory.blocked} />
      </td>
      <td className="px-3 py-2.5 text-right font-medium text-warning">{item.reserved}</td>
      <td className={`px-3 py-2.5 text-right text-[16px] font-semibold ${available === 0 ? 'text-danger' : 'text-success'}`}>{available}</td>
      <td className="px-3 py-2.5">
        <Toggle id={`av-${item._id}`} checked={avail} onChange={setAvail} />
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button type="button" onClick={save} disabled={!dirty || busy} className="btn btn-primary btn-sm !h-8 disabled:opacity-30">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          </button>
          {msg && <span className={`text-[12px] ${msg === '✓' ? 'text-success' : 'text-danger'}`}>{msg}</span>}
        </div>
      </td>
    </tr>
  );
}
