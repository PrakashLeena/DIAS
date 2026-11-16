'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { apiFetch, Toggle } from './ui';

/** Inline publish / feature / availability switches for product and package tables. */
export function RowToggles({ endpoint, item, fields = ['isPublished', 'isFeatured', 'isAvailable'] }) {
  const { t } = useAdmin();
  const router = useRouter();
  const [state, setState] = useState(() => Object.fromEntries(fields.map((f) => [f, !!item[f]])));
  const [busy, setBusy] = useState(false);
  const labels = { isPublished: t.common.published, isFeatured: t.common.featured, isAvailable: t.common.available };

  const change = async (field, value) => {
    setBusy(true);
    setState((s) => ({ ...s, [field]: value }));
    try {
      await apiFetch(endpoint, { method: 'PATCH', body: { [field]: value } });
      router.refresh();
    } catch (err) {
      setState((s) => ({ ...s, [field]: !value }));
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {fields.map((f) => (
        <Toggle key={f} id={`${item._id}-${f}`} checked={state[f]} disabled={busy} onChange={(v) => change(f, v)} label={<span className="text-[12.5px]">{labels[f]}</span>} />
      ))}
    </div>
  );
}

export function DeleteButton({ endpoint, redirectTo, label }) {
  const { t, lang } = useAdmin();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const onClick = async () => {
    if (!window.confirm(t.common.confirmDelete)) return;
    setBusy(true);
    try {
      await apiFetch(endpoint, { method: 'DELETE' });
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (err) {
      const d = err.data;
      if (d?.error === 'inUse') alert(`${t.products.inUse}\n${d.details.packages.map((p) => `• ${p[lang] || p.en}`).join('\n')}`);
      else if (d?.error === 'hasProducts') alert(t.categories.hasProducts);
      else alert(err.message);
      setBusy(false);
    }
  };
  return (
    <button type="button" onClick={onClick} disabled={busy} className="btn btn-sm !h-8 border-danger/30 bg-white text-danger hover:bg-danger/5" aria-label={label || t.common.delete}>
      <Trash2 className="h-4 w-4" /> {label !== '' && (label || t.common.delete)}
    </button>
  );
}
