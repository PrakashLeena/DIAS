import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, basePath, params = {}, dict }) {
  if (pages <= 1) return null;
  const hrefFor = (p) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    if (p > 1) q.set('page', String(p));
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const nums = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) nums.push(i);
  const cls = 'flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm';
  return (
    <nav aria-label={dict.common.page} className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className={`${cls} bg-white hover:bg-champagne-100`} rel="prev" aria-label={dict.common.prev}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
      {nums.map((n) => (
        <Link key={n} href={hrefFor(n)} aria-current={n === page ? 'page' : undefined} className={`${cls} ${n === page ? 'border-maroon-600 bg-maroon-600 text-white' : 'bg-white hover:bg-champagne-100'}`}>
          {n}
        </Link>
      ))}
      {page < pages && (
        <Link href={hrefFor(page + 1)} className={`${cls} bg-white hover:bg-champagne-100`} rel="next" aria-label={dict.common.next}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
