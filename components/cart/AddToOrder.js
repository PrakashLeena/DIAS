'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLang } from '@/contexts/LangContext';

export function QuantityStepper({ value, onChange, min = 1, max = 10000, size = 'md', label }) {
  const { dict } = useLang();
  const h = size === 'sm' ? 'h-9' : 'h-11';
  return (
    <div className={`inline-flex ${h} items-stretch overflow-hidden rounded-full border bg-white`} style={{ borderColor: 'var(--border-strong)' }}>
      <button type="button" className="px-3 text-ink-700 hover:bg-champagne-100 disabled:opacity-40" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={dict.common.decrease}>
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-label={label || dict.common.quantity}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isFinite(n) ? Math.min(max, Math.max(0, n)) : min);
        }}
        onBlur={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!Number.isFinite(n) || n < min) onChange(min);
        }}
        className="w-14 border-x text-center text-[15px] font-medium text-ink-900 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        style={{ borderColor: 'var(--border-subtle)' }}
      />
      <button type="button" className="px-3 text-ink-700 hover:bg-champagne-100 disabled:opacity-40" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={dict.common.increase}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Product purchase controls: quantity + "Add to custom order" + "Book now". */
export function ProductOrderControls({ product, withQuantity = true, compact = false }) {
  const { dict, href } = useLang();
  const { addItem } = useCart();
  const router = useRouter();
  const minQty = product.minOrderQuantity || 1;
  const [qty, setQty] = useState(minQty);
  const [added, setAdded] = useState(false);
  const disabled = !product.isAvailable;

  const item = () => ({
    type: 'product',
    id: product._id,
    quantity: Math.max(minQty, qty),
    snapshot: { name: product.name, price: product.rentalPrice, pricingUnit: product.pricingUnit, image: product.images?.[0] || '', slug: product.slug, minQty },
  });

  const add = () => {
    addItem(item(), { source: 'builder' });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };
  const book = () => {
    addItem(item());
    router.push(href('/checkout'));
  };

  if (compact) {
    return (
      <button type="button" onClick={add} disabled={disabled} className="btn btn-secondary btn-sm w-full">
        {added ? <Check className="h-4 w-4 text-success" /> : <ShoppingBag className="h-4 w-4" />}
        {added ? dict.common.added : dict.common.addToOrder}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {withQuantity && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-ink-700">{dict.common.quantity}</span>
          <QuantityStepper value={qty} onChange={setQty} min={minQty} />
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={add} disabled={disabled} className="btn btn-secondary h-auto min-h-[46px] flex-1 whitespace-normal py-2 text-center" aria-live="polite">
          {added ? <Check className="h-4 w-4 text-success" /> : <Plus className="h-4 w-4" />}
          {added ? dict.common.added : dict.common.addToCustom}
        </button>
        <button type="button" onClick={book} disabled={disabled} className="btn btn-primary h-auto min-h-[46px] flex-1 whitespace-normal py-2 text-center">
          {dict.common.bookNow} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/** Package controls: "Book now" and optionally "Customize this package". */
export function PackageOrderControls({ pkg, showCustomize = false, variant = 'card' }) {
  const { dict, href } = useLang();
  const { addItem, loadPackageContents } = useCart();
  const router = useRouter();
  const disabled = !pkg.isAvailable;

  const book = () => {
    addItem({ type: 'package', id: pkg._id, quantity: 1, snapshot: { name: pkg.name, price: pkg.packagePrice, pricingUnit: 'per_event', image: pkg.coverImage, slug: pkg.slug } });
    router.push(href('/checkout'));
  };
  const customize = () => {
    loadPackageContents(
      (pkg.items || [])
        .filter((i) => i.product)
        .map((i) => ({
          id: i.product._id,
          quantity: i.quantity,
          snapshot: { name: i.product.name, price: i.product.rentalPrice, pricingUnit: i.product.pricingUnit, image: i.product.images?.[0] || '', slug: i.product.slug, minQty: 1 },
        }))
    );
    router.push(href('/custom-package'));
  };

  return (
    <div className={`flex gap-3 ${variant === 'card' ? 'flex-row' : 'flex-col sm:flex-row'}`}>
      <button type="button" onClick={book} disabled={disabled} className={`btn ${variant === 'featured' ? 'btn-gold' : 'btn-primary'} h-auto min-h-[46px] flex-1 whitespace-normal py-2 text-center`}>
        {dict.common.bookNow}
      </button>
      {showCustomize && (
        <button type="button" onClick={customize} disabled={disabled} className={`btn ${variant === 'featured' ? 'btn-glass' : 'btn-secondary'} h-auto min-h-[46px] flex-1 whitespace-normal py-2 text-center`}>
          {dict.packages.customize}
        </button>
      )}
    </div>
  );
}
