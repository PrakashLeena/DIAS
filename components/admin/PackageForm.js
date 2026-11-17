'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X, Loader2, Save, Search } from 'lucide-react';
import { packageInput } from '@/lib/validators';
import { useAdmin } from '@/contexts/AdminContext';
import { formatMoney } from '@/utils/format';
import { Card, BilingualField, Toggle, Alert, apiFetch, errorText } from './ui';
import ImageUploader from './ImageUploader';
import { DeleteButton } from './RowToggles';

const empty = { ta: '', en: '' };

export default function PackageForm({ pkg, products }) {
  const { t, lang, currency } = useAdmin();
  const router = useRouter();
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [query, setQuery] = useState('');
  const isEdit = !!pkg?._id;
  const byId = useMemo(() => new Map(products.map((p) => [p._id, p])), [products]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(packageInput),
    defaultValues: {
      name: pkg?.name || empty,
      shortDescription: pkg?.shortDescription || empty,
      description: pkg?.description || empty,
      slug: pkg?.slug || '',
      category: pkg?.category || 'wedding',
      coverImage: pkg?.coverImage || '',
      gallery: pkg?.gallery || [],
      items: (pkg?.items || []).map((i) => ({ product: String(i.product?._id || i.product), quantity: i.quantity })),
      packagePrice: pkg?.packagePrice ?? 0,
      isAvailable: pkg?.isAvailable ?? true,
      isPublished: pkg?.isPublished ?? true,
      isFeatured: pkg?.isFeatured ?? false,
      sortOrder: pkg?.sortOrder ?? 0,
      seo: { title: pkg?.seo?.title || empty, description: pkg?.seo?.description || empty },
    },
  });
  const items = useFieldArray({ control, name: 'items' });
  const watched = useWatch({ control, name: 'items' }) || [];
  const itemsValue = watched.reduce((s, i) => s + (byId.get(i.product)?.rentalPrice || 0) * (Number(i.quantity) || 0), 0);
  const chosen = new Set(watched.map((i) => i.product));
  const matches = query.trim()
    ? products.filter((p) => !chosen.has(p._id) && `${p.name.ta} ${p.name.en}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : [];

  const onSubmit = async (values) => {
    setError('');
    setOk('');
    if (!values.items.length) return setError(t.packages.noItems);
    try {
      const res = await apiFetch(isEdit ? `/api/admin/packages/${pkg._id}` : '/api/admin/packages', { method: isEdit ? 'PUT' : 'POST', body: values });
      setOk(t.common.saved);
      if (!isEdit) router.push(`/admin/packages/${res.item._id}`);
      router.refresh();
    } catch (err) {
      setError(err.message === 'noItems' ? t.packages.noItems : errorText(err, t));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-[1fr_340px]" noValidate>
      <div className="flex flex-col gap-6">
        <Card>
          <div className="flex flex-col gap-5">
            <BilingualField label={t.products.name} name="name" register={register} required errors={errors.name} />
            <BilingualField label={t.packages.shortDesc} name="shortDescription" register={register} multiline rows={2} />
            <BilingualField label={t.products.description} name="description" register={register} multiline rows={5} />
          </div>
        </Card>

        <Card title={t.packages.items}>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`${t.packages.addProduct}…`} className="field !pl-9" aria-label={t.packages.pickProduct} />
            {matches.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-white shadow-3" style={{ borderColor: 'var(--border-subtle)' }}>
                {matches.map((p) => (
                  <li key={p._id}>
                    <button
                      type="button"
                      onClick={() => {
                        items.append({ product: p._id, quantity: 1 });
                        setQuery('');
                      }}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[14px] hover:bg-champagne-100"
                    >
                      <span>
                        {p.name[lang] || p.name.en} <span className="text-ink-500">· {p.name[lang === 'ta' ? 'en' : 'ta']}</span>
                      </span>
                      <span className="flex items-center gap-1 text-ink-500">
                        {formatMoney(p.rentalPrice, currency)} <Plus className="h-4 w-4" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ul className="divide-y rounded-md border" style={{ borderColor: 'var(--border-subtle)' }}>
            {items.fields.map((f, i) => {
              const p = byId.get(watched[i]?.product);
              return (
                <li key={f.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <input type="hidden" {...register(`items.${i}.product`)} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink-900">{p ? p.name[lang] || p.name.en : '—'}</p>
                    <p className="text-[12.5px] text-ink-500">
                      {p && `${formatMoney(p.rentalPrice, currency)} · ${t.products.units[p.pricingUnit]}`}
                      {p && !p.isAvailable && <span className="ml-2 text-danger">{t.common.unavailable}</span>}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-[13px] text-ink-500">
                    {t.order.qty}
                    <input type="number" min="1" className="field !min-h-[38px] w-24 !py-1.5" {...register(`items.${i}.quantity`, { valueAsNumber: true })} />
                  </label>
                  <button type="button" onClick={() => items.remove(i)} className="rounded-full p-1.5 text-danger hover:bg-danger/10" aria-label={t.common.remove}>
                    <X className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
            {!items.fields.length && <li className="px-4 py-6 text-center text-[14px] text-ink-500">{t.packages.noItems}</li>}
          </ul>
          <p className="mt-3 text-[13px] text-ink-500">
            {t.packages.itemsValue}: <strong>{formatMoney(itemsValue, currency)}</strong>
          </p>
        </Card>

        <Card title={t.packages.gallery}>
          <div className="flex flex-col gap-5">
            <Controller control={control} name="coverImage" render={({ field }) => <ImageUploader label={t.packages.cover} multiple={false} value={field.value} onChange={field.onChange} />} />
            <Controller control={control} name="gallery" render={({ field }) => <ImageUploader label={t.packages.gallery} value={field.value} onChange={field.onChange} max={20} />} />
          </div>
        </Card>

        <Card title={t.products.seo}>
          <div className="flex flex-col gap-4">
            <BilingualField label={t.products.seoTitle} name="seo.title" register={register} maxLength={120} />
            <BilingualField label={t.products.seoDesc} name="seo.description" register={register} multiline rows={2} maxLength={320} />
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <div className="flex flex-col gap-4">
            <label>
              <span className="field-label">{t.packages.price}</span>
              <input type="number" min="0" className="field text-lg font-semibold" {...register('packagePrice', { valueAsNumber: true })} />
            </label>
            <label>
              <span className="field-label">{t.packages.category}</span>
              <select className="field" {...register('category')}>
                {Object.entries(t.packages.categories).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">{t.products.slug}</span>
              <input className="field" {...register('slug')} />
              <span className="field-hint">{t.products.slugHint}</span>
            </label>
            <label>
              <span className="field-label">{t.products.sortOrder}</span>
              <input type="number" className="field" {...register('sortOrder', { valueAsNumber: true })} />
            </label>
            <div className="flex flex-col gap-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
              {[
                ['isPublished', t.products.isPublished],
                ['isAvailable', t.products.isAvailable],
                ['isFeatured', t.common.featured],
              ].map(([f, label]) => (
                <Controller key={f} control={control} name={f} render={({ field }) => <Toggle id={f} checked={field.value} onChange={field.onChange} label={label} />} />
              ))}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary mt-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {isSubmitting ? t.common.saving : t.common.save}
            </button>
            <Alert kind="error">{error}</Alert>
            <Alert kind="ok">{ok}</Alert>
            {Object.keys(errors).length > 0 && <Alert kind="error">{Object.keys(errors).join(', ')}</Alert>}
            {isEdit && <DeleteButton endpoint={`/api/admin/packages/${pkg._id}`} redirectTo="/admin/packages" />}
          </div>
        </Card>
      </div>
    </form>
  );
}
