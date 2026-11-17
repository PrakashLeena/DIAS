import Link from 'next/link';

export default function AdminPagination({ page, pages, base, params, t }) {
  if (pages <= 1) return null;
  const href = (p) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
    q.set('page', String(p));
    return `${base}?${q}`;
  };
  return (
    <nav className="mt-4 flex items-center justify-between text-[14px]">
      <span className="text-ink-500">
        {t.common.page} {page} / {pages}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link className="btn btn-secondary btn-sm" href={href(page - 1)}>
            {t.common.prev}
          </Link>
        )}
        {page < pages && (
          <Link className="btn btn-secondary btn-sm" href={href(page + 1)}>
            {t.common.next}
          </Link>
        )}
      </div>
    </nav>
  );
}
