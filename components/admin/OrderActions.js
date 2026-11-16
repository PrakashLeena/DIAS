'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, PartyPopper, Clock3, Loader2, Save } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { apiFetch, Alert } from './ui';

export default function OrderActions({ order }) {
  const { t, lang } = useAdmin();
  const router = useRouter();
  const [msg, setMsg] = useState(order.adminMessage || '');
  const [notes, setNotes] = useState(order.internalNotes || '');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState([]);
  const [ok, setOk] = useState('');

  const update = async (payload, key) => {
    if (payload.status === 'cancelled' && !window.confirm(t.order.confirmCancel)) return;
    setBusy(key);
    setError('');
    setConflict([]);
    setOk('');
    try {
      await apiFetch(`/api/admin/orders/${order._id}`, { method: 'PATCH', body: payload });
      setOk(t.common.saved);
      router.refresh();
    } catch (err) {
      if (err.data?.error === 'stockConflict') setConflict(err.data.details?.issues || []);
      else setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const buttons = [
    ['accepted', t.order.accept, CheckCircle2, 'bg-success text-white hover:bg-success/90 border-transparent'],
    ['completed', t.order.complete, PartyPopper, 'bg-info text-white hover:bg-info/90 border-transparent'],
    ['pending', t.order.pending, Clock3, 'btn-secondary'],
    ['cancelled', t.order.cancel, XCircle, 'border-danger/40 text-danger hover:bg-danger/5 bg-white'],
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2">
        {buttons.map(([status, label, Icon, cls]) => (
          <button key={status} type="button" disabled={!!busy || order.status === status} onClick={() => update({ status }, status)} className={`btn btn-sm !h-10 ${cls} disabled:opacity-40`}>
            {busy === status ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />} {label}
          </button>
        ))}
      </div>
      {conflict.length > 0 && (
        <div className="rounded-md bg-danger/10 p-3 text-[13.5px] text-danger" role="alert">
          <p className="font-medium">{t.order.stockConflict}</p>
          <ul className="mt-1 list-disc pl-5">
            {conflict.map((c) => (
              <li key={c.productId}>
                {c.name?.[lang] || c.name?.en} — {t.order.requested} {c.requested}, {t.order.availableNow} {c.available}
              </li>
            ))}
          </ul>
        </div>
      )}
      <label>
        <span className="field-label">{t.order.customerMessage}</span>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} maxLength={1000} className="field" />
      </label>
      <label>
        <span className="field-label">{t.order.internalNotes}</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} maxLength={4000} className="field bg-champagne-100/50" />
      </label>
      <button type="button" onClick={() => update({ adminMessage: msg, internalNotes: notes }, 'save')} disabled={!!busy} className="btn btn-primary">
        {busy === 'save' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {t.common.save}
      </button>
      <Alert kind="error">{error}</Alert>
      <Alert kind="ok">{ok}</Alert>
    </div>
  );
}
