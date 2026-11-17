import Link from 'next/link';
import { Check } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { PackageOrderControls } from '@/components/cart/AddToOrder';
import { localePath, tr } from '@/lib/i18n/config';
import { formatMoney } from '@/utils/format';

export default function PackageCard({ pkg, lang, dict, currency, featured = false }) {
  const url = localePath(lang, `/packages/${pkg.slug}`);
  const items = (pkg.items || []).filter((i) => i.product);
  const dark = featured;
  return (
    <article className={`card card-hover flex h-full flex-col ${dark ? '!bg-ink-900 text-[#FFF8EC]' : ''}`} style={dark ? { borderColor: 'rgba(212,168,69,.45)' } : undefined}>
      <Link href={url} className="relative block aspect-[4/3] overflow-hidden" tabIndex={-1} aria-hidden>
        <SmartImage src={pkg.coverImage} alt={tr(pkg.name, lang)} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="transition-transform duration-700 ease-out hover:scale-105" />
        <span className={`badge absolute left-4 top-4 ${dark ? 'bg-ink-900/70 text-gold-300' : 'bg-white/90 text-ink-700'}`}>{dict.packages.categories[pkg.category] || pkg.category}</span>
        {!pkg.isAvailable && <span className="badge absolute right-4 top-4 bg-danger text-white">{dict.common.unavailable}</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-6 sm:p-7">
        <div>
          <h3 className={`text-[28px] leading-tight [:lang(ta)_&]:text-[22px] ${dark ? '!text-[#FFF8EC]' : ''}`}>
            <Link href={url} className="hover:underline">
              {tr(pkg.name, lang)}
            </Link>
          </h3>
          {tr(pkg.shortDescription, lang) && <p className={`mt-2 text-[15px] font-light ${dark ? 'text-[color:var(--text-on-dark-muted)]' : 'text-ink-500'}`}>{tr(pkg.shortDescription, lang)}</p>}
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-[13px] ${dark ? 'opacity-70' : 'text-ink-500'}`}>{dict.common.startingFrom}</span>
          <span className={`font-display text-[32px] font-semibold ${dark ? 'text-gold-300' : 'text-maroon-600'}`}>{formatMoney(pkg.packagePrice, currency)}</span>
        </div>
        <ul className="flex flex-1 flex-col gap-2">
          {items.slice(0, 5).map((i) => (
            <li key={i.product._id} className="flex gap-2.5 text-[15px] font-light leading-snug">
              <Check className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? 'text-gold-300' : 'text-gold-500'}`} aria-hidden />
              <span>
                <strong className="font-medium">{i.quantity}</strong> × {tr(i.product.name, lang)}
              </span>
            </li>
          ))}
          {items.length > 5 && <li className={`pl-6 text-sm ${dark ? 'text-gold-300' : 'text-gold-700'}`}>+ {items.length - 5} {dict.common.items}</li>}
        </ul>
        <div className="flex flex-col gap-3">
          <Link href={url} className={`btn ${dark ? 'btn-glass' : 'btn-secondary'} w-full`}>
            {dict.common.viewDetails}
          </Link>
          <PackageOrderControls pkg={pkg} variant={dark ? 'featured' : 'card'} />
        </div>
      </div>
    </article>
  );
}
