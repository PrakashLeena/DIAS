'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Loader2, Save, X } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { CATEGORY_ICONS } from '@/components/ui/CategoryIcon';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { Card, BilingualField, Toggle, Alert, apiFetch, errorText } from './ui';
import ImageUploader from './ImageUploader';
import { DeleteButton } from './RowToggles';

const blank = { name: { ta: '', en: '' }, description: { ta: '', en: '' }, slug: '', image: '', icon: 'sparkles', sortOrder: 0, isActive: true };

export default function CategoryManager({ categories }) {
  const { t, lang } = useAdmin();
  const router = useRouter();
  const [editing, setEditing] = useState(null); // null | 'new' | id
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const start = (c) => {
    setError('');
    setEditing(c ? c._id : 'new');
    setForm(c ? { name: c.name, description: c.description || blank.description, slug: c.slug, image: c.image || '', icon: c.icon || 'sparkles', sortOrder: c.sortOrder || 0, isActive: c.isActive } : { ...blank, sortOrder: categories.length + 1 });
  };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      await apiFetch(editing === 'new' ? '/api/admin/categories' : `/api/admin/categories/${editing}`, { method: editing === 'new' ? 'POST' : 'PUT', body: { ...form, sortOrder: Number(form.sortOrder) || 0 } });
      setEditing(null);
      router.refresh();
    } catch (err) {
      setError(errorText(err, t));
    } finally {
      setBusy(false);
    }
  };

  const editor = (
    <Card title={editing === 'new' ? t.categories.new : t.common.edit} className="mb-6">
      <div className="flex flex-col gap-4">
        <BilingualField label={t.products.name} value={form.name} onChange={(v) => set('name', v)} required />
        <BilingualField label={t.products.description} value={form.description} onChange={(v) => set('description', v)} multiline rows={2} />
        <div className="grid gap-4 sm:grid-cols-3">
          <label>
            <span className="field-label">{t.categories.icon}</span>
            <select className="field" value={form.icon} onChange={(e) => set('icon', e.target.value)}>
              {Object.keys(CATEGORY_ICONS).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">{t.products.slug}</span>
            <input className="field" value={form.slug} onChange={(e) => set('slug', e.target.value)} />
          </label>
          <label>
            <span className="field-label">{t.products.sortOrder}</span>
            <input type="number" className="field" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
          </label>
        </div>
        <ImageUploader label={t.categories.image} multiple={false} value={form.image} onChange={(v) => set('image', v)} />
        <Toggle id="cat-active" checked={form.isActive} onChange={(v) => set('isActive', v)} label={t.categories.active} />
        <Alert kind="error">{error}</Alert>
        <div className="flex gap-2">
          <button type="button" onClick={save} disabled={busy} className="btn btn-primary">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {t.common.save}
          </button>
          <button type="button" onClick={() => setEditing(null)} className="btn btn-secondary">
            <X className="h-4 w-4" /> {t.common.cancel}
          </button>
        </div>
      </div>
    </Card>
  );

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-sans text-[24px] font-semibold text-ink-900">{t.categories.title}</h1>
        <button type="button" onClick={() => start(null)} className="btn btn-primary">
          <Plus className="h-4 w-4" /> {t.categories.new}
        </button>
      </div>
      {editing && editor}
      <div className="overflow-x-auto rounded-lg border bg-white shadow-1" style={{ borderColor: 'var(--border-subtle)' }}>
        <table className="w-full min-w-[640px] text-left text-[14px]">
          <thead className="bg-ivory-50 text-[12px] uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-3 py-3">{t.products.name}</th>
              <th className="px-3 py-3">{t.categories.products}</th>
              <th className="px-3 py-3">{t.categories.active}</th>
              <th className="px-4 py-3">{t.common.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {categories.map((c) => (
              <tr key={c._id} className="hover:bg-ivory-50">
                <td className="px-4 py-3 text-ink-500">{c.sortOrder}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-maroon-100 text-maroon-600">
                      <CategoryIcon name={c.icon} className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-medium text-ink-900">{c.name.ta}</p>
                      <p className="text-[12.5px] text-ink-500">{c.name.en}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">{c.productCount}</td>
                <td className="px-3 py-3">{c.isActive ? t.common.yes : t.common.no}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => start(c)} className="btn btn-secondary btn-sm !h-8">
                      <Pencil className="h-3.5 w-3.5" /> {t.common.edit}
                    </button>
                    <DeleteButton endpoint={`/api/admin/categories/${c._id}`} label="" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="sr-only">{lang}</p>
    </>
  );
}
