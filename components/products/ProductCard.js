import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { ProductOrderControls } from '@/components/cart/AddToOrder';
import { localePath, tr } from '@/lib/i18n/config';
import { formatMoney } from '@/utils/format';

export default function ProductCard({ product, lang, dict, currency }) {
  const url = localePath(lang, `/products/${product.slug}`);
  return (
    <article className="card card-hover flex h-full flex-col">
      <Link href={url} className="relative block aspect-[4/3] overflow-hidden bg-champagne-100">
        <SmartImage src={product.images?.[0]} alt={tr(product.name, lang)} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="transition-transform duration-700 ease-out hover:scale-105" />
        {product.isFeatured && <span className="badge absolute left-3 top-3 bg-ink-900/75 text-gold-300">{dict.common.featured}</span>}
        {!product.isAvailable && <span className="badge absolute right-3 top-3 bg-danger text-white">{dict.common.unavailable}</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        {product.category?.name && <p className="text-[11.5px] font-medium uppercase tracking-[.14em] text-gold-700 [:lang(ta)_&]:normal-case [:lang(ta)_&]:tracking-normal">{tr(product.category.name, lang)}</p>}
        <h3 className="text-[21px] leading-snug [:lang(ta)_&]:text-[17px]">
          <Link href={url} className="hover:text-maroon-600">
            {tr(product.name, lang)}
          </Link>
        </h3>
        <p className="mt-auto flex items-baseline gap-1.5 pt-1">
          <span className="font-display text-[24px] font-semibold text-maroon-600">{formatMoney(product.rentalPrice, currency)}</span>
          <span className="text-[13px] text-ink-500">/ {dict.common[product.pricingUnit]}</span>
        </p>
        <ProductOrderControls product={product} compact />
      </div>
    </article>
  );
}
