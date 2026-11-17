'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Plus, Trash2, Info, PackageOpen } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLang } from '@/contexts/LangContext';
import useMoney from '@/hooks/useMoney';
import { tr } from '@/lib/i18n/config';
import SmartImage from '@/components/ui/SmartImage';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { QuantityStepper } from '@/components/cart/AddToOrder';

export default function CustomBuilder({ catalog }) {
  const { lang, dict, href } = useLang();
  const money = useMoney();
  const router = useRouter();
  const cart = useCart();
  const [step, setStep] = useState(0);
  const category = catalog[step];

  const productIndex = useMemo(() => {
    const m = new Map();
    for (const c of catalog) for (const p of c.products) m.set(p._id, p);
    return m;
  }, [catalog]);

  const selected = cart.items.filter((i) => i.type === 'product');
  const packages = cart.items.filter((i) => i.type === 'package');
  const qtyOf = (id) => selected.find((i) => i.id === id)?.quantity || 0;
  // Prefer live catalogue prices over the stored snapshot.
  const priceOf = (i) => productIndex.get(i.id)?.rentalPrice ?? i.snapshot?.price ?? 0;
  const subtotal = selected.reduce((s, i) => s + priceOf(i) * i.quantity, 0);
  const pkgTotal = packages.reduce((s, i) => s + (i.snapshot?.price || 0) * i.quantity, 0);
  const total = subtotal + pkgTotal;
  const hasPerDay = selected.some((i) => (productIndex.get(i.id)?.pricingUnit || i.snapshot?.pricingUnit) === 'per_day');

  const add = (p, qty) =>
    cart.addItem(
      { type: 'product', id: p._id, quantity: qty, snapshot: { name: p.name, price: p.rentalPrice, pricingUnit: p.pricingUnit, image: p.images?.[0] || '', slug: p.slug, minQty: p.minOrderQuantity || 1 } },
      { source: 'builder' }
    );
  const setQty = (p, q) => {
    const min = p.minOrderQuantity || 1;
    if (q <= 0) cart.removeItem('product', p._id);
    else if (!qtyOf(p._id)) add(p, Math.max(min, q));
    else cart.setQuantity('product', p._id, Math.max(min, q));
  };

  const goCheckout = () => {
    cart.setSource('builder');
    router.push(href('/checkout'));
  };

  if (!catalog.length) return <p className="rounded-xl border border-dashed bg-white p-10 text-center text-ink-500">{dict.builder.noProducts}</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
      <div className="min-w-0">
        {/* Steps */}
        <ol className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0" aria-label={dict.builder.allSteps}>
          {catalog.map((c, i) => {
            const count = c.products.filter((p) => qtyOf(p._id) > 0).length;
            return (
              <li key={c._id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  aria-current={i === step ? 'step' : undefined}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-[14px] transition-colors ${i === step ? 'border-maroon-600 bg-maroon-600 text-white' : 'bg-white text-ink-700 hover:bg-champagne-100'}`}
                  style={i === step ? undefined : { borderColor: 'var(--border-strong)' }}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${i === step ? 'bg-white/20' : 'bg-champagne-100'}`}>{count ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
                  {tr(c.name, lang)}
                  {count > 0 && <span className="text-[12px] opacity-80">({count})</span>}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-maroon-100 text-maroon-600">
            <CategoryIcon name={category.icon} className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[12px] uppercase tracking-[.18em] text-gold-700 [:lang(ta)_&]:normal-case [:lang(ta)_&]:tracking-normal">
              {dict.builder.step} {step + 1} / {catalog.length}
            </p>
            <h2 className="text-[28px] leading-tight [:lang(ta)_&]:text-[22px]">{tr(category.name, lang)}</h2>
          </div>
        </div>

        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {category.products.map((p) => {
            const q = qtyOf(p._id);
            const min = p.minOrderQuantity || 1;
            return (
              <li key={p._id} className={`card flex gap-4 p-3 ${q ? 'ring-2 ring-gold-500' : ''} ${!p.isAvailable ? 'opacity-60' : ''}`}>
                <span className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-champagne-100 sm:h-28 sm:w-28">
                  <SmartImage src={p.images?.[0]} alt={tr(p.name, lang)} sizes="112px" quality={60} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="text-[18px] leading-snug [:lang(ta)_&]:text-[15px]">{tr(p.name, lang)}</h3>
                  <p className="mt-0.5 text-[14px]">
                    <span className="font-semibold text-maroon-600">{money(p.rentalPrice)}</span> <span className="text-ink-500">/ {dict.common[p.pricingUnit]}</span>
                  </p>
                  {!p.isAvailable && <p className="text-[12px] text-danger">{dict.common.unavailable}</p>}
                  <div className="mt-auto pt-2">
                    {q ? (
                      <QuantityStepper value={q} onChange={(v) => setQty(p, v)} min={0} size="sm" label={`${dict.common.quantity}: ${tr(p.name, lang)}`} />
                    ) : (
                      <button type="button" onClick={() => add(p, min)} disabled={!p.isAvailable} className="btn btn-secondary btn-sm">
                        <Plus className="h-4 w-4" /> {dict.builder.add}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex justify-between gap-3">
          <button type="button" className="btn btn-secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            {dict.common.prev}
          </button>
          {step < catalog.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
              {dict.common.next} <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" className="btn btn-gold" onClick={goCheckout} disabled={!cart.items.length}>
              {dict.builder.continue} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <aside className="min-w-0 overflow-hidden rounded-xl bg-ink-900 text-[#FFF8EC] shadow-3 lg:sticky lg:top-24" aria-labelledby="summary-title">
        <div className="flex items-center justify-between gap-3 border-b px-6 py-5" style={{ borderColor: 'var(--border-glass)' }}>
          <h2 id="summary-title" className="text-[26px] !text-[#FFF8EC] [:lang(ta)_&]:text-[20px]">{dict.builder.yourPackage}</h2>
          {cart.items.length > 0 && (
            <button type="button" onClick={cart.clear} className="text-[13px] text-[color:var(--text-on-dark-muted)] underline-offset-2 hover:underline">
              {dict.builder.clearAll}
            </button>
          )}
        </div>
        <div className="max-h-[50vh] overflow-y-auto px-6 py-2 lg:max-h-[calc(100vh-380px)]">
          {!cart.hydrated ? (
            <p className="py-6 text-sm text-[color:var(--text-on-dark-muted)]">{dict.common.loading}</p>
          ) : !cart.items.length ? (
            <div className="flex flex-col items-center py-8 text-center text-[color:var(--text-on-dark-muted)]">
              <PackageOpen className="h-10 w-10 opacity-60" strokeWidth={1.4} />
              <p className="mt-3 text-sm">{dict.builder.empty}</p>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--border-glass)' }}>
              {packages.map((i) => (
                <li key={i.id} className="flex items-start justify-between gap-3 py-3 text-[14px]" style={{ borderColor: 'var(--border-glass)' }}>
                  <div>
                    <span className="badge mb-1 bg-gold-500/20 !px-2 !py-0.5 text-[10.5px] text-gold-300">{dict.cart.package}</span>
                    <p className="font-medium">{tr(i.snapshot?.name, lang)}</p>
                    <p className="text-[12.5px] text-[color:var(--text-on-dark-muted)]">× {i.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap">{money((i.snapshot?.price || 0) * i.quantity)}</span>
                    <button type="button" onClick={() => cart.removeItem('package', i.id)} aria-label={dict.common.remove} className="rounded-full p-1.5 hover:bg-white/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
              {selected.map((i) => {
                const p = productIndex.get(i.id);
                const unit = priceOf(i);
                return (
                  <li key={i.id} className="py-3 text-[14px]" style={{ borderColor: 'var(--border-glass)' }}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium">{tr(p?.name || i.snapshot?.name, lang)}</p>
                      <span className="whitespace-nowrap font-medium">{money(unit * i.quantity)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-[12.5px] text-[color:var(--text-on-dark-muted)]">
                        {money(unit)} / {dict.common[p?.pricingUnit || i.snapshot?.pricingUnit]}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="text-ink-900">
                          <QuantityStepper value={i.quantity} onChange={(v) => (p ? setQty(p, v) : cart.setQuantity('product', i.id, v))} min={0} size="sm" />
                        </div>
                        <button type="button" onClick={() => cart.removeItem('product', i.id)} aria-label={dict.common.remove} className="rounded-full p-1.5 hover:bg-white/10">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="border-t px-6 py-5" style={{ borderColor: 'var(--border-glass)' }}>
          <div className="flex justify-between text-[14px] text-[color:var(--text-on-dark-muted)]">
            <span>{dict.common.subtotal}</span>
            <span>{money(total)}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[14px]">{dict.common.estimatedTotal}</span>
            <span className="font-display text-[38px] font-semibold leading-none text-gold-300">{money(total)}</span>
          </div>
          {hasPerDay && (
            <p className="mt-3 flex gap-2 text-[12.5px] text-[color:var(--text-on-dark-muted)]">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {dict.builder.perDayNote}
            </p>
          )}
          <button type="button" onClick={goCheckout} disabled={!cart.items.length} className="btn btn-gold mt-5 w-full">
            {dict.builder.continue} <ArrowRight className="h-4 w-4" />
          </button>
          <Link href={href('/products')} className="mt-3 block text-center text-[13px] text-[color:var(--text-on-dark-muted)] hover:text-gold-300">
            + {dict.common.exploreProducts}
          </Link>
        </div>
      </aside>
    </div>
  );
}
