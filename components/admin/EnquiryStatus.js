'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import { apiFetch } from './ui';

export default function EnquiryStatus({ id, status }) {
  const { t } = useAdmin();
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);
  const change = async (v) => {
    setBusy(true);
    setValue(v);
    try {
      await apiFetch(`/api/admin/enquiries/${id}`, { method: 'PATCH', body: { status: v } });
      router.refresh();
    } catch (err) {
      setValue(status);
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <select value={value} disabled={busy} onChange={(e) => change(e.target.value)} className="field !min-h-[34px] !w-auto !py-1 text-[13px]" aria-label={t.orders.status}>
      {['new', 'contacted', 'closed'].map((s) => (
        <option key={s} value={s}>
          {t.enquiries.statuses[s]}
        </option>
      ))}
    </select>
  );
}
