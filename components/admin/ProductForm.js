'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X, Loader2, Save } from 'lucide-react';
import { productInput } from '@/lib/validators';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, BilingualField, Toggle, Alert, apiFetch, errorText } from './ui';
import ImageUploader from './ImageUploader';
import { DeleteButton } from './RowToggles';

const empty = { ta: '', en: '' };

export default function ProductForm({ product, categories }) {
  const { t, lang } = useAdmin();
  const router = useRouter();
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const isEdit = !!product?._id;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productInput),
    defaultValues: {
      name: product?.name || empty,
      description: product?.description || empty,
      slug: product?.slug || '',
      category: product?.category?._id || product?.category || categories[0]?._id || '',
      images: product?.images || [],
      rentalPrice: product?.rentalPrice ?? 0,
      pricingUnit: product?.pricingUnit || 'per_item',
      totalQuantity: product?.totalQuantity ?? 0,
      blockedQuantity: product?.blockedQuantity ?? 0,
      minOrderQuantity: product?.minOrderQuantity ?? 1,
      specifications: product?.specifications || [],
      isAvailable: product?.isAvailable ?? true,
      isPublished: product?.isPublished ?? true,
      isFeatured: product?.isFeatured ?? false,
      sortOrder: product?.sortOrder ?? 0,
      seo: { title: product?.seo?.title || empty, description: product?.seo?.description || empty },
    },
  });
  const specs = useFieldArray({ control, name: 'specifications' });

  const onSubmit = async (values) => {
    setError('');
    setOk('');
    try {
      const res = await apiFetch(isEdit ? `/api/admin/products/${product._id}` : '/api/admin/products', { method: isEdit ? 'PUT' : 'POST', body: values });
      setOk(t.common.saved);
      if (!isEdit) router.push(`/admin/products/${res.item._id}`);
      router.refresh();
    } catch (err) {
      setError(errorText(err, t));
    }
  };

  const num = (name, label, extra = {}) => (
    <label>
      <span className="field-label">{label}</span>
      <input type="number" step="any" min="0" className="field" {...register(name, { valueAsNumber: true })} {...extra} />
      {errors[name] && <p className="field-error">{errors[name].message}</p>}
    </label>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-[1fr_340px]" noValidate>
      <div className="flex flex-col gap-6">
        <Card>
          <div className="flex flex-col gap-5">
            <BilingualField label={t.products.name} name="name" register={register} required errors={errors.name} maxLength={160} />
            <BilingualField label={t.products.description} name="description" register={register} multiline rows={5} errors={errors.description} />
            <Controller control={control} name="images" render={({ field }) => <ImageUploader label={t.products.images} value={field.value} onChange={field.onChange} />} />
          </div>
        </Card>
        <Card title={t.products.price}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {num('rentalPrice', t.products.price)}
            <label>
              <span className="field-label">{t.products.unit}</span>
              <select className="field" {...register('pricingUnit')}>
                {Object.entries(t.products.units).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            {num('minOrderQuantity', t.products.minQty)}
            {num('totalQuantity', t.products.totalQty)}
            {num('blockedQuantity', t.products.blockedQty)}
            {num('sortOrder', t.products.sortOrder)}
          </div>
        </Card>
        <Card
          title={t.products.specs}
          actions={
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => specs.append({ label: empty, value: empty })}>
              <Plus className="h-4 w-4" /> {t.products.addSpec}
            </button>
          }
        >
          <div className="flex flex-col gap-4">
            {specs.fields.map((f, i) => (
              <div key={f.id} className="relative rounded-md border bg-ivory-50 p-4 pr-12" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="grid gap-3">
                  <BilingualField label={t.products.specLabel} name={`specifications.${i}.label`} register={register} />
                  <BilingualField label={t.products.specValue} name={`specifications.${i}.value`} register={register} />
                </div>
                <button type="button" onClick={() => specs.remove(i)} className="absolute right-3 top-3 rounded-full p-1.5 text-danger hover:bg-danger/10" aria-label={t.common.remove}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {!specs.fields.length && <p className="text-[14px] text-ink-500">{t.common.none}</p>}
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
              <span className="field-label">{t.products.category}</span>
              <select className="field" {...register('category')}>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name[lang] || c.name.en}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">{t.products.slug}</span>
              <input className="field" {...register('slug')} />
              <span className="field-hint">{t.products.slugHint}</span>
            </label>
            <div className="flex flex-col gap-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
              {['isPublished', 'isAvailable', 'isFeatured'].map((f) => (
                <Controller key={f} control={control} name={f} render={({ field }) => <Toggle id={f} checked={field.value} onChange={field.onChange} label={t.products[f]} />} />
              ))}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary mt-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {isSubmitting ? t.common.saving : t.common.save}
            </button>
            <Alert kind="error">{error}</Alert>
            <Alert kind="ok">{ok}</Alert>
            {Object.keys(errors).length > 0 && <Alert kind="error">{Object.keys(errors).join(', ')}</Alert>}
            {isEdit && <DeleteButton endpoint={`/api/admin/products/${product._id}`} redirectTo="/admin/products" />}
          </div>
        </Card>
      </div>
    </form>
  );
}
