'use client';

import Image from 'next/image';

/** Tamil name (large) with the English name underneath. */
export function Bi({ n, ta, en, className = '', taClass = '', enClass = '' }) {
  const t = ta ?? n?.ta;
  const e = en ?? n?.en;
  return (
    <span className={`block ${className}`}>
      {t && <span className={`block ${taClass}`}>{t}</span>}
      {e && <span className={`block text-[0.8em] font-normal text-ink-500 ${enClass}`}>{e}</span>}
    </span>
  );
}

/** Photo that fills its (relatively positioned) parent; shows a branded emoji placeholder when there is no image. */
export function Photo({ src, alt = '', emoji = '📷', Icon = null, sizes = '(max-width: 640px) 50vw, 25vw', priority = false, className = '' }) {
  if (!src) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-champagne-100 via-champagne-200 to-[#E6D3AB] ${className}`} role="img" aria-label={alt}>
        {Icon ? <Icon className="h-[clamp(36px,8vw,60px)] w-[clamp(36px,8vw,60px)] text-champagne-600 opacity-70" strokeWidth={1.3} aria-hidden /> : (<span className="select-none text-[clamp(40px,9vw,72px)] opacity-80 drop-shadow-sm" aria-hidden>{emoji}</span>)}
      </div>
    );
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />;
}

export function Stars({ value, size = 18, className = '' }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-label={`${value} / 5`} role="img">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ fontSize: size, lineHeight: 1, color: i <= value ? '#D4A845' : '#D9CDBA' }} aria-hidden>
          ★
        </span>
      ))}
    </span>
  );
}
